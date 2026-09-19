.pragma library

// Omarchy Settings — the settings surface.
//
// Every entry is data. The UI renders it generically; the store reads its
// live value from Hyprland (`hyprctl -j getoption`) and writes only the
// values the user changed into ~/.config/hypr/settings.lua, which is
// required last so it wins over Omarchy's defaults and the user's own files.
//
// Fields:
//   id       unique key, also the persistence key
//   page     which page renders it
//   group    section heading within the page (rows with the same group sit
//            under one heading; no dividers — whitespace only)
//   label    row title
//   desc     one line of muted help text
//   type     "bool" | "int" | "float" | "enum" | "string"
//   hypr     hyprctl getoption name; absent means the value is app-only
//            (an animation leaf, for example) and is read back from state
//   lua      path into the settings.lua hl.config() table
//   default  the Omarchy/Hyprland default, shown when nothing manages it
//   min/max/step   range for numeric types
//   options  [{value,label}] for enum
//   percent  numeric display as a percentage (floats)
//   leaf     when set, emitted as hl.animation() with this leaf instead of
//            entering the hl.config() tree (motion page)

var pages = [
  { id: "appearance", label: "Appearance",   icon: "󰸌", desc: "Theme, type, depth, and the shape of windows." },
  { id: "window",     label: "Window",        icon: "", desc: "Gaps, borders, and the tiling layout." },
  { id: "motion",     label: "Motion",        icon: "󰓅", desc: "How the compositor moves between states." },
  { id: "input",      label: "Input",         icon: "", desc: "Keyboard, pointer, and touchpad behaviour." },
  { id: "display",    label: "Display",       icon: "󰍹", desc: "Monitors, resolution, scale, and arrangement." },
  { id: "bar",        label: "Bar & Plugins", icon: "󰍜", desc: "The menu bar and the shell plugins it hosts." },
  { id: "idle",       label: "Idle & Lock",   icon: "󱄄", desc: "Screensaver and lock timing." },
  { id: "nightlight", label: "Night Light",   icon: "󰔎", desc: "Warm the screen after dark." },
  { id: "updates",    label: "Updates",       icon: "", desc: "Channel, availability, and the update actions." },
  { id: "about",      label: "About",         icon: "\uF02D", desc: "Version, health, and ways back." }
]

