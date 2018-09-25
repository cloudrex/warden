#!/bin/sh
git checkout master
git merge dev
git push
git checkout dev
