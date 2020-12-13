describe('findById()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    it('Should throw an error when id isn\'t of type string.', (done) => {
        try {
            glue.windows.findById(42);

            done('findById() should have thrown an error because id wasn\'t of type string!');
        } catch (error) {
            expect(error.message).to.equal('expected a string, got a number');

            done();
        }
    });

    it('Should return undefined if the window doesn\'t exist.', () => {
        expect(glue.windows.findById('non-existent-window-id')).to.be.undefined;
    });

    it('Should return the window (my).', async () => {
        const myWindow = glue.windows.my();

        const foundWindow = glue.windows.findById(myWindow.id);

        expect(await gtf.windows.compareWindows(foundWindow, myWindow)).to.be.true;
    });

    it('Should return the window (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const foundWindow = glue.windows.findById(newlyOpenedWindow.id);

        expect(await gtf.windows.compareWindows(foundWindow, newlyOpenedWindow)).to.be.true;
    });

    it('Should return the window (Platform).', async () => {
        const platformWindow = await gtf.windows.getPlatformWindow();

        const foundWindow = glue.windows.findById(platformWindow.id);

        expect(await gtf.windows.compareWindows(foundWindow, platformWindow)).to.be.true;
    });
});
