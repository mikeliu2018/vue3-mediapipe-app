#!/bin/sh

cd /usr/src/app

npm install
# npm update
# npm update --legacy-peer-deps

# npm run build
npm run build-only

npm run dev
# npm run preview