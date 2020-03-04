const expect = require('chai').expect;
const rewire = require('rewire');
const {
    pathMock,
    lernaChangedMock,
    lernaRunMock,
    changeDetectorMock,
    versionCheckerMock,
    builderMock,
    gitMock
} = require('../mocks/index.js');

describe('validate ', function () {
    const validator = rewire('../../preversion/validator.js');
    const dirname = 'D:/MyWork/MyProject/Scripts';
    const revertFuncs = [];
    const baseMockedConfig = {
        ChangedCommand: lernaChangedMock.ChangedCommand,
        RunCommand: lernaRunMock.RunCommand,
        getUpdatedPackagesNames: changeDetectorMock.getUpdatedPackagesNames,
        synchronizeVersions: versionCheckerMock.synchronizeVersions,
        buildPackages: builderMock.buildPackages,
        Git: gitMock
    };

    before(() => {
        revertFuncs.push(validator.__set__({
            path: pathMock,
            __dirname: dirname
        }));
    });

    after(() => {
        revertFuncs.forEach((func) => func());
    });

    it('should resolve when no updated packages are found', (done) => {
        validator
            .validate(baseMockedConfig)
            .then(() => done())
            .catch(done);
    });
});