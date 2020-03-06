// const expect = require('chai').expect;
const mockery = require('mockery');
const {
    pathMock,
    changeDetectorMock,
    versionCheckerMock,
} = require('../mocks/index.js');

describe('validate ', function () {
    let validator;
    before(() => {
        mockery.enable();
        mockery.registerMock('path', pathMock);
        mockery.registerMock('./change-detector.js', changeDetectorMock);
        mockery.registerMock('./version-checker.js', versionCheckerMock);
        validator = require('../../preversion/validator.js');
    });

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should resolve when no updated packages are found', (done) => {
        validator
            .validate({})
            .then(() => done())
            .catch(done);
    });
});