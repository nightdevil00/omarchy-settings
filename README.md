# Omarchy Settings

A standalone Quickshell app that configures the parts of Omarchy a user is
likely to touch: Hyprland behaviour, monitors, the shell bar, plugins, idle
timing, night light, updates, and a read-only system summary.

It is not a shell plugin. It runs as its own Quickshell configuration
(`omarchy-settings`), so it can open, close, and crash without taking the
desktop shell with it. The one thing it keeps in common with the shell is the
design language, which it borrows from the shell's own `qs.Commons` tokens.

```
~/.local/bin/omarchy-settings        →  qs -n -c omarchy-settings
```

## Install

Quickshell discovers configs as `<xdg>/quickshell/<name>/shell.qml`, so the
intended install is a clone at `~/.config/quickshell/omarchy-settings`:

```sh
git clone https://github.com/nightdevil00/omarchy-settings.git \
  ~/.config/quickshell/omarchy-settings
cd ~/.config/quickshell/omarchy-settings
./setup.sh
```

`setup.sh` links `Ui/` and `Commons/` from the Omarchy shell, where the design
tokens live, and installs the launcher. Those two are not committed because
they are absolute links into `$OMARCHY_PATH`.

## Running it

- Launcher: `~/.local/bin/omarchy-settings` (a thin `exec qs -n -c omarchy-settings`).
- Menu: a **Settings** entry is appended to the Omarchy menu in
  `~/.config/omarchy/extensions/omarchy-menu.jsonc`. The menu watches that file,
  so edits apply without a restart.
- Directly: `qs -n -c omarchy-settings` from a terminal.

The app itself is the config rooted at `~/.config/quickshell/omarchy-settings`.
`Ui/` and `Commons/` are symlinks to `/usr/share/omarchy/shell/{Ui,Commons}` so
`import qs.Ui` / `import qs.Commons` resolve inside this config the same way
they do inside the shell.

## How it works

Three models, one loop.

```
                     read                          write
  hyprctl -j getoption ──► SettingsStore ◄── controls ──► managed{}
  omarchy CLI / shell.json ─► Omarchy                        │
                                                             ▼
                                            ~/.config/hypr/settings.lua
                                                             │
                                          marker in ~/.config/hypr/hyprland.lua
                                                             │
                                                    hyprctl reload
```

### Reading live values

- `SettingsStore` reads every Hyprland option declared in the schema with a
  single batched `hyprctl -j getoption <name>` call. The JSON answer's
  `bool`/`int`/`float`/`str` field becomes the effective value.
- `Omarchy` (the singleton) reads everything that is not a Hyprland option:
  themes and fonts (`omarchy theme/font list|current`), monitors
  (`hyprctl -j monitors all`), plugins (`omarchy plugin list --json`), the bar
  and idle timing (`shell.json`, watched live), night light, version, the
  fastfetch summary, and the update channel/availability.

### Writing values

Every change goes through `SettingsStore.set()` (or `setMonitor()`), which
updates an in-memory `managed` map, then schedules an apply. A 120 ms debounce
coalesces bursts of changes (dragging a slider) into one write.

1. **Regenerate `~/.config/hypr/settings.lua`** from `managed` plus the monitor
   overrides, via `model/Lua.js`. Only changed values are emitted, so removing
   a setting removes its line and the original value applies again.
2. **Ensure the loader** — append the idempotent block

   ```lua
   -- omarchy-settings:load
   require("hypr.settings")
   ```

   to `~/.config/hypr/hyprland.lua` so `settings.lua` is required *last* and
   wins over Omarchy defaults and the user's own files. When nothing is
   managed, the block is removed again. The app never edits the user's other
   config, only this marker block.
3. **Persist intent** to `~/.local/state/omarchy/settings/hypr.json`
   (`{ managed, monitors }`). The UI reads `managed` back first, so controls
   respond instantly rather than after the reload round-trip.
4. **Reload** — `hyprctl reload`, then read `hyprctl configerrors`. A clean
   result shows **Applied**; anything else surfaces the errors in the status
   bar.

`Reset` on a row drops it from `managed`; `Reset all` empties the map and
removes the loader block, returning full control to the user's own files.

