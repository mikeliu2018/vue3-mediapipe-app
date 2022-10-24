#!/bin/sh

# 進入道專案目錄中
cd /usr/src/app

# npm install
# 更新套件
# npm update
# npm update --legacy-peer-deps

# npm run build
npm run build-only

npm run dev
# npm run preview