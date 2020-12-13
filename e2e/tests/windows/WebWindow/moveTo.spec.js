describe('moveTo()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.windows.resetWindowDimensions()]);
    });

    it('Should throw an error when top isn\'t of type number.', (done) => {
        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)
            .then((newlyOpenedWindow) => newlyOpenedWindow.moveTo('42', 42))
            .then(() => done('moveTo() should have thrown an error because top isn\'t of type number!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a number, got a string');

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('Should throw an error when left isn\'t of type number.', (done) => {
        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)
            .then((newlyOpenedWindow) => newlyOpenedWindow.moveTo(42, '42'))
            .then(() => done('moveTo() should have thrown an error because left isn\'t of type number!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a number, got a string');

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('Should throw an error when trying to move the Platform.', (done) => {
        let platformWindow;
        const [top, left] = [95, 105];

        gtf.windows.getPlatformWindow()
            .then((platformWin) => {
                platformWindow = platformWin;

                return platformWindow.moveTo(top, left);
            })
            .then(() => done('moveTo() should have thrown an error because the Platform can\'t be moved!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal(`Internal Platform Communication Error. Attempted operation: "moveResize" with data: {"top":${top},"left":${left},"windowId":"${platformWindow.id}","relative":true}.  -> Inner message: The platform rejected operation moveResize for domain: windows with reason: "Move-resizing the main application is not allowed"`);

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });
});
