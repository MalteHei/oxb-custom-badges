# Badges für (private) Repositories erstellen
![badges](assets/badges_1.png)

Oft sieht man in den READMEs populärer Open Source Projekte eine Vielzahl bunter Badges, die einem eine schnelle Übersicht über den Projektstatus geben sollen. Für öffentliche Projekte gibt es bereits Services wie [Shields.io](https://shields.io/), doch wie kann man Badges für private/unternehmensinterne Projekte erstellen?
In diesem Artikel wollen wir uns anschauen, wie auch wir eigene Badges erstellen und diese dann in unseren Projekten einbinden können.

Der fertige Code kann [hier](https://github.com/MalteHei/custom-badges) gefunden werden.


## Ausgangssituation
Wir entwickeln eine versionierte Webseite, deren Quellcode auf einem unternehmensinternen Server liegt (z.B. GitLab). Die Abhängigkeiten unserer Webseite managen wir mit [npm](https://www.npmjs.com/).

## Badges erstellen
Natürlich sind uns keine Grenzen gesetzt, welchen Inhalt unsere Badges haben werden. Doch für einen leichten Einstieg demonstriere ich, wie wir eine Badge erstellen können, welche die aktuelle Version unseres Projekts darstellt.

### Die Version anhand der package.json herausfinden
Wenn wir die Version unserer Webseite in der `package.json` pflegen, ist es ein Leichtes, diese programmatisch zu extrahieren:
```js
// scripts/badges.js

const version = require('../package.json').version;
console.log(version);
```
Führen wir dieses Skript via `node scripts/badges.js` aus, wird das Attribut `version` aus der `package.json` geladen und schließlich in der Konsole ausgegeben.

### Das Skript erweitern
Um eine Badge zu erstellen, wird das Paket `badge-maker` benötigt:
```bash
npm install --save-dev badge-maker
```

Um dieses Paket im Code zu verwenden, muss es vorerst in unserem Skript importiert werden.
```js
const { makeBadge } = require('badge-maker');
```

Außerdem benötigen wir das Modul `fs`, welches in Node.js integriert ist und deshalb nicht extra installiert werden muss:
```js
const fs = require('fs');
```
>`fs` ermöglicht Interaktionen mit dem Dateisystem und wird spätestens benötigt, sobald wir die Badge in einer Datei speichern wollen.

Nun können wir aus der extrahierten Version eine Badge erstellen:
```js
const version = require('../package.json').version;
const svgVersion = makeBadge({
  label: 'version',
  message: version,
  color: 'blue',
});
```
Die Funktion `makeBadge()` liefert einen String mit der Badge im SVG-Format.
Ihr muss ein Objekt übergeben werden, in dem das Format der Badge beschrieben wird (siehe https://www.npmjs.com/package/badge-maker#format).

In unserem Beispiel erhalten wir folgende Badge: ![version](assets/badges/version.svg)

Gespeichert werden sollen unsere Badges im Verzeichnis `badges/`, welches zunächst erstellt werden muss:
```js
fs.mkdir('badges', err => {
  if (err && err.errno !== -17) console.error(err);
});
```
`fs.mkdir()` erwartet eine Callback-Funktion, der bei einem Fehler eben dieser übergeben wird.
Da diese Funktion jedoch bei _jedem_ Aufruf ausgeführt wird, sollte man überprüfen, ob es überhaupt einen Fehler gibt.
Außerdem wollen wir keinen Fehler ausgeben, wenn das Verzeichnis bereits existiert (der Fehlercode dafür ist `-17`).

Zu guter Letzt speichern wir die Badge in `badges/version.svg`:
```js
fs.writeFile('badges/version.svg', svgVersion, err => {
  if (err) console.error(err);
});
```
Vereinen wir nun diese Codeschnipsel in einem Skript und führen dieses via `node scripts/badges.js` aus, finden wir anschließend ein neues Verzeichnis, `badges/`, welches die Datei `version.svg` beinhaltet.

### Die Badge in der README einbinden
Schließlich müssen wir die jüngst erstelle Badge, `./badges/version.svg`, nur noch in der README einbinden:
```md
<!-- README.md -->
# Custom Badges ![version](badges/version.svg)
```
>Standardmäßig würde man zur Datei der Badge gelangen, wenn man auf diese klickt. Um dies zu verhindern, kann sie auf etwas verlinken: `[![version](badges/version.svg)](https://example.com "Tooltip, der beim Hovern angezeigt wird")`.

### Das Erstellen der Badges automatisieren
Damit wir die Badges nicht jedes Mal manuell aktualisieren müssen, können wir deren Erstellung automatisieren. Dazu erweitern wir die `package.json` um folgende Skripte:
```json
{
  "scripts": {
    "postinstall": "npm run badges:make",
    "badges:make": "node scripts/badges.js"
  }
}
```
Nun werden die Badges jedes Mal neu erstellt, nachdem `npm install` ausgeführt wurde.
>Voraussetzung hierfür ist, dass es einen anderen Automatismus gibt, der z.B. bei jedem Push auf den Server ein `npm install` ausführt.
>Beispielsweise könnte man bei einem GitLab-Projekt die CI-Pipeline um einen Job erweitern, der `npm install` immer dann ausführt, wenn es Änderungen an der `package.json` gab.
>Je nach Inhalt der Badge kann es natürlich sinnigere Trigger geben.

## Noch mehr Badges!
### Anzahl veralteter Abhängigkeiten ![veraltet](assets/badges/outdated.svg)
Folgende Badge zeigt an, wie viele Abhängigkeiten veraltet sind. Dies ist hilfreich, um immer auf dem neusten Stand zu bleiben. Um diese Anzahl herauszufinden, kann das Paket `npm-check` verwendet werden:
```bash
npm i -D npm-check
```
```js
const { makeBadge } = require('badge-maker');
const npmCheck = require('npm-check');

npmCheck().then(state => {
  const numOutdated = state.get('packages')
    .filter(pkg => !!pkg.bump)  // filtert Abhängigkeiten, denen ein Update (`bump`) zur Verfügung steht
    .length;
  const svgOutdated = makeBadge({
    label: 'outdated',
    message: String(numOutdated),  // Ganzzahl zu String konvertieren
    color: ((numOutdated === 0) ? 'green' : 'red')  // grüne Badge, falls 0 veraltet sind, andernfalls rot
  });
  fs.writeFile('badges/outdated.svg', svgOutdated, err => {
    if (err) console.error(err);
  });
});
```

### Version einer Abhängigkeit ![angular version](assets/badges/version_angular.svg)
Um die Version einer einzelnen Abhängigkeit anzuzeigen, kann wie bei der Version des Projekts wieder auf die `package.json` zugegriffen werden. Dies sollte nur für elementare Abhängigkeiten geschehen (z.B. nur für `angular` in einem Angular-Projekt).
```js
try {
  const angularVersion = require('../package.json').dependencies['@angular/core'];
} catch (err) {  // Fehler sollte auftreten, falls es keine `dependencies` gibt oder '@angular/core' keine Abhängigkeit ist
  const angularVersion = 'not used';
}
// makeBadge...
// writeFile...
```

### Letzte Modifizierung am Projekt ![last updated](assets/badges/last_updated.svg)
Um das Datum der letzten Modifizierung anzuzeigen, kann folgender Ausdruck verwendet werden. Dies ist hilfreich um in Erfahrung zu bringen, wann zuletzt am Projekt gearbeitet wurde.
```js
const today = new Date()
  .toISOString()  // z.B. '2020-12-31T24:59:59.999Z'
  .replace(/T.*/, '');  // entfernt alles ab dem ersten 'T'
// makeBadge...
// writeFile...
```


## Fazit: Einfacher als gedacht!
In diesem Beitrag wurde gezeigt, wie Badges für ein Projekt mithilfe von `badge-maker` (https://www.npmjs.com/package/badge-maker) erstellt werden können. Diese Badges können nützliche Informationen auf einen Blick liefern, wie zum Beispiel die aktuelle Version des Projektes. Dabei ist _nicht_ relevant, ob das Projekt nur privat, auf einem eigenen Server, oder öffentlich verfügbar ist. Uns sind bei der Erstellung also keine Grenzen gesetzt!


## Weiterführende Links
- [`badge-maker` auf npmjs.com](https://www.npmjs.com/package/badge-maker)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/yaml/)
- [GitHub Actions](https://docs.github.com/en/free-pro-team@latest/actions)
- [`npm-check` auf npmjs.com](https://www.npmjs.com/package/npm-check)
- [Array.filter()](https://www.youtube.com/watch?v=qmnH5MT_luk)
- [Reguläre Ausdrücke](https://www.youtube.com/watch?v=7DG3kCDx53c&list=PLRqwX-V7Uu6YEypLuls7iidwHMdCM6o2w)
