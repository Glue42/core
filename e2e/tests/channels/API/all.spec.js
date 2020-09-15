describe('all()', () => {
    before(() => {
        return coreReady;
    });

    it('Should return an array with the correct channel names.', async () => {
        const expectedChannelNames = await gtf.getChannelNames();

        const currentChannelNames = await glue.channels.all();

        expect(expectedChannelNames.every((expectedChannelName) => currentChannelNames.includes(expectedChannelName)));
        expect(currentChannelNames.every((currentChannelName) => expectedChannelNames.includes(currentChannelName)));
    });
});