var settings = [
  // ------------------------------------------------------------- appearance
  { id: "decoration.rounding", page: "appearance", group: "Shape",
    label: "Corner radius", desc: "Round windows. 0 is square; 24 matches the shell's cards.",
    type: "int", hypr: "decoration:rounding", lua: ["decoration", "rounding"],
    default: 0, min: 0, max: 40, step: 1, unit: "px" },

  { id: "decoration.active_opacity", page: "appearance", group: "Depth",
    label: "Focused opacity", desc: "Opacity of the window you are using.",
    type: "float", hypr: "decoration:active_opacity", lua: ["decoration", "active_opacity"],
    default: 1, min: 0.5, max: 1, step: 0.01, percent: true },

  { id: "decoration.inactive_opacity", page: "appearance", group: "Depth",
    label: "Unfocused opacity", desc: "Opacity of every window behind the focused one.",
    type: "float", hypr: "decoration:inactive_opacity", lua: ["decoration", "inactive_opacity"],
    default: 1, min: 0.3, max: 1, step: 0.01, percent: true },

  { id: "decoration.dim_inactive", page: "appearance", group: "Depth",
    label: "Dim unfocused", desc: "Darken windows that are not focused.",
    type: "bool", hypr: "decoration:dim_inactive", lua: ["decoration", "dim_inactive"],
    default: false },

  { id: "decoration.dim_strength", page: "appearance", group: "Depth",
    label: "Dim strength", desc: "How far unfocused windows are pushed down.",
    type: "float", hypr: "decoration:dim_strength", lua: ["decoration", "dim_strength"],
    default: 0.15, min: 0, max: 1, step: 0.01, percent: true },

  { id: "decoration.blur.enabled", page: "appearance", group: "Glass",
    label: "Blur", desc: "Blur what sits behind translucent windows.",
    type: "bool", hypr: "decoration:blur:enabled", lua: ["decoration", "blur", "enabled"],
    default: false },

  { id: "decoration.blur.size", page: "appearance", group: "Glass",
    label: "Blur size", desc: "Radius of the blur kernel.",
    type: "int", hypr: "decoration:blur:size", lua: ["decoration", "blur", "size"],
    default: 8, min: 1, max: 20, step: 1 },

  { id: "decoration.blur.passes", page: "appearance", group: "Glass",
    label: "Blur passes", desc: "More passes are smoother and cost more.",
    type: "int", hypr: "decoration:blur:passes", lua: ["decoration", "blur", "passes"],
    default: 1, min: 1, max: 5, step: 1 },

  { id: "decoration.shadow.enabled", page: "appearance", group: "Glass",
    label: "Window shadows", desc: "A soft shadow behind each window.",
    type: "bool", hypr: "decoration:shadow:enabled", lua: ["decoration", "shadow", "enabled"],
    default: false },

  // ----------------------------------------------------------------- window
  { id: "general.gaps_in", page: "window", group: "Spacing",
    label: "Inner gaps", desc: "Space between adjacent windows.",
    type: "int", hypr: "general:gaps_in", lua: ["general", "gaps_in"],
    default: 5, min: 0, max: 50, step: 1, unit: "px" },

  { id: "general.gaps_out", page: "window", group: "Spacing",
    label: "Outer gaps", desc: "Space between windows and the screen edge.",
    type: "int", hypr: "general:gaps_out", lua: ["general", "gaps_out"],
    default: 10, min: 0, max: 100, step: 1, unit: "px" },

  { id: "general.border_size", page: "window", group: "Spacing",
    label: "Border size", desc: "Thickness of the window border.",
    type: "int", hypr: "general:border_size", lua: ["general", "border_size"],
    default: 2, min: 0, max: 10, step: 1, unit: "px" },

  { id: "general.layout", page: "window", group: "Layout",
    label: "Tiling layout", desc: "How new windows are placed on a workspace.",
    type: "enum", hypr: "general:layout", lua: ["general", "layout"],
    default: "dwindle",
    options: [
      { value: "dwindle",   label: "Dwindle" },
      { value: "master",    label: "Master" },
      { value: "scrolling", label: "Scrolling" }
    ] },

  { id: "general.resize_on_border", page: "window", group: "Layout",
    label: "Resize on border", desc: "Drag the border to resize instead of to move.",
    type: "bool", hypr: "general:resize_on_border", lua: ["general", "resize_on_border"],
    default: false },

  { id: "dwindle.preserve_split", page: "window", group: "Dwindle",
    label: "Preserve split", desc: "Keep the split direction when the window changes.",
    type: "bool", hypr: "dwindle:preserve_split", lua: ["dwindle", "preserve_split"],
    default: true },

  { id: "dwindle.force_split", page: "window", group: "Dwindle",
    label: "Force split", desc: "Which side a newly opened window lands on.",
    type: "enum", hypr: "dwindle:force_split", lua: ["dwindle", "force_split"],
    default: "2",
    options: [
      { value: "0", label: "Follow mouse" },
      { value: "1", label: "Left / top" },
      { value: "2", label: "Right / bottom" }
    ] },

  { id: "master.new_status", page: "window", group: "Master",
    label: "New window role", desc: "Whether a new window becomes the master.",
    type: "enum", hypr: "master:new_status", lua: ["master", "new_status"],
    default: "master",
    options: [
      { value: "master", label: "Master" },
      { value: "slave",  label: "Slave" },
      { value: "inherit", label: "Inherit" }
    ] },

  { id: "scrolling.column_width", page: "window", group: "Scrolling",
    label: "Column width", desc: "Width of a scrolling column as a fraction of the screen.",
    type: "float", hypr: "scrolling:column_width", lua: ["scrolling", "column_width"],
    default: 0.49, min: 0.2, max: 1, step: 0.01, percent: true },

  // ----------------------------------------------------------------- motion
  { id: "animations.enabled", page: "motion", group: "Global",
    label: "Animations", desc: "The master switch for compositor motion.",
    type: "bool", hypr: "animations:enabled", lua: ["animations", "enabled"],
    default: true },

  { id: "motion.windows_speed", page: "motion", group: "Windows",
    label: "Window speed", desc: "Open, close, and move. Higher is slower.",
    type: "int", hypr: null, lua: null, leaf: "windows",
    default: 4, min: 0, max: 15, step: 1 },

  { id: "motion.windows_style", page: "motion", group: "Windows",
    label: "Window style", desc: "How a window enters and leaves.",
    type: "enum", hypr: null, lua: null, leaf: "windowsIn",
    default: "slide",
    options: [
      { value: "slide", label: "Slide" },
      { value: "popin 87%", label: "Pop" },
      { value: "fade", label: "Fade" }
    ] },

  { id: "motion.workspaces_speed", page: "motion", group: "Workspaces",
    label: "Workspace speed", desc: "Sliding between workspaces. Higher is slower.",
    type: "int", hypr: null, lua: null, leaf: "workspaces",
    default: 8, min: 0, max: 20, step: 1 },

  { id: "motion.workspaces_style", page: "motion", group: "Workspaces",
    label: "Workspace style", desc: "How a workspace change reads.",
    type: "enum", hypr: null, lua: null, leaf: "workspaces",
    default: "slide",
    options: [
      { value: "slide", label: "Slide" },
      { value: "slidefade", label: "Slide + fade" },
      { value: "slidefadevert 20%", label: "Vertical" },
      { value: "fade", label: "Fade" }
    ] },

  // ------------------------------------------------------------------ input
  { id: "input.kb_layout", page: "input", group: "Keyboard",
    label: "Layout", desc: "XKB layout, e.g. us or us,de.",
    type: "string", hypr: "input:kb_layout", lua: ["input", "kb_layout"],
    default: "us" },

  { id: "input.kb_variant", page: "input", group: "Keyboard",
    label: "Variant", desc: "Optional XKB variant, e.g. intl.",
    type: "string", hypr: "input:kb_variant", lua: ["input", "kb_variant"],
    default: "" },

  { id: "input.repeat_rate", page: "input", group: "Keyboard",
    label: "Repeat rate", desc: "Key repeats per second when held.",
    type: "int", hypr: "input:repeat_rate", lua: ["input", "repeat_rate"],
    default: 40, min: 10, max: 100, step: 1 },

  { id: "input.repeat_delay", page: "input", group: "Keyboard",
    label: "Repeat delay", desc: "Milliseconds before a held key repeats.",
    type: "int", hypr: "input:repeat_delay", lua: ["input", "repeat_delay"],
    default: 250, min: 100, max: 1000, step: 10, unit: "ms" },

  { id: "input.numlock_by_default", page: "input", group: "Keyboard",
    label: "Numlock on by default", desc: "Start the session with numlock active.",
    type: "bool", hypr: "input:numlock_by_default", lua: ["input", "numlock_by_default"],
    default: true },

  { id: "input.accel_profile", page: "input", group: "Pointer",
    label: "Acceleration profile", desc: "Adaptive accelerates with speed; flat is linear.",
    type: "enum", hypr: "input:accel_profile", lua: ["input", "accel_profile"],
    default: "adaptive",
    options: [
      { value: "adaptive", label: "Adaptive" },
      { value: "flat",     label: "Flat" },
      { value: "",         label: "Default" }
    ] },

  { id: "input.sensitivity", page: "input", group: "Pointer",
    label: "Sensitivity", desc: "Pointer speed. 0 is unchanged.",
    type: "float", hypr: "input:sensitivity", lua: ["input", "sensitivity"],
    default: 0, min: -1, max: 1, step: 0.01 },

  { id: "input.follow_mouse", page: "input", group: "Pointer",
    label: "Follow mouse", desc: "Focus follows the cursor.",
    type: "enum", hypr: "input:follow_mouse", lua: ["input", "follow_mouse"],
    default: "1",
    options: [
      { value: "0", label: "Disabled" },
      { value: "1", label: "Full" },
      { value: "2", label: "Loose" },
      { value: "3", label: "No follow" }
    ] },

  { id: "input.left_handed", page: "input", group: "Pointer",
    label: "Left handed", desc: "Swap the primary and secondary mouse buttons.",
    type: "bool", hypr: "input:left_handed", lua: ["input", "left_handed"],
    default: false },

  { id: "input.natural_scroll", page: "input", group: "Pointer",
    label: "Natural scroll", desc: "Scroll content with the gesture, not against it.",
    type: "bool", hypr: "input:natural_scroll", lua: ["input", "natural_scroll"],
    default: false },

  { id: "input.touchpad.natural_scroll", page: "input", group: "Touchpad",
    label: "Natural scroll", desc: "Reverse the touchpad scroll direction.",
    type: "bool", hypr: "input:touchpad:natural_scroll", lua: ["input", "touchpad", "natural_scroll"],
    default: false },

  { id: "input.touchpad.clickfinger_behavior", page: "input", group: "Touchpad",
    label: "Tap to right-click", desc: "Two fingers tap for a right click.",
    type: "bool", hypr: "input:touchpad:clickfinger_behavior", lua: ["input", "touchpad", "clickfinger_behavior"],
    default: true },

  { id: "input.touchpad.tap_to_click", page: "input", group: "Touchpad",
    label: "Tap to click", desc: "A single tap is a primary click.",
    type: "bool", hypr: "input:touchpad:tap-to-click", lua: ["input", "touchpad", "tap_to_click"],
    default: true },

  { id: "input.touchpad.disable_while_typing", page: "input", group: "Touchpad",
    label: "Disable while typing", desc: "Ignore the touchpad while keys are pressed.",
    type: "bool", hypr: "input:touchpad:disable_while_typing", lua: ["input", "touchpad", "disable_while_typing"],
    default: true },

  { id: "input.touchpad.scroll_factor", page: "input", group: "Touchpad",
    label: "Scroll factor", desc: "Touchpad scroll speed multiplier.",
    type: "float", hypr: "input:touchpad:scroll_factor", lua: ["input", "touchpad", "scroll_factor"],
    default: 0.4, min: 0, max: 2, step: 0.05 },

  { id: "gesture.workspace_swipe", page: "input", group: "Gestures",
    label: "Workspace swipe", desc: "Swipe with 3 or 4 fingers to change workspaces.",
    type: "bool", hypr: null, lua: ["gesture", "workspace_swipe"],
    default: true },

  { id: "gesture.workspace_swipe_fingers", page: "input", group: "Gestures",
    label: "Swipe fingers", desc: "Number of fingers required for workspace swipe.",
    type: "enum", hypr: null, lua: ["gesture", "workspace_swipe_fingers"],
    default: "3",
    options: [
      { value: "3", label: "3 fingers" },
      { value: "4", label: "4 fingers" }
    ] },

  { id: "gesture.pinch_zoom", page: "input", group: "Gestures",
    label: "Pinch to zoom", desc: "Enable pinch gesture for cursor zoom.",
    type: "bool", hypr: null, lua: ["gesture", "pinch_zoom"],
    default: true }
]

