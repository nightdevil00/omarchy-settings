#!/bin/bash
# Install the Settings indicator into Omarchy's shell.
#
# Omarchy loads bar indicators only from its own plugins/bar/indicators/
# directory, so this copies Settings.qml there with sudo. That path is
# root-owned and is replaced by `omarchy update`; re-run this script after an
# update to bring the gear back.
#
# The shell watches its plugin tree and reloads, so no shell restart is needed.
# Adding "Settings" to the omarchy.indicators `items` in shell.json is a
# user-config change (done once, survives updates) and is not touched here.

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_file="$here/indicators/Settings.qml"
target_dir="/usr/share/omarchy/shell/plugins/bar/indicators"
target_file="$target_dir/Settings.qml"

if [[ ! -f $source_file ]]; then
  echo "install: missing $source_file" >&2
  exit 1
fi

sudo install -Dm644 "$source_file" "$target_file"
echo "install: wrote $target_file"
echo "install: ensure \"Settings\" is listed in omarchy.indicators items in ~/.config/omarchy/shell.json"
