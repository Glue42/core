describe('open()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return gtf.windows.closeAllOtherWindows();
    });

    it('Should throw an error when name isn\'t of type string.', (done) => {
        glue.windows.open(42, gtf.windows.SUPPORT_DETAILS.url)
            .then(() => done('open() should have thrown an error because name wasn\'t of type string!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a string, got a number');

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('Should throw an error when URL isn\'t of type string.', (done) => {
        glue.windows.open(gtf.windows.getWindowName(), 42)
            .then(() => done('open() should have thrown an error because URL wasn\'t of type string!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected a string, got a number');

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('Should throw an error when options isn\'t of type object.', (done) => {
        glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url, 42)
            .then(() => done('open() should have thrown an error because settings wasn\'t of type object!'))
            .catch((error) => {
                try {
                    expect(error.message).to.equal('expected an object, got a number');

                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    for (const openWindowsCount of [1, 2, 5, 10]) {
        it(`Should open the window (${openWindowsCount}).`, async () => {
            const platformWindowId = (await gtf.windows.getPlatformWindow()).id;
            const myWindowId = glue.windows.my().id;
            const windowNames = Array.from({ length: openWindowsCount }).map(() => gtf.windows.getWindowName());

            const newlyOpenedWindows = await Promise.all(windowNames.map((windowName) => glue.windows.open(windowName, gtf.windows.SUPPORT_DETAILS.url)));

            const listWindowsExceptMeAndThePlatform = glue.windows.list().filter((window) => window.id !== myWindowId && window.id !== platformWindowId);

            expect(listWindowsExceptMeAndThePlatform).to.be.of.length(openWindowsCount);

            for (const listWindow of listWindowsExceptMeAndThePlatform) {
                const expectedWindow = newlyOpenedWindows.find((newlyOpenedWindow) => newlyOpenedWindow.id === listWindow.id);

                expect(await gtf.windows.compareWindows(listWindow, expectedWindow)).to.be.true;
            }
        });
    }

    it('Should open the window with the provided start options (context).', async () => {
        const context = {
            a: 42,
            b: '42',
            c: new Date(),
            d: {
                e: 42
            },
            f: true
        };
        const options = {
            context
        };

        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url, options);

        const newlyOpenedWindowContext = await newlyOpenedWindow.getContext();

        expect(newlyOpenedWindowContext).to.eql(context);
    });

    it('Should open the window with the provided start options (bounds).', async () => {
        const [top, left, width, height] = [100, 200, 300, 400];
        const options = {
            top,
            left,
            width,
            height
        };

        const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url, options);

        const newlyOpenedWindowBounds = await newlyOpenedWindow.getBounds();

        expect(newlyOpenedWindowBounds).to.eql(options);
    });

    // skipped, because e2e is executed in headless chrome mode and that mode is wildly inconsistent in terms of window bounds
    for (const direction of ['top', 'left', 'bottom', 'right']) {
        it.skip(`Should open the window with the provided start options (relative direction ${direction}).`, async () => {
            const [relativeWindowTop, relativeWindowLeft, relativeWindowWidth, relativeWindowHeight] = [495, 505, 195, 205];
            const relativeWindowOptions = {
                top: relativeWindowTop,
                left: relativeWindowLeft,
                width: relativeWindowWidth,
                height: relativeWindowHeight
            };

            const relativeWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url, relativeWindowOptions);

            const [width, height] = [395, 405];
            const options = {
                width,
                height,
                relativeTo: relativeWindow.id,
                relativeDirection: direction
            };

            const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url, options);

            const newB = await newlyOpenedWindow.getBounds();

            const { top: newlyOpenedWindowTop, left: newlyOpenedWindowLeft } = newB;

            switch (direction) {
                case 'top':
                    expect(newlyOpenedWindowTop).to.be.lessThan(relativeWindowTop);
                    break;
                case 'left':
                    expect(newlyOpenedWindowLeft).to.be.lessThan(relativeWindowLeft);
                    break;
                case 'bottom':
                    expect(newlyOpenedWindowTop).to.be.greaterThan(relativeWindowTop);
                    break;
                case 'right':
                    expect(newlyOpenedWindowLeft).to.be.greaterThan(relativeWindowLeft);
                    break;
            }
        });

        it.skip(`Should open the window with the provided start options (relative direction ${direction} > bounds).`, async () => {
            const [relativeWindowTop, relativeWindowLeft, relativeWindowWidth, relativeWindowHeight] = [495, 505, 195, 205];
            const relativeWindowOptions = {
                top: relativeWindowTop,
                left: relativeWindowLeft,
                width: relativeWindowWidth,
                height: relativeWindowHeight
            };

            const relativeWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url, relativeWindowOptions);

            const [width, height] = [395, 405];
            const options = {
                top: 195,
                left: 205,
                width,
                height,
                relativeTo: relativeWindow.id,
                relativeDirection: direction
            };

            const newlyOpenedWindow = await glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url, options);

            const { top: newlyOpenedWindowTop, left: newlyOpenedWindowLeft } = await newlyOpenedWindow.getBounds();

            switch (direction) {
                case 'top':
                    expect(newlyOpenedWindowTop).to.be.lessThan(relativeWindowTop);
                    break;
                case 'left':
                    expect(newlyOpenedWindowLeft).to.be.lessThan(relativeWindowLeft);
                    break;
                case 'bottom':
                    expect(newlyOpenedWindowTop).to.be.greaterThan(relativeWindowTop);
                    break;
                case 'right':
                    expect(newlyOpenedWindowLeft).to.be.greaterThan(relativeWindowLeft);
                    break;
            }
        });
    }

    it('Should assign different ids to two windows started at the same time.', async () => {
        const [windowOne, windowTwo] = await Promise.all([glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url), glue.windows.open(gtf.windows.getWindowName(), gtf.windows.SUPPORT_DETAILS.url)]);

        expect(windowOne.id).to.not.equal(windowTwo.id);
    });
});
