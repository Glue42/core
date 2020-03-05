const { join } = require('path');
const Git = require('simple-git/promise');

const validate = async ({ getUpdatedPackagesNames, synchronizeVersions, buildPackages }) => {
    const rootDirectory = join(__dirname, '../..');

    const git = Git(rootDirectory);

    console.log('starting version validating');
    const updatedNames = await getUpdatedPackagesNames();

    if (!updatedNames || !updatedNames.length) {
        console.log('No updated packages found');
        return;
    }

    console.log(`found updated packages: ${JSON.stringify(updatedNames)}, continuing with version synchronizing`);
    await synchronizeVersions(updatedNames, git, rootDirectory);

    console.log('all versions are synchronized, continuing with packages build');
    await buildPackages(updatedNames);

    console.log('all packages are built, committing pre-version validation');
    await git.add('.');
    await git.commit('Pre-version validation');
};

module.exports.validate = validate;