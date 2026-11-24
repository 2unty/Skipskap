#!/bin/sh
set -e
if ((EUID != 0 )); then
  echo "Run as root"
  exit 1
fi
# Install MariaDB
apt-get update
apt-get install -y mariadb-server
mariadb-secure-installation 

# Set credentials
mariadb-admin -u root -p password 'skap'

# Create schema
mariadb -u root -p < ./CreateDB.sql
