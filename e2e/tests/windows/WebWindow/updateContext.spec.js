describe('updateContext()', () => {
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
    const EXPECTED_CONTEXT = {
        ...CONTEXT,
        ...NEW_CONTEXT
    };

    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return Promise.all([gtf.windows.closeAllOtherWindows(), gtf.windows.resetWindowContexts()]);
    });

    it('Should set the context of the window (my).', async () => {
        const myWindow = glue.windows.my();

        await myWindow.updateContext(CONTEXT);

        expect(await myWindow.getContext()).to.eql(CONTEXT);
    });

    it('Should set the context of the window (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        await newlyOpenedWindow.updateContext(CONTEXT);

        expect(await newlyOpenedWindow.getContext()).to.eql(CONTEXT);
    });

    it('Should set the context of the window (Platform).', async () => {
        const platformWindow = await gtf.windows.getPlatformWindow();

        await platformWindow.updateContext(CONTEXT);

        expect(await platformWindow.getContext()).to.eql(CONTEXT);
    });

    it('Should return a promise that resolves with the title (my).', async () => {
        const myWindow = glue.windows.my();

        const window = await myWindow.updateContext(CONTEXT);

        expect(await gtf.windows.compareWindows(window, myWindow)).to.be.true;
    });

    it('Should return a promise that resolves with the title (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        const window = await newlyOpenedWindow.updateContext(CONTEXT);

        expect(await gtf.windows.compareWindows(window, newlyOpenedWindow)).to.be.true;
    });

    it('Should return a promise that resolves with the title (Platform).', async () => {
        const platformWindow = await gtf.windows.getPlatformWindow();

        const window = await platformWindow.updateContext(CONTEXT);

        expect(await gtf.windows.compareWindows(window, platformWindow)).to.be.true;
    });

    it('Should not overwrite the context of the window (my).', async () => {
        const myWindow = glue.windows.my();

        await myWindow.updateContext(CONTEXT);

        expect(await myWindow.getContext()).to.eql(CONTEXT);

        await myWindow.updateContext(NEW_CONTEXT);

        expect(await myWindow.getContext()).to.eql(EXPECTED_CONTEXT);
    });

    it('Should not overwrite the context of the window (other).', async () => {
        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url);

        await newlyOpenedWindow.updateContext(CONTEXT);

        expect(await newlyOpenedWindow.getContext()).to.eql(CONTEXT);

        await newlyOpenedWindow.updateContext(NEW_CONTEXT);

        expect(await newlyOpenedWindow.getContext()).to.eql(EXPECTED_CONTEXT);
    });

    it('Should not overwrite the context of the window (Platform).', async () => {
        const platformWindow = await gtf.windows.getPlatformWindow();

        await platformWindow.updateContext(CONTEXT);

        expect(await platformWindow.getContext()).to.eql(CONTEXT);

        await platformWindow.updateContext(NEW_CONTEXT);

        expect(await platformWindow.getContext()).to.eql(EXPECTED_CONTEXT);
    });
});
