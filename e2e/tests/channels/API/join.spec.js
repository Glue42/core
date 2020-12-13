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
            expect(error.message).to.equal('expected a string, got a number');
        }
    });

    it('Should reject with an error when there isn\'t a channel with the provided name.', async () => {
        // Provided channel name.
        const nonExistentChannelName = 'non-existent-channel-name';

        try {
            await glue.channels.join(nonExistentChannelName);
            throw new Error('join() should have thrown an error because name wasn\'t of type string!');
        } catch (error) {
            expect(error.message).to.equal("Expected a valid channel name");
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

    it('Should set the current channel before calling any subscribe callbacks.', async () => {
        const [channelName] = await gtf.getChannelNames();

        const subscribeCurrentChannelPromise = new Promise((resolve) => {
            const unsunbscribe = glue.channels.subscribe(() => {
                unsunbscribe();

                // The current channel.
                resolve(glue.channels.current());
            });
        });

        // Join the channel.
        await glue.channels.join(channelName);

        const currentChannel = await subscribeCurrentChannelPromise;
        expect(currentChannel).to.equal(channelName);
    });
});
