describe('subscribeFor()', () => {
    let glueApplication;

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        const promisesToAwait = [gtf.channels.resetContexts(), glue.channels.leave()];

        if (typeof glueApplication !== "undefined") {
            promisesToAwait.push(glueApplication.stop());

            glueApplication = undefined;
        }

        await Promise.all(promisesToAwait);
    });

    it('Should reject with an error when name isn\'t of type string.', async () => {
        try {
            await glue.channels.subscribeFor(1, () => { });
            throw new Error('subscribeFor() should have thrown an error because name wasn\'t of type string!');
        } catch (error) {
            expect(error.message).to.equal('expected a string, got a number');
        }
    });

    it('Should reject with an error when callback isn\'t of type function.', async () => {
        const [channelName] = await gtf.getChannelNames();

        try {
            await glue.channels.subscribeFor(channelName, 'string');
            throw new Error('subscribeFor() should have thrown an error because callback wasn\'t of type function!');
        } catch (error) {
            expect(error.message).to.equal(`Cannot subscribe to channel ${channelName}, because the provided callback is not a function!`);
        }
    });

    it('Should reject with an error when there isn\'t a channel with the provided name.', async () => {
        const nonExistentChannelName = 'non-existent-channel-name';

        try {
            await glue.channels.subscribeFor(nonExistentChannelName, () => { });
            throw new Error('subscribeFor() should have thrown an error because there isn\'t a channel with the provided name!');
        } catch (error) {
            expect(error.message).to.equal("Expected a valid channel name");
        }
    });

    it('Should invoke the callback with the current correct data, context (name, meta and data) and updatedId.', async () => {
        const channel = gtf.getChannelsConfigDefinitions()[0];
        const channelName = channel.name;

        // The initial data of the first channel.
        const firstChannelInitialData = {
            test: 24
        };
        await glue.channels.publish(firstChannelInitialData, channel.name);

        // Subscribe for channel context update.
        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFuncPromise = glue.channels.subscribeFor(channelName, (data, context, updaterId) => {
                return resolve({
                    data,
                    context,
                    updaterId,
                    unsubscribeFuncPromise
                });
            });
        });

        // The received channel context update.
        const result = await subscriptionPromise;

        const context = {
            ...channel,
            data: firstChannelInitialData
        };

        expect(result.context).to.eql(context);
        expect(result.data).to.eql(firstChannelInitialData);

        // Clean up.
        const unsubscribeFunc = await result.unsubscribeFuncPromise;
        unsubscribeFunc();
    });

    it('Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to the current channel by another party.', async () => {
        glueApplication = await gtf.createApp();

        const channel = gtf.getChannelsConfigDefinitions()[0];
        const channelName = channel.name;

        // Join the channel.
        await glue.channels.join(channelName);

        // After subscribing using subscribeFor our callback will be called with the current context. We want to skip it and wait for the publish by the other party.
        let initialContextReceived = false;

        // Subscribe for channel context update.
        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFuncPromise = glue.channels.subscribeFor(channelName, (data, context, updaterId) => {
                if (initialContextReceived) {
                    return resolve({
                        data,
                        context,
                        updaterId,
                        unsubscribeFuncPromise
                    });
                } else {
                    initialContextReceived = true;
                }
            });
        });

        // The data to be published by the other party.
        const data = {
            test: 42
        };
        // Publish the data by the other party.
        await glueApplication.channels.publish(data, channelName);

        // The received channel context update.
        const result = await subscriptionPromise;

        // The expected new context.
        const context = {
            ...channel,
            data
        };

        expect(result.context).to.eql(context);
        expect(result.data).to.eql(data);
        expect(glueApplication.agm.instance.peerId).to.equal(result.updaterId);

        // Clean up.
        const unsubscribeFunc = await result.unsubscribeFuncPromise;
        unsubscribeFunc();
    });

    it('Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to the current channel by us.', async () => {
        const channel = gtf.getChannelsConfigDefinitions()[0];
        const channelName = channel.name;

        // Join the channel.
        await glue.channels.join(channelName);

        // After subscribing using subscribeFor our callback will be called with the current context. We want to skip it and wait for the publish.
        let initialContextReceived = false;

        // Subscribe for channel context update.
        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFuncPromise = glue.channels.subscribeFor(channelName, (data, context, updaterId) => {
                if (initialContextReceived) {
                    return resolve({
                        data,
                        context,
                        updaterId,
                        unsubscribeFuncPromise
                    });
                } else {
                    initialContextReceived = true;
                }
            });
        });

        // The data to be published.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data);

        // The received channel context update.
        const result = await subscriptionPromise;

        // The expected new context.
        const context = {
            ...channel,
            data
        };

        expect(result.context).to.eql(context);
        expect(result.data).to.eql(data);
        expect(glue.connection.peerId).to.equal(result.updaterId);

        // Clean up.
        const unsubscribeFunc = await result.unsubscribeFuncPromise;
        unsubscribeFunc();
    });

    it('Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to another channel by another party.', async () => {
        glueApplication = await gtf.createApp();

        const [firstChannel, secondChannel] = gtf.getChannelsConfigDefinitions();
        const firstChannelName = firstChannel.name;
        const secondChannelName = secondChannel.name;

        // Join the first channel.
        await glue.channels.join(firstChannelName);

        // After subscribing to the second channel using subscribeFor our callback will be called with the current context. We want to skip it and wait for the publish by the other party.
        let secondChannelInitialContextReceived = false;

        // Subscribe for channel context update.
        const subscriptionPromise = new Promise((resolve) => {
            const unsubscribeFuncPromise = glue.channels.subscribeFor(secondChannelName, (data, context, updaterId) => {
                if (secondChannelInitialContextReceived) {
                    return resolve({
                        data,
                        context,
                        updaterId,
                        unsubscribeFuncPromise
                    });
                } else {
                    secondChannelInitialContextReceived = true;
                }
            });
        });

        // The data to be published by the other party.
        const data = {
            test: 42
        };
        // Publish the data by the other party.
        await glueApplication.channels.publish(data, secondChannelName);

        // The received channel context update.
        const result = await subscriptionPromise;

        // The expected new context.
        const context = {
            ...secondChannel,
            data
        };

        expect(result.context).to.eql(context);
        expect(result.data).to.eql(data);
        expect(glueApplication.agm.instance.peerId).to.equal(result.updaterId);

        // Clean up.
        const unsubscribeFunc = await result.unsubscribeFuncPromise;
        unsubscribeFunc();
    });

    it('Should return a working unsubscribe function.', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // The number of times our callback gets called.
        // After subscribing using subscribeFor our callback will be called once. We want this to be the only time our callback gets called.
        let numberOfTimesCallbackCalled = 0;

        // Subscribe for channel context update.
        const unsubscribeFunc = await glue.channels.subscribeFor(channelName, () => {
            numberOfTimesCallbackCalled++;
        });
        // Immediately unsubscribe.
        unsubscribeFunc();

        // Promise that will be rejected after 3k ms if we received any additional context.
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (numberOfTimesCallbackCalled !== 1) {
                    return reject('The callback should have been called once.');
                }

                return resolve();
            }, 3000);
        });

        // The data to be published.
        const data = {
            test: 42
        };
        // Publish the data.
        await glue.channels.publish(data);

        return timeoutPromise;
    });

    it('Should not invoke the callback when the setup is there but no data is published (3k ms).', async () => {
        const [channelName] = await gtf.getChannelNames();

        // Join the channel.
        await glue.channels.join(channelName);

        // The number of times our callback gets called.
        // After subscribing using subscribeFor our callback will be called once. We want this to be the only time our callback gets called.
        let numberOfTimesCallbackCalled = 0;

        // Subscribe for channel context update.
        const unsubscribeFunc = await glue.channels.subscribeFor(channelName, () => {
            numberOfTimesCallbackCalled++;
        });

        // Promise that will be rejected after 3k ms if we received any additional context.
        const timeoutPromise = new Promise((resolve, reject) => {
            unsubscribeFunc();
            setTimeout(() => {
                if (numberOfTimesCallbackCalled !== 1) {
                    return reject('The callback should have been called once.');
                }

                return resolve();
            }, 3000);
        });

        return timeoutPromise;
    });
});
