#!/usr/bin/env node

const fs = require('fs');

const [_node, _app, inputFile, outputFile, ...rest] = process.argv;
if (!inputFile) {
  console.log('No Input File');
  process.exit(1);
}

fs.readFile(inputFile, (err, data) => {
  if (err)  {
    console.error(err);
    return;
  }

  let idx = 0;
  const count = 80;
  for (idx; idx < count && idx < data.length; idx += 2) {
    let cc = data[idx];

    // console.log(`[${cc}]`, `[${cc.charCodeAt(0)}]`, new Blob([cc]).size);

    0
    // Below is for raw data
    // console.log(`[${cc}]`, `[${String.fromCharCode(cc)}]`, new Blob([cc]).size);
  }
});
