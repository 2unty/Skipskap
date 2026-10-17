#!/bin/bash
if ((EUID != 0 )); then
  echo "Run as root"
  exit 1
fi
PROJPATH=/home/hope/Skipskap
/usr/bin/systemctl stop NetworkManager && /usr/sbin/iw wlan1 set type monitor && /usr/bin/ip link set wlan1 up && /usr/bin/systemctl start NetworkManager && "${PROJPATH}/Python/venv/bin/python3" "${PROJPATH}/Python/ScanScript.py"
