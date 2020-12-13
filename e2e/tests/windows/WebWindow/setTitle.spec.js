describe('setTitle()', () => {
    const NEW_TITLE = 'Test title';

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.windows.resetTitles()]);
    });

    it('Should throw an error when title isn\'t of type string.', (done) => {
        glue.windows.my().setTitle(42)
            .then(() => done('setTitle() should have thrown an error because title wasn\'t of type string!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a string, got a number');

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('Should set the title (my).', async () => {
        const myWindow = glue.windows.my();

        await myWindow.setTitle(NEW_TITLE);

        expect(await myWindow.getTitle()).to.equal(NEW_TITLE);
    });

    it('Should set the title (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        await newlyOpenedWindow.setTitle(NEW_TITLE);

        expect(await newlyOpenedWindow.getTitle()).to.equal(NEW_TITLE);
    });

    it('Should set the title (Platform).', async () => {
        const platformWindow = await gtf.windows.getPlatformWindow();

        await platformWindow.setTitle(NEW_TITLE);

        expect(await platformWindow.getTitle()).to.equal(NEW_TITLE);
    });

    it('Should set the title (my).', async () => {
        const myWindow = glue.windows.my();

        const window = await myWindow.setTitle(NEW_TITLE);

        expect(await gtf.windows.compareWindows(window, myWindow)).to.be.true;
    });

    it('Should set the title (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const window = await newlyOpenedWindow.setTitle(NEW_TITLE);

        expect(await gtf.windows.compareWindows(window, newlyOpenedWindow)).to.be.true;
    });

    it('Should set the title (Platform).', async () => {
        const platformWindow = await gtf.windows.getPlatformWindow();

        const window = await platformWindow.setTitle(NEW_TITLE);

        expect(await gtf.windows.compareWindows(window, platformWindow)).to.be.true;
    });
});
