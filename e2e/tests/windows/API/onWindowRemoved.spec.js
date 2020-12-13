describe('onWindowRemoved()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.clearWindowActiveHooks()]);
    });


    it('Should throw an error when callback isn\'t of type function.', (done) => {
        try {
            glue.windows.onWindowRemoved(42);

            done('onWindowRemoved() should have thrown an error because callback wasn\'t of type function!');
        } catch (error) {
            expect(error.message).to.equal('Cannot subscribe to window removed, because the provided callback is not a function!');

            done();
        }
    });

    for (const openWindowsCount of [1, 2, 5, 10]) {
        it(`Should invoke the callback with the removed window (${openWindowsCount}).`, async () => {
            const windowNames = Array.from({ length: openWindowsCount }).map(() => gtf.windows.getWindowName());

            const windowRemovedWindows = [];

            const unsubscribeFunc = glue.windows.onWindowRemoved((closedWindow) => {
                windowRemovedWindows.push(closedWindow);
            });
            gtf.addWindowHook(unsubscribeFunc);

            const newlyOpenedWindows = await Promise.all(windowNames.map((windowName) => glue.windows.open(windowName, gtf.windows.SUPPORT_DETAILS.url)));

            const closedNewlyOpenedWindows = await Promise.all(newlyOpenedWindows.map((newlyOpenedWindow) => newlyOpenedWindow.close()));

            expect(windowRemovedWindows).to.be.of.length(openWindowsCount);

            for (const closedWindow of windowRemovedWindows) {
                const expectedWindow = closedNewlyOpenedWindows.find((closedNewlyOpenedWindow) => closedNewlyOpenedWindow.id === closedWindow.id);

                expect(await gtf.windows.compareClosedWindows(closedWindow, expectedWindow)).to.be.true;
            }
        });
    }

    it('Should return a working unsubscribe function.', async () => {
        let windowRemoved = false;

        const unsubscribeFunc = glue.windows.onWindowRemoved(() => {
            windowRemoved = true;
        });
        unsubscribeFunc();

        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (windowRemoved) {
                    return reject(new Error('A window was removed.'));
                }

                return resolve();
            }, 3000);
        });

        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        await newlyOpenedWindow.close();

        return timeoutPromise;
    });

    it('Should not invoke the callback when the setup is there but no window is removed (3k ms).', async () => {
        let windowRemoved = false;

        const unsubscribeFunc = glue.windows.onWindowRemoved(() => {
            windowRemoved = true;
        });
        gtf.addWindowHook(unsubscribeFunc);

        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (windowRemoved) {
                    return reject(new Error('A window was removed.'));
                }

                return resolve();
            }, 3000);
        });

        await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        return timeoutPromise;
    });
});
