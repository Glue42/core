const { join } = require('path');
const fs = require('fs');
const { ChangedCommand } = require('@lerna/changed');
const { RunCommand } = require('@lerna/run');
const { getUpdatedPackagesNames } = require('./change-detector.js');
const { synchronizeVersions } = require('./version-checker.js');
const { buildPackages } = require('./package-builder.js');

const rootDirectory = join(__dirname, '..');
const git = require('simple-git/promise')(rootDirectory);

const validate = async () => {

    console.log(`starting version validating`);

    const updatedNames = await getUpdatedPackagesNames(ChangedCommand);

    if (!updatedNames || !updatedNames.length) {
        console.log(`No updated packages found`);
        return;
    }

    console.log(`found updated packages: ${JSON.stringify(updatedNames)}, continuing with version synchronizing`);
    await synchronizeVersions(updatedNames, git, fs);

    console.log(`all versions are synchronized, continuing with packages build`);
    await buildPackages(updatedNames, RunCommand);

    console.log(`all packages are built, committing pre-version validation`);
    await git.add('.');
    await git.commit('Pre-version validation');
};

validate().then(() => console.log('Pre-version validation completed'));