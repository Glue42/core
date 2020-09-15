describe('list()', () => {
    before(() => {
        return coreReady;
    });

    it('Should return an array with the correct channel contexts added by us and by another party.', async () => {
        const expectedChannelContexts = (await gtf.getGlueConfigJson()).channels;

        // The channel contexts that were added.
        const currentChannelContexts = await glue.channels.list();

        expect(currentChannelContexts).to.deep.include.members(expectedChannelContexts);
        expect(currentChannelContexts).to.be.of.length(expectedChannelContexts.length);
    });
});
