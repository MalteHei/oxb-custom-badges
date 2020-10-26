const { makeBadge } = require('badge-maker');
const fs = require('fs');
const npmCheck = require('npm-check');


// create output directory
fs.mkdir('badges', err => {
  if (err && err.errno !== -17) console.error(err);
});


// badge 'version'
const version = require('../package.json').version;
const svgVersion = makeBadge({
  label: 'version',
  message: version,
  color: 'blue',
});
fs.writeFile('badges/version.svg', svgVersion, err => {
  if (err) console.error(err);
});


// badge 'outdated packages'
npmCheck().then(state => {
  const numOutdated = state.get('packages').filter(pkg => !!pkg.bump).length;
  const svgOutdated = makeBadge({
    label: 'outdated',
    message: String(numOutdated),
    color: (numOutdated === 0 ? 'green' : 'red'),
  });

  fs.writeFile('badges/outdated.svg', svgOutdated, err => {
    if (err) console.error(err);
  });
});


// badge 'last updated'
const today = new Date()
  .toISOString()
  .replace(/T.*/, '');
const svgLastUpdated = makeBadge({
  label: 'last updated',
  message: today,
  color: 'blue',
});
fs.writeFile('badges/last_updated.svg', svgLastUpdated, err => {
  if(err) console.error(err);
});
