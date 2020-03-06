const { join } = require('path');
const { getUpdatedPackagesNames } = require('./change-detector.js');
const { synchronizeVersions } = require('./version-checker.js');

const sync = async (git, doCommit) => {
    const rootDirectory = join(__dirname, '../..');

    console.log('starting version validating');
    const updatedNames = await getUpdatedPackagesNames();

    if (!updatedNames || !updatedNames.length) {
        console.log('No updated packages found');
        return;
    }

    console.log(`found updated packages: ${JSON.stringify(updatedNames)}, continuing with version synchronizing`);
    await synchronizeVersions(updatedNames, git, rootDirectory);

    if (git && doCommit) {
        console.log('all packages are synced, committing pre-version validation');
        await git.add('.');
        await git.commit('Pre-version validation');
        return;
    }

    console.log('Skipping git add/commit, packages are synced.');
};

module.exports.sync = sync;