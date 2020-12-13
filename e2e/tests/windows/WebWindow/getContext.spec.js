describe('getContext()', () => {
    const CONTEXT = {
        a: 42,
        b: '42',
        c: new Date(),
        d: {
            e: 42
        },
        f: true
    };

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    it('Should return a promise that resolves with the context.', async () => {
        const options = {
            context: CONTEXT
        };

        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url, options);

        expect(await newlyOpenedWindow.getContext()).to.eql(CONTEXT);
    });

    it('Should be populated before `onContextUpdated()` is called.', (done) => {
        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)
            .then((newlyOpenedWindow) => newlyOpenedWindow.setContext(CONTEXT))
            .then((newlyOpenedWindow) => {
                const unsubscribeFunc = newlyOpenedWindow.onContextUpdated(async (newContext) => {
                    try {
                        const newlyOpenedWindowContext = await newlyOpenedWindow.getContext();

                        expect(newlyOpenedWindowContext).to.eql(CONTEXT);
                        expect(newContext).to.eql(CONTEXT);

                        done();
                    } catch (error) {
                        done(error);
                    }
                });
                gtf.addWindowHook(unsubscribeFunc);
            });
    });
});
