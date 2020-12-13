describe('close()', () => {
    let INITIAL_WINDOWS_COUNT;

    before(async () => {
        await coreReady;

        INITIAL_WINDOWS_COUNT = RUNNER === gtf.windows.PLATFORM_DETAILS.name ? 1 : 2;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    it('Should throw an error when trying to close the Platform.', (done) => {
        let platformWindow;

        gtf.windows.getPlatformWindow()
            .then((platformWin) => {
                platformWindow = platformWin;

                return platformWindow.close();
            })
            .then(() => done('close() should have thrown an error because the Platform can\'t be closed!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal(`Internal Platform Communication Error. Attempted operation: "close" with data: {"windowId":"${platformWindow.id}"}.  -> Inner message: The platform rejected operation close for domain: windows with reason: "Closing the main application is not allowed"`);

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    for (const openWindowsCount of [1, 2, 5, 10]) {
        it(`Should close the window (${openWindowsCount}).`, async () => {
            const myWindow = glue.windows.my();

            const windowNames = Array.from({ length: openWindowsCount }).map(() => gtf.windows.getWindowName());

            const newlyOpenedWindows = await Promise.all(windowNames.map((windowName) => glue.windows.open(windowName, gtf.windows.SUPPORT_DETAILS.url)));

            const listWindowsBefore = glue.windows.list();

            expect(listWindowsBefore).to.be.of.length(openWindowsCount + INITIAL_WINDOWS_COUNT);

            for (const listWindow of listWindowsBefore) {
                if (listWindow.id === myWindow.id) {
                    expect(await gtf.windows.compareWindows(listWindow, myWindow)).to.be.true;
                } else {
                    const expectedWindow = newlyOpenedWindows.find((newlyOpenedWindow) => newlyOpenedWindow.id === listWindow.id);

                    expect(await gtf.windows.compareWindows(listWindow, expectedWindow)).to.be.true;
                }
            }

            await Promise.all(newlyOpenedWindows.map((newlyOpenedWindow) => newlyOpenedWindow.close()));

            const listWindowsAfter = glue.windows.list();

            expect(listWindowsAfter).to.be.of.length(INITIAL_WINDOWS_COUNT);
            expect(await gtf.windows.compareWindows(listWindowsAfter[0], myWindow)).to.be.true;
        });
    }

    it('Should return a promise that resolves with the window.', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const closedWindow = await newlyOpenedWindow.close();

        expect(await gtf.windows.compareClosedWindows(newlyOpenedWindow, closedWindow)).to.be.true;
    });
});
