#!/bin/bash
# Running this script means you've already created the nmcli hotspot profile
# If you haven't, execute CreateHotspot.sh
PROJPATH=/home/hope/Skipskap
nmcli con up NHotspot
cd ${PROJPATH}/NodeGraph && /usr/bin/npm run dev -- --host 
