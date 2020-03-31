const version = require('../package.json').version;
const fs = require('fs');

if (version.indexOf('-') === -1) {
    // beta, alpha, rc, dev versions are ok to go without changelog
    const file = fs.readFileSync('./changelog.md', 'utf-8');
    let lines = file.toString().split('\n');
    // remove lines that start with -
    lines = lines.filter((line) => !line.trim().startsWith('-'));

    if (lines.indexOf(version) === -1) {
        console.error(`missing info about ${version} in changelog.md, found versions are ${JSON.stringify(lines)}`);
        process.exit(1);
    }
}
