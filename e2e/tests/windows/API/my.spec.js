describe('my()', () => {
    before(() => {
        return coreReady;
    });

    it('Should return the current window.', async () => {
        const myWindow = glue.windows.my();

        const myURL = await myWindow.getURL();

        expect(myWindow.name).to.equal(RUNNER);
        expect(myURL).to.equal(RUNNER === gtf.windows.PLATFORM_DETAILS.name ? gtf.windows.PLATFORM_DETAILS.url : gtf.windows.SUPPORT_DETAILS.url);
    });
});
