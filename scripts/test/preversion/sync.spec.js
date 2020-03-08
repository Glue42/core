// const expect = require('chai').expect;
const mockery = require('mockery');
const {
    pathMock,
    changeDetectorMock,
    versionCheckerMock,
} = require('../mocks/index.js');

describe('validate ', function () {
    let sync;
    before(() => {
        mockery.enable();
        mockery.registerMock('path', pathMock);
        mockery.registerMock('./change-detector.js', changeDetectorMock);
        mockery.registerMock('./version-checker.js', versionCheckerMock);
        sync = require('../../preversion/sync.js');
    });

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should resolve when no updated packages are found', (done) => {
        sync()
            .then(() => done())
            .catch(done);
    });
});