const expect = require('chai').expect;
const validator = require('../../preversion/validator.js');
const mockery = require('mockery');
const {
    pathMock,
    changeDetectorMock,
    versionCheckerMock,
    builderMock,
    gitMock
} = require('../mocks/index.js');

describe('validate ', function () {
    const baseMockedConfig = {
        getUpdatedPackagesNames: changeDetectorMock.getUpdatedPackagesNames,
        synchronizeVersions: versionCheckerMock.synchronizeVersions,
        buildPackages: builderMock.buildPackages
    };

    before(() => {
        mockery.enable();
        mockery.registerMock('path', pathMock);
        mockery.registerMock('simple-git/promise', () => {
            return gitMock;
        });
    });

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should resolve when no updated packages are found', (done) => {
        validator
            .validate(baseMockedConfig)
            .then(() => done())
            .catch(done);
    });
});