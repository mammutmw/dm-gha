#!/bin/bash
npm init -y
npm install -g @vercel/ncc
npm install @actions/core
npm install @actions/github
ncc build index.js --license licenses.txt

