const fs = require('fs');

console.log(`Fixing package.json for NPM Publish`);
console.log(`This must be done because our our npm name is 'ultraos'`);

const dataString = fs.readFileSync('package.json', { encoding: 'utf-8' });
const data = JSON.parse(dataString);
data.name = '@ultraos/contract-builder';
fs.writeFileSync('package.json', JSON.stringify(data, null, 4));
