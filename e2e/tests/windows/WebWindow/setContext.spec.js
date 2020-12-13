describe('setContext()', () => {
    const CONTEXT = {
        a: 42,
        b: '42',
        c: new Date(),
        d: {
            e: 42
        },
        f: true
    };
    const NEW_CONTEXT = {
        a: 422,
        b: '422',
        c: {
            d: 422
        },
        e: false,
        z: new Date()
    };

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.windows.resetWindowContexts()]);
    });

    it('Should set the context of the window (my).', async () => {
        const myWindow = glue.windows.my();

        await myWindow.setContext(CONTEXT);

        expect(await myWindow.getContext()).to.eql(CONTEXT);
    });

    it('Should set the context of the window (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        await newlyOpenedWindow.setContext(CONTEXT);

        expect(await newlyOpenedWindow.getContext()).to.eql(CONTEXT);
    });

    it('Should set the context of the window (Platform).', async () => {
        const platformWindow = await gtf.windows.getPlatformWindow();

        await platformWindow.setContext(CONTEXT);

        expect(await platformWindow.getContext()).to.eql(CONTEXT);
    });

    it('Should return a promise that resolves with the title (my).', async () => {
        const myWindow = glue.windows.my();

        const window = await myWindow.setContext(CONTEXT);

        expect(await gtf.windows.compareWindows(window, myWindow)).to.be.true;
    });

    it('Should return a promise that resolves with the title (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const window = await newlyOpenedWindow.setContext(CONTEXT);

        expect(await gtf.windows.compareWindows(window, newlyOpenedWindow)).to.be.true;
    });

    it('Should return a promise that resolves with the title (Platform).', async () => {
        const platformWindow = await gtf.windows.getPlatformWindow();

        const window = await platformWindow.setContext(CONTEXT);

        expect(await gtf.windows.compareWindows(window, platformWindow)).to.be.true;
    });

    it('Should overwrite the context of the window (my).', async () => {
        const myWindow = glue.windows.my();

        await myWindow.setContext(CONTEXT);

        expect(await myWindow.getContext()).to.eql(CONTEXT);

        await myWindow.setContext(NEW_CONTEXT);

        expect(await myWindow.getContext()).to.eql(NEW_CONTEXT);
    });

    it('Should overwrite the context of the window (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        await newlyOpenedWindow.setContext(CONTEXT);

        expect(await newlyOpenedWindow.getContext()).to.eql(CONTEXT);

        await newlyOpenedWindow.setContext(NEW_CONTEXT);

        expect(await newlyOpenedWindow.getContext()).to.eql(NEW_CONTEXT);
    });

    it('Should overwrite the context of the window (Platform).', async () => {
        const platformWindow = await gtf.windows.getPlatformWindow();

        await platformWindow.setContext(CONTEXT);

        expect(await platformWindow.getContext()).to.eql(CONTEXT);

        await platformWindow.setContext(NEW_CONTEXT);

        expect(await platformWindow.getContext()).to.eql(NEW_CONTEXT);
    });
});
