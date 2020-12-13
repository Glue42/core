describe.skip('add()', () => {
    before(() => {
        return coreReady;
    });

    it('Should reject with an error when info isn\'t of type object.', async () => {
        try {
            await glue.channels.add(1);
            throw new Error('add() should have thrown an error because info wasn\'t of type object!');
        } catch (error) {
            expect(error.message).to.equal('Please provide the info as an object!');
        }
    });

    it('Should reject with an error when info doesn\'t contain a name.', async () => {
        const info = {
            meta: {
                color: 'red'
            },
            data: {}
        };
        try {
            await glue.channels.add(info);
            throw new Error('add() should have thrown an error because info was missing name!');
        } catch (error) {
            expect(error.message).to.equal('info.name is missing!');
        }
    });

    it('Should reject with an error when info.name isn\'t of type string.', async () => {
        const info = {
            name: 1,
            meta: {
                color: 'red'
            },
            data: {}
        };
        try {
            await glue.channels.add(info);
            throw new Error('add() should have thrown an error because info.name wasn\'t of type string!');
        } catch (error) {
            expect(error.message).to.equal('Please provide the info.name as a string!');
        }
    });

    it('Should reject with an error when info doesn\'t contain meta.', async () => {
        const info = {
            name: 'red',
            data: {}
        };
        try {
            await glue.channels.add(info);
            throw new Error('add() should have thrown an error because info was missing meta!');
        } catch (error) {
            expect(error.message).to.equal('info.meta is missing!');
        }
    });

    it('Should reject with an error when info.meta isn\'t of type object.', async () => {
        const info = {
            name: 'red',
            meta: 1,
            data: {}
        };
        try {
            await glue.channels.add(info);
            throw new Error('add() should have thrown an error because info.meta wasn\'t of type object!');
        } catch (error) {
            expect(error.message).to.equal('Please provide the info.meta as an object!');
        }
    });

    it('Should reject with an error when info.meta doesn\'t contain color.', async () => {
        const info = {
            name: 'red',
            meta: {},
            data: {}
        };
        try {
            await glue.channels.add(info);
            throw new Error('add() should have thrown an error because info.meta was missing color!');
        } catch (error) {
            expect(error.message).to.equal('info.meta.color is missing!');
        }
    });

    it('Should reject with an error when info.meta.color isn\'t of type string.', async () => {
        const info = {
            name: 'red',
            meta: {
                color: 1
            },
            data: {}
        };
        try {
            await glue.channels.add(info);
            throw new Error('add() should have thrown an error because info.meta.color wasn\'t of type string!');
        } catch (error) {
            expect(error.message).to.equal('Please provide the info.meta.color as a string!');
        }
    });
});
