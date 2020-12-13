describe('resizeTo()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.windows.resetWindowDimensions()]);
    });

    it('Should throw an error when width isn\'t of type number.', (done) => {
        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)
            .then((newlyOpenedWindow) => newlyOpenedWindow.resizeTo('42', 42))
            .then(() => done('resizeTo() should have thrown an error because width isn\'t of type number!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a number, got a string');

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('Should throw an error when height isn\'t of type number.', (done) => {
        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)
            .then((newlyOpenedWindow) => newlyOpenedWindow.resizeTo(42, '42'))
            .then(() => done('resizeTo() should have thrown an error because height isn\'t of type number!'))
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
        const [width, height] = [95, 105];

        gtf.windows.getPlatformWindow()
            .then((platformWin) => {
                platformWindow = platformWin;

                return platformWindow.resizeTo(width, height);
            })
            .then(() => done('resizeTo() should have thrown an error because the Platform can\'t be moved!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal(`Internal Platform Communication Error. Attempted operation: "moveResize" with data: {"width":${width},"height":${height},"windowId":"${platformWindow.id}","relative":true}.  -> Inner message: The platform rejected operation moveResize for domain: windows with reason: "Move-resizing the main application is not allowed"`);

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });
});
