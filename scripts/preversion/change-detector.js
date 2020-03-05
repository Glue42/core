const { ChangedCommand } = require('@lerna/changed');

module.exports.getUpdatedPackagesNames = async () => {
    const argv = {
        _: ['changed'],
        json: true
    };

    const command = new ChangedCommand(argv);
    await command.runner;

    const updatedPackages = JSON.parse(command.result.text);

    return updatedPackages.map((pkg) => pkg.name);
};
