#!/bin/bash

if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed. Please install it and try again."
  echo "Node.js can be installed with 'sudo apt install nodejs'"
  exit 1
fi

if [ -z "$1" ]; then
  echo "Usage: $0 <filename>"
  exit 1
fi

node src/main.js "$1"