### Schema as data

`model/Schema.js` is the whole settings surface. The generic UI renders it;
there are no hand-written rows for the four core pages.

```js
{ id: "decoration.rounding", page: "appearance", group: "Shape",
  label: "Corner radius", desc: "…",
  type: "int", hypr: "decoration:rounding", lua: ["decoration", "rounding"],
  default: 0, min: 0, max: 40, step: 1, unit: "px" }
```

| field | meaning |
|-------|---------|
| `id` | unique key and persistence key |
| `page` / `group` | page and section heading |
| `label` / `desc` | row title and muted help text |
| `type` | `bool` \| `int` \| `float` \| `enum` \| `string` |
| `hypr` | `hyprctl getoption` name; omit for app-only values |
| `lua` | path into the `hl.config({...})` table |
| `default` | shown (and compared) when the value is not managed |
| `min` / `max` / `step` / `unit` / `percent` | numeric control hints |
| `options` | `[{value,label}]` for enums |
| `leaf` | emit as `hl.animation()` instead of a config path |

Helper functions at the bottom of the file — `settingById`, `groupsForPage`,
`hyprOptions`, `matchingSettings`, `pageHasMatch` — drive the controls and the
search index.

## The interface

- **Sidebar** — pages from `Schema.pages`, with the square Omarchy glyph and a
  search field. Typing filters pages and settings; results come from
  `Schema.matchingSettings`.
- **Keyboard** — Up/Down walk the focus chain, Tab moves between controls,
  Enter/Space activate. Escape quits.
- **Generic pages** (`appearance`, `window`, `motion`, `input`) are rendered
  from the schema by `GenericPage` + `SettingRow`, using `SwitchControl`,
  `SegmentedControl`, and `ValueSlider`.
- **Custom pages** are hand-built where the schema model does not fit. See the
  table below.
- **Status bar** shows a summary of managed settings and the last apply result,
  including Hyprland config errors.

### Pages

| Page | Kind | What it covers |
|------|------|----------------|
| Appearance | generic | rounding, opacity, dim, blur, shadows, theme, font |
| Window | generic | gaps, borders, layout, tearing, resize |
| Motion | generic | animation speeds and styles |
| Input | generic | mouse, touchpad, keyboard repeat |
| Display | custom | monitor enable/mode/scale/position + arrangement canvas |
| Bar & Plugins | custom | bar position/transparency, plugins, bar layout |
| Idle & Lock | custom | screensaver and lock timing |
| Night Light | custom | on/off and colour temperature (hyprsunset) |
| Updates | custom | channel, availability, update actions |
| About | custom | version, fastfetch summary, health, ways back |

### Display and the monitor canvas

`DisplayPage` edits each output's enabled state, mode, scale, transform, and
position, and hosts `components/MonitorCanvas.qml` for arrangement:

- Monitors are drawn at true aspect ratio from their **logical** size
  (`width / scale`), scaled to fit the canvas, so positions read the way
  Hyprland thinks about them.
- A monitor can be dragged with the mouse; edges snap to other monitors and to
  the origin, with a 10 px grid as a fallback. A live coordinate readout
  follows the drag.
- A drag only commits when the position actually changes, and a commit always
  writes the full base for that output (enabled, mode, scale, x, y), so a
  partial override can never silently reset the other fields.

### Updates

Update jobs need `sudo`, print progress, and sometimes prompt, so they run the
same way Omarchy's own menu runs them — in a floating terminal:

```sh
omarchy-launch-floating-terminal-with-presentation "omarchy-update"
```

The page shows version, channel, branch, last package update, and availability
(`omarchy-update-available`), lets the channel be switched
(`omarchy-channel-set stable|rc|edge|dev`), and offers Update Omarchy, Check for
updates, Update plugins, Update extra themes, Update firmware, and Restart
shell. The availability probe only runs when the page asks — it reaches the
package databases and is not part of the routine refresh.

### About

Reads the same fastfetch summary Omarchy prints, with the terminal logo and
ANSI colour stripped, in a read-only monospace panel, plus a **Refresh info**
button. Nothing here is editable; it is the app's answer to "what am I
running?"

