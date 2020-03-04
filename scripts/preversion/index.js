const { ChangedCommand } = require('@lerna/changed');
const { RunCommand } = require('@lerna/run');
const { getUpdatedPackagesNames } = require('./change-detector.js');
const { synchronizeVersions } = require('./version-checker.js');
const { buildPackages } = require('./package-builder.js');

const Git = require('simple-git/promise');
const validate = require('./validator.js').validate;

validate({
    ChangedCommand,
    RunCommand,
    getUpdatedPackagesNames,
    synchronizeVersions,
    buildPackages,
    Git
}).then(() => console.log('Pre-version validation completed'));