function pageById(id) {
  for (var i = 0; i < pages.length; i++) if (pages[i].id === id) return pages[i]
  return null
}

function settingById(id) {
  for (var i = 0; i < settings.length; i++) if (settings[i].id === id) return settings[i]
  return null
}

function settingsForPage(pageId) {
  var out = []
  for (var i = 0; i < settings.length; i++) if (settings[i].page === pageId) out.push(settings[i])
  return out
}

// Grouped rows preserve schema order and the order a group first appears.
function groupsForPage(pageId) {
  var order = []
  var map = {}
  var list = settingsForPage(pageId)
  for (var i = 0; i < list.length; i++) {
    var g = list[i].group || ""
    if (!map[g]) { map[g] = []; order.push(g) }
    map[g].push(list[i])
  }
  var out = []
  for (var j = 0; j < order.length; j++) out.push({ name: order[j], items: map[order[j]] })
  return out
}

function matchesSetting(s, query) {
  var q = String(query || "").toLowerCase()
  if (q.length === 0) return true
  return (s.label.toLowerCase().indexOf(q) !== -1)
    || (String(s.desc || "").toLowerCase().indexOf(q) !== -1)
    || (String(s.group || "").toLowerCase().indexOf(q) !== -1)
    || (s.id.toLowerCase().indexOf(q) !== -1)
}

function pageHasMatch(pageId, query) {
  var p = pageById(pageId)
  if (p && String(query || "").length > 0 && p.label.toLowerCase().indexOf(String(query).toLowerCase()) !== -1) return true
  var list = settingsForPage(pageId)
  for (var i = 0; i < list.length; i++) if (matchesSetting(list[i], query)) return true
  return false
}

function matchingSettings(query) {
  var out = []
  for (var i = 0; i < settings.length; i++) if (matchesSetting(settings[i], query)) out.push(settings[i])
  return out
}

function hyprOptions() {
  var out = []
  for (var i = 0; i < settings.length; i++) if (settings[i].hypr) out.push(settings[i].hypr)
  return out
}