## Called from the shell

The settings app is reachable three ways: as a command, from the Omarchy
menu, and from a gear in the bar's indicator cluster.

```sh
omarchy-settings                 # launch or focus the app
omarchy menu summon settings     # via the Omarchy menu entry
```

Clicking the gear also runs `omarchy-settings`.

### The omarchy.indicators gear

`omarchy.indicators` is a first-party bar widget. It loads each icon as
`<shell>/plugins/bar/indicators/<Id>.qml` and shows the ones named in its
`items` setting, so both halves of the integration are external to this app:

- `integration/indicators/Settings.qml` — the indicator component. It reports
  itself active so the gear sits in the always-visible block instead of
  appearing only on hover, and launches the app on click.
- `~/.config/omarchy/shell.json` — the `omarchy.indicators` entry lists
  `"Settings"` alongside the default indicators.

Because the shell only reads indicators from its own root-owned directory,
`integration/install.sh` copies the component there with `sudo`:

```sh
~/.config/quickshell/omarchy-settings/integration/install.sh
```

That directory is replaced by `omarchy update`, so re-run the script after an
update to bring the gear back. The `shell.json` entry is user config and
survives updates. The shell rescans plugins on its own, but
`omarchy-shell shell rescanPlugins` forces it.

## Design language

Pulled from `qs.Commons.Style` and `qs.Commons.Color` so the app matches the
active theme (Marvin by default):

- 24 px corner radius; background `#161616`, raised `#1e1e1e`, ink `#d6d6d6`,
  muted `#8c8c8c`, accent `#6db8ee`.
- Spacing ramp 2/4/8/12/16/20/24/32/48; type scale 11/12/13/14/16/18/24/56.
- No dividers — whitespace and two text tones separate content. Accent is
  rationed, and at most one inverted element (the primary action) appears per
  surface. Motion runs at 120/200/320 ms.

## Files

```
shell.qml                     window, layout, keyboard, page loader
model/
  Schema.js                   the settings surface (pages + rows)
  Lua.js                      managed map → hypr/settings.lua
  SettingsStore.qml           live values, apply loop, state sidecar
  Omarchy.qml                 everything that is not a Hyprland option
  qmldir                      registers the two singletons
components/
  Sidebar, NavItem            navigation + search
  GenericPage, SettingRow     schema-driven rendering
  SwitchControl, SegmentedControl, ValueSlider, PillButton, SearchField
  MonitorCanvas               draggable monitor arrangement
  PageHeader, StatusBar, SearchResults
pages/
  DisplayPage, BarPage, IdlePage, NightlightPage, UpdatesPage, AboutPage
integration/
  indicators/Settings.qml     the omarchy.indicators gear
  install.sh                  installs it into the shell (sudo)
Ui/, Commons/                 symlinks to /usr/share/omarchy/shell/{Ui,Commons}
```

## Extending

**Add a Hyprland setting:** add one entry to `Schema.settings`. Pick an existing
`page` (or add a new page to `Schema.pages` and a `sourceFor` branch in
`shell.qml` if it needs a custom body). No component changes are needed — the
generic page, search, and Lua generator all read the schema.

**Add a custom page:** add it to `Schema.pages`, handle it in `sourceFor()`,
and drop a `pages/<Name>Page.qml`. Use `SettingsStore` for Hyprland values and
`Omarchy` for everything else.

## Safety

- The app writes only three files: `~/.config/hypr/settings.lua`, the marker
  block in `~/.config/hypr/hyprland.lua`, and the state sidecar.
- The loader block is idempotent and removed when nothing is managed.
- Every apply ends with `hyprctl configerrors`; problems are reported rather
  than hidden.
- To back everything out by hand: delete `~/.config/hypr/settings.lua`, remove
  the two lines under `-- omarchy-settings:load` in `hyprland.lua`, then
  `hyprctl reload`.

## Requirements

Quickshell 0.3.1+, the Omarchy CLI on `PATH`, and the Omarchy shell's `Ui/` and
`Commons/` QML modules (the symlinks above). `fastfetch` is optional — the
About page simply stays empty without it.
