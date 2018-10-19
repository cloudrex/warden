#!/bin/bash
pwd
sudo rm -R ./node_modules/@cloudrex
mkdir node_modules/@cloudrex
mkdir node_modules/@cloudrex/forge
cp -r ../forge/dist/* ./node_modules/@cloudrex/forge
cd node_modules/@cloudrex/forge
