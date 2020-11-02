const { makeBadge } = require('badge-maker');
const fs = require('fs');
const npmCheck = require('npm-check');


// create output directory
fs.mkdir('badges', err => {
  if (err && err.errno !== -17) console.error(err);
});


const logError = (err) => {
  if (err) console.error(err);
}


// badge 'version'
const version = require('../package.json').version;
const svgVersion = makeBadge({
  label: 'version',
  message: version,
  color: 'blue',
});
fs.writeFile('badges/version.svg', svgVersion, logError);


// badge 'dependency version'
const dependency = 'badge-maker';
let dependencyVersion = 'not used';
try {
  dependencyVersion = require('../package.json').devDependencies[dependency];
} catch (e) {console.error(e);}
const svgDependencyVersion = makeBadge({
  label: dependency,
  message: dependencyVersion,
  color: 'blue',
});
fs.writeFile('badges/dependency_version.svg', svgDependencyVersion, logError);


// badge 'outdated dependencies'
npmCheck().then(state => {
  const numOutdated = state.get('packages').filter(pkg => !!pkg.bump).length;
  const svgOutdated = makeBadge({
    label: 'outdated',
    message: String(numOutdated),
    color: (numOutdated === 0 ? 'green' : 'red'),
  });
  fs.writeFile('badges/outdated.svg', svgOutdated, logError);
});


// badge 'last updated'
const today = new Date().toISOString().replace(/T.*/, '');
const svgLastUpdated = makeBadge({
  label: 'last updated',
  message: today,
  color: 'blue',
});
fs.writeFile('badges/last_updated.svg', svgLastUpdated, logError);
