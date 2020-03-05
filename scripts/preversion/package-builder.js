const { RunCommand } = require('@lerna/run');

module.exports.buildPackages = async (updatedNames) => {
    const script = 'build';
    const scope = `{${updatedNames.join(',')}}`;
    const command = new RunCommand({ script, scope });
    await command.runner;
};