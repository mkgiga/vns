#!/bin/bash

# check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "node_modules not found, running npm install ..."
  npm install;
fi

# build the app
npm run build