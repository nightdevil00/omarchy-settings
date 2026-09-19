import QtQuick
import QtQuick.Controls
import qs.Commons
import "../model"
import "../components"

Item {
  id: root

  property bool advancedMode: false

  Flickable {
    anchors.fill: parent
    contentWidth: width
    contentHeight: col.implicitHeight + 32
    clip: true
    boundsBehavior: Flickable.StopAtBounds
    ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

    Column {
      id: col
      width: parent.width
      spacing: 24
      bottomPadding: 24

      Rectangle {
        width: parent.width
        height: warningCol.implicitHeight + 24
        radius: Style.cornerRadius > 0 ? Math.min(20, Style.cornerRadius) : 6
        color: advancedMode ? Util.alpha(Color.warning, 0.1) : Util.alpha(Color.foreground, 0.04)
        border.width: 1
        border.color: advancedMode ? Util.alpha(Color.warning, 0.3) : Util.alpha(Color.foreground, 0.07)

        Column {
          id: warningCol
          anchors.left: parent.left
          anchors.right: parent.right
          anchors.verticalCenter: parent.verticalCenter
          anchors.leftMargin: 20
          anchors.rightMargin: 20
          spacing: 12

          Row {
            spacing: 12
            Image {
              width: 24
              height: 24
              source: advancedMode ? "qrc:/qs/icons/warning.svg" : "qrc:/qs/icons/info.svg"
              color: advancedMode ? Color.warning : Color.muted
            }
            Text {
              width: parent.width - 36
              wrapMode: Text.WordWrap
              text: advancedMode
                ? "Advanced mode enabled. Changing these environment variables can affect system stability, graphics drivers, and application behavior. Only modify if you know what you're doing."
                : "Environment variables control low-level behavior for Hyprland, Aquamarine, NVIDIA drivers, and toolkits (GTK, Qt, SDL, etc.). Enable Advanced mode to edit them."
              font.family: Style.font.family
              font.pixelSize: Style.font.body
              color: advancedMode ? Color.warning : Color.muted
            }
          }

          Rectangle {
            id: advancedToggle
            width: parent.width
            height: 48
            radius: Style.cornerRadius > 0 ? Math.min(12, Math.round(Style.cornerRadius * 0.5)) : 4
            color: advancedMode ? Util.alpha(Color.warning, 0.15) : "transparent"
            border.width: 1
            border.color: advancedMode ? Util.alpha(Color.warning, 0.4) : Util.alpha(Color.foreground, 0.1)

            Row {
              spacing: 12
              Text {
                text: advancedMode ? "⚠  Advanced Mode Active — Tap to Disable" : "🔧  Enable Advanced Mode to Edit Environment Variables"
                font.family: Style.font.family
                font.pixelSize: Style.font.body
                font.weight: Font.DemiBold
                color: advancedMode ? Color.warning : Color.foreground
              }
              Rectangle {
                width: 56
                height: 28
                radius: 14
                color: advancedMode ? Color.warning : Util.alpha(Color.foreground, 0.1)
                anchors.verticalCenter: parent.verticalCenter
                anchors.right: parent.right
                anchors.rightMargin: 8

                Rectangle {
                  id: toggleThumb
                  width: 22
                  height: 22
                  radius: 11
                  color: "white"
                  x: advancedMode ? parent.width - 25 : 3
                  anchors.verticalCenter: parent.verticalCenter
                  Behavior on x { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
                }

                MouseArea {
                  anchors.fill: parent
                  hoverEnabled: true
                  cursorShape: Qt.PointingHandCursor
                  onClicked: root.advancedMode = !root.advancedMode
                }
              }
            }
          }
        }
      }

      GenericPage {
        id: innerGenericPage
        width: parent.width
        height: advancedMode ? innerGenericPage.contentHeight : 0
        visible: advancedMode
        pageId: "environment"
        embedded: true
        clip: true
      }
    }
  }
}