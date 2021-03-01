const fs = require('fs');
const path = require('path');

const pathToKarmaRunnerFile = './node_modules/karma/static/client.html';

const fileContents = fs.readFileSync(pathToKarmaRunnerFile).toString();

const patchLocation = '</body>';
const patchContents = `  <script src="web.umd.js"></script>
  <script>(async () => {window.glue = await GlueWeb();})();</script>
${patchLocation}`;

const patchedFileContents = fileContents.replace(patchLocation, patchContents);

fs.writeFileSync(pathToKarmaRunnerFile, patchedFileContents);
