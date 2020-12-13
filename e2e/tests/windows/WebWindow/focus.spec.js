describe('focus()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    it('Should throw an error when trying to focus the Platform.', (done) => {
        let platformWindow;

        gtf.windows.getPlatformWindow()
            .then((platformWin) => {
                platformWindow = platformWin;

                return platformWindow.focus();
            })
            .then(() => done('focus() should have thrown an error because the Platform can\'t be focused!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal(`Internal Platform Communication Error. Attempted operation: "focus" with data: {"windowId":"${platformWindow.id}"}.  -> Inner message: The platform rejected operation focus for domain: windows with reason: "Focusing the main application is not allowed"`);

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('Should return a promise that resolves with the window.', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const focusedWindow = await newlyOpenedWindow.focus();

        expect(await gtf.windows.compareWindows(newlyOpenedWindow, focusedWindow)).to.be.true;
    });
});
