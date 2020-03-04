const { join } = require('path');

const validate = async ({ ChangedCommand, RunCommand, getUpdatedPackagesNames, synchronizeVersions, buildPackages, Git }) => {
    const rootDirectory = join(__dirname, '..');
    const git = Git(rootDirectory);

    console.log(`starting version validating`);
    const updatedNames = await getUpdatedPackagesNames(ChangedCommand);

    if (!updatedNames || !updatedNames.length) {
        console.log(`No updated packages found`);
        return;
    }

    console.log(`found updated packages: ${JSON.stringify(updatedNames)}, continuing with version synchronizing`);
    await synchronizeVersions(updatedNames, git);

    console.log(`all versions are synchronized, continuing with packages build`);
    await buildPackages(updatedNames, RunCommand);

    console.log(`all packages are built, committing pre-version validation`);
    await git.add('.');
    await git.commit('Pre-version validation');
};

module.exports.validate = validate;