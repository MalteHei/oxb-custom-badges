const { makeBadge } = require('badge-maker');
const fs = require('fs');
const npmCheck = require('npm-check');


// create output directory
fs.mkdir('badges', err => {
  if (err && err.errno !== -17) console.error(err);
});


// create & save badge 'version'
const version = require('../package.json').version;
const svgVersion = makeBadge({
  label: 'Version',
  message: version,
  color: 'blue',
});

fs.writeFile('badges/version.svg', svgVersion, err => {
  if (err) console.error(err);
});


// create & save badge 'outdated packages'
npmCheck().then(state => {
  const numOutdated = state.get('packages').filter(pkg => !!pkg.bump).length;
  const svgOutdated = makeBadge({
    label: 'Outdated',
    message: String(numOutdated),
    color: (numOutdated === 0 ? 'green' : 'red'),
  });

  fs.writeFile('badges/outdated.svg', svgOutdated, err => {
    if (err) console.error(err);
  });
});
