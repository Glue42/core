describe('onWindowAdded()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.clearWindowActiveHooks()]);
    });


    it('Should throw an error when callback isn\'t of type function.', (done) => {
        try {
            glue.windows.onWindowAdded(42);

            done('onWindowAdded() should have thrown an error because callback wasn\'t of type function!');
        } catch (error) {
            expect(error.message).to.equal('Cannot subscribe to window added, because the provided callback is not a function!');

            done();
        }
    });

    for (const openWindowsCount of [1, 2, 5, 10]) {
        it(`Should invoke the callback with the newly added window (${openWindowsCount}).`, async () => {
            const windowNames = Array.from({ length: openWindowsCount }).map(() => gtf.windows.getWindowName());

            const windowAddedWindows = [];

            const unsubscribeFunc = glue.windows.onWindowAdded((newlyOpenedWindow) => {
                windowAddedWindows.push(newlyOpenedWindow);
            });
            gtf.addWindowHook(unsubscribeFunc);

            const newlyOpenedWindows = await Promise.all(windowNames.map((windowName) => glue.windows.open(windowName, gtf.windows.SUPPORT_DETAILS.url)));

            expect(windowAddedWindows).to.be.of.length(openWindowsCount);

            for (const windowAddedWindow of windowAddedWindows) {
                const expectedWindow = newlyOpenedWindows.find((newlyOpenedWindow) => newlyOpenedWindow.id === windowAddedWindow.id);

                expect(await gtf.windows.compareWindows(windowAddedWindow, expectedWindow)).to.be.true;
            }
        });
    }

    it('Should return a working unsubscribe function.', async () => {
        let windowAdded = false;

        const unsubscribeFunc = glue.windows.onWindowAdded(() => {
            windowAdded = true;
        });
        unsubscribeFunc();

        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (windowAdded) {
                    return reject(new Error('A window was added.'));
                }

                return resolve();
            }, 3000);
        });

        await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        return timeoutPromise;
    });

    it('Should not invoke the callback when the setup is there but no window is added (3k ms).', async () => {
        let windowAdded = false;

        const unsubscribeFunc = glue.windows.onWindowAdded(() => {
            windowAdded = true;
        });
        gtf.addWindowHook(unsubscribeFunc);

        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (windowAdded) {
                    return reject(new Error('A window was added.'));
                }

                return resolve();
            }, 3000);
        });

        return timeoutPromise;
    });
});
