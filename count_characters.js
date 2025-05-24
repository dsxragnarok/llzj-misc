const fs = require('fs');

const [_node, _app, inputFile, ...rest] = process.argv;
if (!inputFile) {
  console.log('No Input File');
  process.exit(1);
}

fs.readFile(inputFile, 'utf-8', (err, data) => {
  if (err)  {
    console.error(err);
    return;
  }

  console.log(`number of characters -> ${data.length}`);
});
