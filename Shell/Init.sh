#!/bin/bash

# Start order should be: ControlPanelInit.sh, BackendInit.sh, startDisplay.sh*
#
# In-display options are: MonitorInit.sh (For scanning) and StartBeacon.sh* (For node graph)
set -e
if ((EUID != 0 )); then
  echo "Run as root"
  exit 1
fi
trap 'trap - EXIT; kill 0' EXIT
runUser="hope"
HOME="/home/$runUser"
export DISPLAY=":0"
export XAUTHORITY="${HOME}/.Xauthority"
export PROJPATH="${HOME}/Skipskap"
"${PROJPATH}/Python/venv/bin/python3" "${PROJPATH}/Python/ControlPanel.py" &
"${PROJPATH}/Python/venv/bin/python3" "${PROJPATH}/Python/Endpoints.py" &
sudo -u $runUser "${PROJPATH}/Shell/DisplayInit.sh"
wait
