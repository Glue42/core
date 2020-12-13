describe('onChanged()', () => {
    before(() => {
        return coreReady;
    });

    it('Should throw an error when callback isn\'t of type function.', () => {
        try {
            glue.channels.onChanged('string');
            throw new Error(`onChanged() should have thrown an error because callback wasn't of type function!`);
        } catch (error) {
            expect(error.message).to.equal('Cannot subscribe to channel changed, because the provided callback is not a function!');
        }
    });

    it('Should invoke the callback with the new channel name whenever a new channel is joined.', async () => {
        const [firstChannelName, secondChannelName] = await gtf.getChannelNames();

        // Join the first channel.
        await glue.channels.join(firstChannelName);

        // Subscribe for channel change.
        const channelOnChangedPromise = new Promise((resolve) => {
            const unsubscribeFunc = glue.channels.onChanged((channelName) => {
                unsubscribeFunc();
                return resolve(channelName);
            });
        });

        // Join the second channel.
        await glue.channels.join(secondChannelName);

        // The new channel name.
        const newChannelName = await channelOnChangedPromise;

        expect(newChannelName).to.equal(secondChannelName);
    });

    it('Should invoke the callback with undefined whenever the current channel is left.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // Subscribe for channel change.
        const channelOnChangedPromise = new Promise((resolve) => {
            const unsubscribeFunc = glue.channels.onChanged((channelName) => {
                unsubscribeFunc();
                return resolve(channelName);
            });
        });

        // Leave the channel.
        await glue.channels.leave();

        // The new channel name.
        const newChannelName = await channelOnChangedPromise;

        expect(newChannelName).to.be.undefined;
    });

    it('Should return a working unsubscribe function.', async () => {
        const [firstChannelName, secondChannelName] = await gtf.getChannelNames();

        // Join the first channel.
        await glue.channels.join(firstChannelName);

        // Set to true if we received the new channel name after unsubscribing.
        let channelNameReceived = false;

        // Subscribe for channel change.
        const unsubscribeFunc = glue.channels.onChanged(() => {
            channelNameReceived = true;
        });
        // Immediately unsubscribe.
        unsubscribeFunc();

        // Promise that will be rejected after 3k ms if we received a new channel name.
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (channelNameReceived) {
                    return reject('Received a new channel name.');
                }

                return resolve();
            }, 3000);
        });

        // Join the second channel.
        await glue.channels.join(secondChannelName);

        return timeoutPromise;
    });

    it('Should not invoke the callback when the setup is there but the current channel isn\'t onChanged(3k ms).', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // Set to true if we received a new channel name.
        let channelNameReceived = false;

        // Subscribe for channel change.
        const unsubscribeFunc = glue.channels.onChanged(() => {
            channelNameReceived = true;
        });

        // Promise that will be rejected after 3k ms if we received a new channel name.
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                unsubscribeFunc();
                if (channelNameReceived) {
                    return reject('Received a new channel name.');
                }

                return resolve();
            }, 3000);
        });

        return timeoutPromise;
    });
});
