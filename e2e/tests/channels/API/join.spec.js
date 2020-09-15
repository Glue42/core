describe('join()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(() => {
        return glue.channels.leave();
    });

    it('Should reject with an error when name isn\'t of type string.', async () => {
        try {
            await glue.channels.join(1);
            throw new Error('join() should have thrown an error because there wasn\'t a channel with the provided name!');
        } catch (error) {
            expect(error.message).to.equal('Please provide the channel name as a string!');
        }
    });

    it('Should reject with an error when there isn\'t a channel with the provided name.', async () => {
        // Provided channel name.
        const nonExistentChannelName = 'non-existent-channel-name';

        try {
            await glue.channels.join(nonExistentChannelName);
            throw new Error('join() should have thrown an error because name wasn\'t of type string!');
        } catch (error) {
            expect(error.message).to.equal(`A channel with name: ${nonExistentChannelName} doesn't exist!`);
        }
    });

    it('Should join the provided channel.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // The current channel.
        const currentChannel = glue.channels.current();

        expect(currentChannel).to.equal(channelName);
    });

    it('Should leave the current channel.', async () => {
        const [firstChannelName, secondChannelName] = await gtf.getChannelNames();

        // Join the first channel.
        await glue.channels.join(firstChannelName);

        // The current channel.
        let currentChannel = glue.channels.current();

        expect(currentChannel).to.equal(firstChannelName);

        // Join the second channel.
        await glue.channels.join(secondChannelName);

        // The current channel.
        currentChannel = glue.channels.current();

        expect(currentChannel).to.not.equal(firstChannelName);
        expect(currentChannel).to.equal(secondChannelName);
    });
});
