describe('publish()', () => {
    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        return Promise.all([gtf.channels.resetContexts(), glue.channels.leave()]);
    });

    it('Should reject with an error when data isn\'t of type object.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        try {
            await glue.channels.publish(1);
            throw new Error('publish() should have thrown an error because data wasn\'t of type object!');
        } catch (error) {
            expect(error.message).to.equal('Cannot publish to channel, because the provided data is not an object!');
        }
    });

    it('Should reject with an error when name is provided, but isn\'t of type string.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // The data to be published.
        const data = {
            test: 42
        };

        try {
            await glue.channels.publish(data, 1);
            throw new Error('publish() should have thrown an error because name wasn\'t of type string!');
        } catch (error) {
            expect(error.message).to.equal('expected a string, got a number');
        }
    });

    it('Should reject with an error when not in a channel.', async () => {
        // The data to be published.
        const data = {
            test: 42
        };

        try {
            await glue.channels.publish(data);
            throw new Error('publish() should have thrown an error because not joined to any channel!');
        } catch (error) {
            expect(error.message).to.equal('Cannot publish to channel, because not joined to a channel!');
        }
    });

    it('Should correctly update the data of the current channel when no name is provided.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // The data to be published.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data);

        // The channel context from get().
        const channelContextFromGet = await glue.channels.get(channelName);

        // The channels contexts.
        const channelContexts = await glue.channels.list();

        // The channel context from list().
        const channelContextFromList = channelContexts.find((channelContext) => channelContext.name === channelName);

        expect(channelContextFromGet.data).to.eql(data);
        expect(channelContextFromList.data).to.eql(data);
    });

    it('Should correctly update the data of the provided channel when name is provided.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // The data to be published.
        const data = {
            test: 42
        };

        // Publish the data.
        await glue.channels.publish(data, channelName);

        // The channel context from get().
        const channelContextFromGet = await glue.channels.get(channelName);

        // The channels contexts.
        const channelContexts = await glue.channels.list();

        // The channel context from list().
        const channelContextFromList = channelContexts.find((channelContext) => channelContext.name === channelName);

        expect(channelContextFromGet.data).to.eql(data);
        expect(channelContextFromList.data).to.eql(data);
    });

    it('Should not update the data of the current channel when name is provided.', async () => {
        const [firstChannelName, secondChannelName] = await gtf.getChannelNames();

        // The initial data of the first channel.
        const firstChannelInitialData = {
            test: 24
        };

        // Join the first channel.
        await glue.channels.join(firstChannelName);
        // Publish the data.
        await glue.channels.publish(firstChannelInitialData);

        // The data to be published to the second channel.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data, secondChannelName);

        // The channel context from get().
        const firstChannelContextFromGet = await glue.channels.get(firstChannelName);

        // The channels contexts.
        const channelContexts = await glue.channels.list();

        // The channel context from list().
        const firstChannelContextFromList = channelContexts.find((channelContext) => channelContext.name === firstChannelName);

        expect(firstChannelContextFromGet.data).to.eql(firstChannelInitialData);
        expect(firstChannelContextFromList.data).to.eql(firstChannelInitialData);
    });
});
