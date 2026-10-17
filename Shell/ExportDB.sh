#!/bin/bash
mariadb-dump -u root -pskap Scanned | nc Light 1818
