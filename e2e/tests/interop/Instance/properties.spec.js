describe('properties', () => {
    before(() => {
        return coreReady;
    });

    describe('application', () => {
        it('Should include RUNNER.', (done) => {
            expect(glue.interop.instance.application.includes(RUNNER)).to.be.true;
            done();
        });
    });

    describe('environment', () => {
        // In Glue42 Core the environment is null and not a string!
        it('Should be null.', (done) => {
            expect(glue.interop.instance.environment).to.be.null;
            done();
        });
    });
    describe('machine', () => {
        it('Should not be undefined.', (done) => {
            expect(glue.interop.instance.machine).to.not.be.undefined;
            done();
        });
    });

    describe('pid', () => {
        it('Should not be undefined.', (done) => {
            expect(glue.interop.instance.pid).to.not.be.undefined;
            done();
        });
    });

    describe('region', () => {
        // In Glue42 Core the region is null and not a string!
        it('Should be null.', (done) => {
            expect(glue.interop.instance.region).to.be.null;
            done();
        });
    });

    describe('user', () => {
        it('Should not be undefined.', (done) => {
            expect(glue.interop.instance.user).to.not.be.undefined;
            done();
        });
    });
});
