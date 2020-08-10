describe('current()', () => {
    before(() => {
        return Promise.all([glueReady, gtfReady]);
    });

    afterEach(() => {
        return glue.channels.leave();
    });

    it('Should return the current channel.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // The current channel.
        const currentChannel = glue.channels.current();

        expect(currentChannel).to.equal(channelName);
    });

    it('Should return undefined if no channel has been joined.', async () => {
        // The current channel.
        const currentChannel = glue.channels.current();

        expect(currentChannel).to.be.undefined;
    });
});
