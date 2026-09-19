import QtQuick
import Quickshell
import qs.Ui

// A Settings entry for the omarchy.indicators bar widget.
//
// This is an action, not a state, so it reports itself active: that keeps the
// gear in the always-visible active block instead of hiding it until the
// indicators area is hovered. Clicking it launches (or focuses) the app.
//
// The shell only loads indicator components from its own
// plugins/bar/indicators/ directory, so this file must be installed there.
// integration/install.sh does that; re-run it after an Omarchy update.
BarIndicator {
  id: root

  active: true
  activeText: "󰒓"
  inactiveText: "󰒓"
  activeTooltipText: "Settings"
  inactiveTooltipText: "Settings"

  onPressed: function() {
    Quickshell.execDetached(["omarchy-settings"])
  }
}
