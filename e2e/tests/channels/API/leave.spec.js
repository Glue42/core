describe('leave()', () => {
    before(() => {
        return coreReady;
    });

    it('Should leave the current channel.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // Leave the channel.
        await glue.channels.leave();

        // The current channel.
        const currentChannel = glue.channels.current();

        expect(currentChannel).to.be.undefined;
    });
});
