describe('moveResize()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.windows.resetWindowDimensions()]);
    });

    it('Should throw an error when dimension isn\'t of type object.', (done) => {
        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)
            .then((newlyOpenedWindow) => newlyOpenedWindow.moveResize(42))
            .then(() => done('moveResize() should have thrown an error because dimensions aren\'t of type object!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected an object, got a number');

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('Should throw an error when trying to move the Platform.', (done) => {
        let platformWindow;
        const newDimensions = { top: 95, left: 105 };

        gtf.windows.getPlatformWindow()
            .then((platformWin) => {
                platformWindow = platformWin;

                return platformWindow.moveResize(newDimensions);
            })
            .then(() => done('moveResize() should have thrown an error because the Platform can\'t be moveResized!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal(`Internal Platform Communication Error. Attempted operation: "moveResize" with data: {"top":${newDimensions.top},"left":${newDimensions.left},"windowId":"${platformWindow.id}","relative":false}.  -> Inner message: The platform rejected operation moveResize for domain: windows with reason: "Move-resizing the main application is not allowed"`);

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('Should throw an error when trying to resize the Platform.', (done) => {
        let platformWindow;
        const newDimensions = { width: 395, height: 405 };

        gtf.windows.getPlatformWindow()
            .then((platformWin) => {
                platformWindow = platformWin;

                return platformWindow.moveResize(newDimensions);
            })
            .then(() => done('moveResize() should have thrown an error because the Platform can\'t be moveResized!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal(`Internal Platform Communication Error. Attempted operation: "moveResize" with data: {"width":${newDimensions.width},"height":${newDimensions.height},"windowId":"${platformWindow.id}","relative":false}.  -> Inner message: The platform rejected operation moveResize for domain: windows with reason: "Move-resizing the main application is not allowed"`);

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    coreReady.then(() => {
        if (RUNNER !== gtf.windows.PLATFORM_DETAILS.name) {
            it('Should return a promise that resolves with the window (my).', async () => {
                const newDimensions = { top: 95, left: 105, width: 295, height: 305 };

                const myWindow = glue.windows.my();

                const window = await myWindow.moveResize(newDimensions);

                expect(await gtf.windows.compareWindows(window, myWindow)).to.be.true;
            });
        }
    });

    it('Should return a promise that resolves with the window (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const newDimensions = { top: 95, left: 105, width: 295, height: 305 };

        const window = await newlyOpenedWindow.moveResize(newDimensions);

        expect(await gtf.windows.compareWindows(window, newlyOpenedWindow)).to.be.true;
    });
});
