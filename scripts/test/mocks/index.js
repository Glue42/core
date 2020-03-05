const pathMock = {
    join: () => console.log('called join')
};

const fsMock = {};

const lernaChangedMock = {
    ChangedCommand: {}
};

const lernaRunMock = {
    RunCommand: {}
};

const changeDetectorMock = {
    getUpdatedPackagesNames: () => console.log('called getUpdatedPackagesNames')
};

const versionCheckerMock = {
    synchronizeVersions: () => console.log('called synchronizeVersions')
};

const builderMock = {
    buildPackages: () => console.log('called buildPackages')
};

const gitMock = () => {
    return {
        add: () => console.log('called git add'),
        commit: () => console.log('called git add')
    };
};

module.exports = {
    pathMock,
    fsMock,
    lernaChangedMock,
    lernaRunMock,
    changeDetectorMock,
    versionCheckerMock,
    builderMock,
    gitMock
};