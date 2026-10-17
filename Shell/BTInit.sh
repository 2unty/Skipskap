#!/bin/bash
if ((EUID != 0 )); then
  echo "Run as root"
  exit 1
fi
PROJPATH=/home/hope/Skipskap
"${PROJPATH}/Python/venv/bin/python3" "${PROJPATH}/Python/BTScanScript.py"

