describe('getBounds()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    it('Should return a promise that resolves with the bounds.', async () => {
        const [top, left, width, height] = [100, 200, 300, 400];
        const options = {
            top,
            left,
            width,
            height
        };

        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url, options);

        expect(await newlyOpenedWindow.getBounds()).to.eql(options);
    });
});
