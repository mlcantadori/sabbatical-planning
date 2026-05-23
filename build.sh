#!/bin/bash
# Re-compile JSX → JS after editing source files.
# Run from the project directory: ./build.sh
set -e
cd "$(dirname "$0")"
NODE_PATH=/tmp/node_modules node -e "
const { transformSync } = require('@babel/core');
const fs = require('fs');
const dir = './';
const files = ['shared', 'map-view', 'panels', 'app'];
const opts = {
  presets: [['@babel/preset-env', { targets: 'last 2 Chrome versions' }], '@babel/preset-react'],
  compact: false,
};
fs.mkdirSync('dist', { recursive: true });
files.forEach(name => {
  const src = fs.readFileSync(dir + name + '.jsx', 'utf8');
  const result = transformSync(src, { ...opts, filename: name + '.jsx' });
  fs.writeFileSync('dist/' + name + '.js', result.code);
  console.log('✓', name + '.jsx');
});
console.log('Build done — refresh the browser.');
"
