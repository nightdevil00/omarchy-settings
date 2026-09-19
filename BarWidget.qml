import QtQuick
import Quickshell
import qs.Ui
import qs.Commons

BarWidget {
    id: root

    moduleName: "nightdevil00.omarchy-settings"

    implicitWidth: icon.width + 16
    implicitHeight: bar ? bar.barSize : 26

    Text {
        id: icon

        anchors.centerIn: parent

        text: "󰒓"
        color: root.barForeground
        font.family: root.bar ? root.bar.fontFamily : Style.font.family
        font.pixelSize: Style.font.icon

        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor

            onClicked: {
                bar.run("omarchy-shell shell toggle nightdevil00.omarchy-settings '{}'")
            }

            onEntered: {
                if (root.bar)
                    root.bar.showTooltip(this, "Omarchy Settings")
            }

            onExited: {
                if (root.bar)
                    root.bar.hideTooltip(this)
            }
        }
    }
}