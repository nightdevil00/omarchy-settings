#!/bin/bash
# Prepare an Omarchy Settings checkout to run as a Quickshell config.
#
# Quickshell discovers configs as <xdg>/quickshell/<name>/shell.qml, so the
# intended install is a clone at ~/.config/quickshell/omarchy-settings. This
# script links the two QML modules the app borrows from the Omarchy shell and
# installs the launcher. Run it once after cloning.

set -euo pipefail

app_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
shell_dir="${OMARCHY_PATH:-/usr/share/omarchy}/shell"

if [[ ! -f $shell_dir/Commons/Style.qml || ! -f $shell_dir/Ui/BarIndicator.qml ]]; then
  echo "setup: Omarchy shell modules not found under $shell_dir" >&2
  echo "setup: set OMARCHY_PATH if Omarchy lives elsewhere" >&2
  exit 1
fi

ln -sfn "$shell_dir/Ui" "$app_dir/Ui"
ln -sfn "$shell_dir/Commons" "$app_dir/Commons"
echo "setup: linked Ui and Commons from $shell_dir"

launcher="$HOME/.local/bin/omarchy-settings"
mkdir -p "$(dirname "$launcher")"
cat > "$launcher" <<'LAUNCHER'
#!/bin/bash
# Launch the Omarchy Settings app. Exits quietly if it is already up.
exec qs -n -c omarchy-settings "$@"
LAUNCHER
chmod +x "$launcher"
echo "setup: wrote $launcher"

if [[ $app_dir == "$HOME/.config/quickshell/omarchy-settings" ]]; then
  echo "setup: done. Run: omarchy-settings"
else
  echo "setup: done. This checkout is not at ~/.config/quickshell/omarchy-settings,"
  echo "setup: so the launcher will not find it. Run it with: qs -n -p \"$app_dir\""
fi

echo "setup: optional: integration/install.sh adds the Settings gear to the bar (sudo)"
