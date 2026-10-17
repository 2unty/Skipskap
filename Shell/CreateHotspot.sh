#!/bin/bash
# Run this if on a fresh Pi
set -e
if ((EUID != 0 )); then
  echo "Run as root"
  exit 1
fi
nmcli con add type wifi ifname wlan0 con-name NHotspot ssid BeautifulWorld
nmcli con modify NHotspot 802-11-wireless.mode ap 802-11-wireless.band bg ipv4.method shared ipv4.addresses 10.22.10.1/24 
nmcli con modify NHotspot wifi-sec.key-mgmt wpa-psk wifi-sec.psk "taskMan12!"
