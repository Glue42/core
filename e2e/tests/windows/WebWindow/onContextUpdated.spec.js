describe('onContextUpdated()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.clearWindowActiveHooks()]);
    });


    it('Should throw an error when callback isn\'t of type function.', (done) => {
        try {
            glue.windows.my().onContextUpdated(42);

            done('onContextUpdated() should have thrown an error because callback wasn\'t of type function!');
        } catch (error) {
            expect(error.message).to.equal('Cannot subscribe to context changes, because the provided callback is not a function!');

            done();
        }
    });

    it('Should invoke the callback with the new context and window (`setContext()`).', (done) => {
        const expectedContext = {
            a: 42,
            b: '42',
            c: new Date(),
            d: {
                e: 42
            },
            f: true
        };

        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)
            .then((newlyOpenedWindow) => {
                const unsubscribeFunc = newlyOpenedWindow.onContextUpdated(async (context, window) => {
                    try {
                        expect(await newlyOpenedWindow.getContext()).to.eql(expectedContext);
                        expect(context).to.eql(expectedContext);
                        expect(await gtf.windows.compareWindows(newlyOpenedWindow, window)).to.be.true;

                        done();
                    } catch (error) {
                        done(error);
                    }
                });
                gtf.addWindowHook(unsubscribeFunc);

                newlyOpenedWindow.setContext(expectedContext);
            });
    });

    it('Should invoke the callback with the new context and window (`updateContext()`).', (done) => {
        const expectedContext = {
            a: 42,
            b: '42',
            c: new Date(),
            d: {
                e: 42
            },
            f: true
        };

        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)
            .then((newlyOpenedWindow) => {
                const unsubscribeFunc = newlyOpenedWindow.onContextUpdated(async (context, window) => {
                    try {
                        expect(await newlyOpenedWindow.getContext()).to.eql(expectedContext);
                        expect(context).to.eql(expectedContext);
                        expect(await gtf.windows.compareWindows(newlyOpenedWindow, window)).to.be.true;

                        done();
                    } catch (error) {
                        done(error);
                    }
                });
                gtf.addWindowHook(unsubscribeFunc);

                newlyOpenedWindow.updateContext(expectedContext);
            });
    });

    it('Should return a working unsubscribe function.', async () => {
        let contextUpdated = false;

        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const unsubscribeFunc = newlyOpenedWindow.onContextUpdated(() => {
            contextUpdated = true;
        });
        unsubscribeFunc();

        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (contextUpdated) {
                    return reject(new Error('The context was updated.'));
                }

                return resolve();
            }, 3000);
        });

        await newlyOpenedWindow.setContext({
            abc: 42
        });

        return timeoutPromise;
    });

    it('Should not invoke the callback when the setup is there but no window is added (3k ms).', async () => {
        let contextUpdated = false;

        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const unsubscribeFunc = newlyOpenedWindow.onContextUpdated(() => {
            contextUpdated = true;
        });
        gtf.addWindowHook(unsubscribeFunc);

        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (contextUpdated) {
                    return reject(new Error('The context was updated.'));
                }

                return resolve();
            }, 3000);
        });

        return timeoutPromise;
    });
});
