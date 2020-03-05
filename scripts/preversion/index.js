const { getUpdatedPackagesNames } = require('./change-detector.js');
const { synchronizeVersions } = require('./version-checker.js');
const { buildPackages } = require('./package-builder.js');
const validate = require('./validator.js').validate;

validate({ getUpdatedPackagesNames, synchronizeVersions, buildPackages })
    .then(() => console.log('Pre-version validation completed'))
    .catch(console.error);
