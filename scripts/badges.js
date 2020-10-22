const { makeBadge } = require('badge-maker');
const fs = require('fs');

const version = require('../package.json').version;
const svgVersion = makeBadge({
  label: 'Version',
  message: version,
  color: 'blue',
});

fs.mkdir('badges', err => {
  if (err && err.errno !== -17) console.error(err);
});

fs.writeFile('badges/version.svg', svgVersion, err => {
  if (err) console.error(err);
});
