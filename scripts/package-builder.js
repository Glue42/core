module.exports.buildPackages = async (updatedNames, RunCommand) => {
    const script = `build`;
    const scope = `{${updatedNames.join(',')}}`;
    const command = new RunCommand({ script, scope });
    await command.runner;
};