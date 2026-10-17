#!/bin/bash
if ((EUID != 0 )); then
  echo "Run as root"
  exit 1
fi
/usr/bin/systemctl stop NetworkManager && /usr/sbin/iw wlan1 set type managed && /usr/bin/ip link set wlan1 up && /usr/bin/systemctl start NetworkManager && 
