describe('list()', () => {
    let INITIAL_WINDOWS_COUNT;

    let platformWindow;

    before(async () => {
        await coreReady;

        INITIAL_WINDOWS_COUNT = RUNNER === gtf.windows.PLATFORM_DETAILS.name ? 1 : 2;

        platformWindow = await gtf.windows.getPlatformWindow();
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.clearWindowActiveHooks()]);
    });

    for (const openWindowsCount of [1, 2, 5, 10]) {
        it(`Should return all currently opened windows (${openWindowsCount}).`, async () => {
            const myWindow = glue.windows.my();

            const windowNames = Array.from({ length: openWindowsCount }).map(() => gtf.windows.getWindowName());

            const newlyOpenedWindows = await Promise.all(windowNames.map((windowName) => glue.windows.open(windowName, gtf.windows.SUPPORT_DETAILS.url)));

            const listWindows = glue.windows.list();

            expect(listWindows).to.be.of.length(openWindowsCount + INITIAL_WINDOWS_COUNT);

            for (const listWindow of listWindows) {
                if (listWindow.id === myWindow.id) {
                    expect(await gtf.windows.compareWindows(listWindow, myWindow)).to.be.true;
                } else if (listWindow.id === platformWindow.id) {
                    expect(await gtf.windows.compareWindows(listWindow, platformWindow)).to.be.true;
                } else {
                    const expectedWindow = newlyOpenedWindows.find((newlyOpenedWindow) => newlyOpenedWindow.id === listWindow.id);

                    expect(await gtf.windows.compareWindows(listWindow, expectedWindow)).to.be.true;
                }
            }
        });
    }

    it('Should be populated before `open()` resolves.', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        expect(glue.windows.list()).to.be.of.length(INITIAL_WINDOWS_COUNT + 1);
        expect(glue.windows.list().some((window) => window.id === glue.windows.my().id)).to.be.true;
        expect(glue.windows.list().some((window) => window.id === newlyOpenedWindow.id)).to.be.true;
        expect(glue.windows.list().some((window) => window.id === platformWindow.id)).to.be.true;
    });

    it('Should be populated before `onWindowAdded()` is called.', (done) => {
        const unsubscribeFunc = glue.windows.onWindowAdded((newlyOpenedWindow) => {
            try {
                expect(glue.windows.list()).to.be.of.length(INITIAL_WINDOWS_COUNT + 1);
                expect(glue.windows.list().some((window) => window.id === glue.windows.my().id)).to.be.true;
                expect(glue.windows.list().some((window) => window.id === newlyOpenedWindow.id)).to.be.true;
                expect(glue.windows.list().some((window) => window.id === platformWindow.id)).to.be.true;

                done();
            } catch (error) {
                done(error);
            }
        });
        gtf.addWindowHook(unsubscribeFunc);

        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);
    });

    it('Should be updated before `close()` resolves.', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        expect(glue.windows.list()).to.be.of.length(INITIAL_WINDOWS_COUNT + 1);
        expect(glue.windows.list().some((window) => window.id === glue.windows.my().id)).to.be.true;
        expect(glue.windows.list().some((window) => window.id === newlyOpenedWindow.id)).to.be.true;

        await newlyOpenedWindow.close();

        expect(glue.windows.list()).to.be.of.length(INITIAL_WINDOWS_COUNT);
        expect(glue.windows.list().some((window) => window.id === glue.windows.my().id)).to.be.true;
    });

    it('Should be updated before `onWindowRemoved()` is called.', (done) => {
        let newlyOpenedWindowId;

        glue.windows.onWindowRemoved((closedWindow) => {
            try {
                expect(closedWindow.id).to.equal(newlyOpenedWindowId);
                expect(glue.windows.list()).to.be.of.length(INITIAL_WINDOWS_COUNT);
                expect(glue.windows.list().some((window) => window.id === glue.windows.my().id)).to.be.true;

                done();
            } catch (error) {
                done(error);
            }
        });

        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)
            .then((newlyOpenedWindow) => {
                newlyOpenedWindowId = newlyOpenedWindow.id;

                try {
                    expect(glue.windows.list()).to.be.of.length(INITIAL_WINDOWS_COUNT + 1);
                    expect(glue.windows.list().some((window) => window.id === glue.windows.my().id)).to.be.true;
                    expect(glue.windows.list().some((window) => window.id === newlyOpenedWindow.id)).to.be.true;
                } catch (error) {
                    done(error);
                }

                return newlyOpenedWindow.close();
            });
    });
});
