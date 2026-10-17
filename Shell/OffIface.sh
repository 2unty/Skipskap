#!/bin/bash
if ((EUID != 0 )); then
  echo "Run as root"
  exit 1
fi
/usr/bin/systemctl stop NetworkManager && /usr/bin/ip link set wlan1 down && /usr/bin/systemctl start NetworkManager
