#!/bin/sh

npm remove @cloudrex/forge
npm install --save @cloudrex/forge
npm run build
pm2 restart 0