import QtQuick
import Quickshell
import qs.Commons
import qs.Ui

// Bar entry point: a gear that opens the settings panel. The panel is a
// separate `panel` entry point, so this only asks the shell to toggle it.
BarWidget {
  id: root
  moduleName: "nightdevil00.omarchy-settings"

  readonly property string pluginId: "nightdevil00.omarchy-settings"

  implicitWidth: button.implicitWidth
  implicitHeight: button.implicitHeight

  function togglePanel() {
    if (root.bar && root.bar.shell && typeof root.bar.shell.toggle === "function") {
      root.bar.shell.toggle(root.pluginId, "{}")
    } else {
      Quickshell.execDetached(["omarchy-shell", "shell", "toggle", root.pluginId, "{}"])
    }
  }

  BarIconButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    slotSize: Style.bar.statusSlot
    text: "\uf013"
    tooltipText: "Omarchy Settings"
    onPressed: function(button) {
      if (button === Qt.LeftButton) root.togglePanel()
    }
  }
}
