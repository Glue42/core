describe('my()', () => {
    before(() => {
        return coreReady;
    });

    it('Should return the current window.', async () => {
        const myWindow = glue.windows.my();

        const myURL = await myWindow.getURL();

        if (RUNNER === gtf.windows.PLATFORM_DETAILS.name) {
            expect(myWindow.name).to.equal(RUNNER);
            expect(myURL).to.equal(gtf.windows.PLATFORM_DETAILS.url);
        } else {
            expect(myWindow.name.startsWith(gtf.windows.RUNNER_DETAILS.name)).to.be.true;
            expect(myURL).to.equal(gtf.windows.RUNNER_DETAILS.url);
        }
    });
});
