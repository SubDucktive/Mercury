#!/bin/bash

if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed. Please install it and try again."
  echo "Node.js can be installed with 'sudo apt install nodejs'"
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: mercury <filename>"
  exit 1
fi

if [ ! -d "/opt/mercury" ]; then
  echo "couldn't find mercury install directory, did you run the install script?"
  exit 1
fi

node /opt/mercury/src/main.js "$1"
