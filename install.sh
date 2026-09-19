#!/bin/bash
# Install Omarchy Settings as a user shell plugin. No root required.
#
# Quickshell plugins load from ~/.config/omarchy/plugins; this copies the
# checkout there (or, when already installed in place, leaves it), rescans, and
# enables the plugin next to the indicator cluster.
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
plugins_dir="${XDG_CONFIG_HOME:-$HOME/.config}/omarchy/plugins"
id="nightdevil00.omarchy-settings"
dest="$plugins_dir/$id"

if [[ $repo != "$dest" ]]; then
  mkdir -p "$plugins_dir"
  rm -rf "$dest"
  cp -a "$repo" "$dest"
  echo "install: copied to $dest"
else
  echo "install: running from $dest"
fi

omarchy-shell shell rescanPlugins >/dev/null 2>&1 || true
omarchy plugin enable "$id" --section center --after omarchy.indicators

echo "install: done. If the gear is not on the bar yet, run: omarchy restart shell"
echo "install: open it with: omarchy-shell shell toggle $id '{}'"
