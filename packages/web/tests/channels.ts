import "mocha";
import { expect } from "chai";
import { createGlue, startGateway, stopGateway, doneAllGlues } from "./initializer";
import { Glue42Web } from "../web";
import { addNewChannel } from "./utils";

describe("channels", function () {
    this.timeout(10000);

    let myGlue: Glue42Web.API;

    beforeEach(async () => {
        await startGateway();
        try {
            myGlue = await createGlue(true);
        } catch (error) {
            console.log(error);
        }
    });

    afterEach(() => {
        doneAllGlues();
        stopGateway();
    });

    describe("subscribe()", () => {
        it("Should throw an error when callback isn't of type function.", () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                myGlue.channels.subscribe("string" as any);
                throw new Error("subscribe() should have thrown an error because callback wasn't of type function!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the callback as a function!");
            }
        });

        it("Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to the current channel by another party.", async () => {
            // Create a new Glue for the other party.
            const otherGlue = await createGlue(true);

            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel that will be joined by us and by the other party.
            const info = await addNewChannel(myGlue, channelName);
            // Join the channel together with the other party.
            await Promise.all([myGlue.channels.join(channelName), otherGlue.channels.join(channelName)]);

            // Subscribe for channel context update.
            const subscriptionPromise: Promise<{ data: object; context: Glue42Web.ChannelContext; updaterId: string }> = new Promise((resolve) => {
                const unsubscribeFunc = myGlue.channels.subscribe((data, context, updaterId) => {
                    unsubscribeFunc();
                    return resolve({
                        data,
                        context,
                        updaterId
                    });
                });
            });

            // The data to be published by the other party.
            const data = {
                test: 42
            };
            // Publish the data by the other party.
            await otherGlue.channels.publish(data);

            // The received channel context update.
            const result = await subscriptionPromise;

            // The expected new context.
            const context = {
                ...info,
                data
            };

            expect(result.context).to.eql(context);
            expect(result.data).to.eql(data);
            expect(otherGlue.connection.peerId).to.equal(result.updaterId);
        });

        it("Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to the current channel by us.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            const info = await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // Subscribe for channel context update.
            const subscriptionPromise: Promise<{ data: object; context: Glue42Web.ChannelContext; updaterId: string }> = new Promise((resolve) => {
                const unsubscribeFunc = myGlue.channels.subscribe((data, context, updaterId) => {
                    unsubscribeFunc();
                    return resolve({
                        data,
                        context,
                        updaterId
                    });
                });
            });

            // The data to be published.
            const data = {
                test: 42
            };
            // Publish the data.
            await myGlue.channels.publish(data);

            // The received channel context update.
            const result = await subscriptionPromise;

            // The expected new context.
            const context = {
                ...info,
                data
            };

            expect(result.context).to.eql(context);
            expect(result.data).to.eql(data);
            expect(myGlue.connection.peerId).to.equal(result.updaterId);
        });

        it("Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever a new channel is joined and data is published to that channel by another party.", async () => {
            // Create a new Glue for the other party.
            const otherGlue = await createGlue(true);

            // The names of the channels to be added.
            const firstChannelName = "red";
            const secondChannelName = "yellow";

            // Add the channels.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, secondInfo] = await Promise.all([addNewChannel(myGlue, firstChannelName), addNewChannel(myGlue, secondChannelName)]);
            // Join the first channel.
            await myGlue.channels.join(firstChannelName);

            // After joining the second channel our callback will be called with the current context. We want to skip it and wait for the publish by the other party.
            let secondChannelInitialContextReceived = false;

            // Subscribe for channel context update.
            const subscriptionPromise: Promise<{ data: object; context: Glue42Web.ChannelContext; updaterId: string }> = new Promise((resolve) => {
                const unsubscribeFunc = myGlue.channels.subscribe((data, context, updaterId) => {
                    if (secondChannelInitialContextReceived) {
                        unsubscribeFunc();
                        return resolve({
                            data,
                            context,
                            updaterId
                        });
                    } else {
                        secondChannelInitialContextReceived = true;
                    }
                });
            });

            // Join the second channel together with the other party.
            await Promise.all([myGlue.channels.join(secondChannelName), otherGlue.channels.join(secondChannelName)]);

            // The data to be published by the other party.
            const data = {
                test: 42
            };
            // Publish the data by the other party.
            await otherGlue.channels.publish(data);

            // The received channel context update.
            const result = await subscriptionPromise;

            // The expected new context.
            const context = {
                ...secondInfo,
                data
            };

            expect(result.context).to.eql(context);
            expect(result.data).to.eql(data);
            expect(otherGlue.connection.peerId).to.equal(result.updaterId);
        });

        it("Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever a new channel is joined and data is published to that channel by us.", async () => {
            // The names of the channels to be added.
            const firstChannelName = "red";
            const secondChannelName = "yellow";

            // Add the channels.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, secondInfo] = await Promise.all([addNewChannel(myGlue, firstChannelName), addNewChannel(myGlue, secondChannelName)]);
            // Join the first channel.
            await myGlue.channels.join(firstChannelName);

            // After joining the second channel our callback will be called with the current context. We want to skip it and wait for the publish.
            let secondChannelInitialContextReceived = false;

            // Subscribe for channel context update.
            const subscriptionPromise: Promise<{ data: object; context: Glue42Web.ChannelContext; updaterId: string }> = new Promise((resolve) => {
                const unsubscribeFunc = myGlue.channels.subscribe((data, context, updaterId) => {
                    if (secondChannelInitialContextReceived) {
                        unsubscribeFunc();
                        return resolve({
                            data,
                            context,
                            updaterId
                        });
                    } else {
                        secondChannelInitialContextReceived = true;
                    }
                });
            });

            // Join the second channel.
            await myGlue.channels.join(secondChannelName);

            // The data to be published.
            const data = {
                test: 42
            };
            // Publish the data.
            await myGlue.channels.publish(data);

            // The received channel context update.
            const result = await subscriptionPromise;

            // The expected new context.
            const context = {
                ...secondInfo,
                data
            };

            expect(result.context).to.eql(context);
            expect(result.data).to.eql(data);
            expect(myGlue.connection.peerId).to.equal(result.updaterId);
        });

        it("Should return a working unsubscribe function.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // Set to true if we receive any context after unsubscribing.
            let contextReceived = false;

            // Subscribe for channel context update.
            const unsubscribeFunc = myGlue.channels.subscribe(() => {
                contextReceived = true;
            });
            // Immediately unsubscribe.
            unsubscribeFunc();

            // Promise that will be rejected after 3k ms if we received any context.
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (contextReceived) {
                        return reject("Received context.");
                    }

                    return resolve();
                }, 3000);
            });

            // The data to be published.
            const data = {
                test: 42
            };
            // Publish the data.
            await myGlue.channels.publish(data);

            return timeoutPromise;
        });

        it("Should not invoke the callback a second time when the same data is published two times.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // The number of times our callback gets called.
            let numberOfTimesCallbackCalled = 0;

            // Subscribe for channel context update.
            const unsubscribeFunc = myGlue.channels.subscribe(() => {
                numberOfTimesCallbackCalled++;
            });

            // Promise that will be rejected after 3k ms if we received any more than once.
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    unsubscribeFunc();
                    if (numberOfTimesCallbackCalled !== 1) {
                        return reject("The callback should have been called once.");
                    }

                    return resolve();
                }, 3000);
            });

            // The data to be published.
            const data = {
                test: 42
            };
            // Publish the data.
            await myGlue.channels.publish(data);
            // Publish the same data a second time.
            await myGlue.channels.publish(data);

            return timeoutPromise;
        });

        it("Should not invoke the callback when the setup is there but no data is published (3k ms).", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // Set to true if we receive any context.
            let contextReceived = false;

            // Subscribe for channel context update.
            const unsubscribeFunc = myGlue.channels.subscribe(() => {
                contextReceived = true;
            });

            // Promise that will be rejected after 3k ms if we received any context.
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    unsubscribeFunc();
                    if (contextReceived) {
                        return reject("Received context.");
                    }

                    return resolve();
                }, 3000);
            });

            return timeoutPromise;
        });
    });

    describe("subscribeFor()", () => {
        it("Should reject with an error when name isn't of type string.", async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
                await myGlue.channels.subscribeFor(1 as any, () => { });
                throw new Error("subscribeFor() should have thrown an error because name wasn't of type string!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the name as a string!");
            }
        });

        it("Should reject with an error when callback isn't of type function.", async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.subscribeFor("red", "string" as any);
                throw new Error("subscribeFor() should have thrown an error because callback wasn't of type function!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the callback as a function!");
            }
        });

        it("Should reject with an error when there isn't a channel with the provided name.", async () => {
            // The name of the channel to subscribe to.
            const channelName = "red";

            try {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                await myGlue.channels.subscribeFor(channelName, () => { });
                throw new Error("subscribeFor() should have thrown an error because there isn't a channel with the provided name!");
            } catch (error) {
                expect(error.message).to.equal(`Channel with name: ${channelName} doesn't exist!`);
            }
        });

        it("Should invoke the callback with the current correct data, context (name, meta and data) and updatedId.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // The initial data of the first channel.
            const firstChannelInitialData = {
                test: 24
            };

            // Add the channel that will be joined by us and by the other party.
            const info = await addNewChannel(myGlue, channelName, firstChannelInitialData);

            // Subscribe for channel context update.
            const subscriptionPromise: Promise<{ data: object; context: Glue42Web.ChannelContext; updaterId: string; unsubscribeFuncPromise: Promise<() => void> }> = new Promise((resolve) => {
                const unsubscribeFuncPromise = myGlue.channels.subscribeFor(channelName, (data, context, updaterId) => {
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

            expect(result.context).to.eql(info);
            expect(result.data).to.eql(firstChannelInitialData);

            // Clean up.
            const unsubscribeFunc = await result.unsubscribeFuncPromise;
            unsubscribeFunc();
        });

        it("Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to the current channel by another party.", async () => {
            // Create a new Glue for the other party.
            const otherGlue = await createGlue(true);

            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel that will be joined by us and by the other party.
            const info = await addNewChannel(myGlue, channelName);
            // Join the channel together with the other party.
            await Promise.all([myGlue.channels.join(channelName), otherGlue.channels.join(channelName)]);

            // After subscribing using subscribeFor our callback will be called with the current context. We want to skip it and wait for the publish by the other party.
            let initialContextReceived = false;

            // Subscribe for channel context update.
            const subscriptionPromise: Promise<{ data: object; context: Glue42Web.ChannelContext; updaterId: string; unsubscribeFuncPromise: Promise<() => void> }> = new Promise((resolve) => {
                const unsubscribeFuncPromise = myGlue.channels.subscribeFor(channelName, (data, context, updaterId) => {
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
            await otherGlue.channels.publish(data);

            // The received channel context update.
            const result = await subscriptionPromise;

            // The expected new context.
            const context = {
                ...info,
                data
            };

            expect(result.context).to.eql(context);
            expect(result.data).to.eql(data);
            expect(otherGlue.connection.peerId).to.equal(result.updaterId);

            // Clean up.
            const unsubscribeFunc = await result.unsubscribeFuncPromise;
            unsubscribeFunc();
        });

        it("Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to the current channel by us.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            const info = await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // After subscribing using subscribeFor our callback will be called with the current context. We want to skip it and wait for the publish.
            let initialContextReceived = false;

            // Subscribe for channel context update.
            const subscriptionPromise: Promise<{ data: object; context: Glue42Web.ChannelContext; updaterId: string; unsubscribeFuncPromise: Promise<() => void> }> = new Promise((resolve) => {
                const unsubscribeFuncPromise = myGlue.channels.subscribeFor(channelName, (data, context, updaterId) => {
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
            await myGlue.channels.publish(data);

            // The received channel context update.
            const result = await subscriptionPromise;

            // The expected new context.
            const context = {
                ...info,
                data
            };

            expect(result.context).to.eql(context);
            expect(result.data).to.eql(data);
            expect(myGlue.connection.peerId).to.equal(result.updaterId);

            // Clean up.
            const unsubscribeFunc = await result.unsubscribeFuncPromise;
            unsubscribeFunc();
        });

        it("Should invoke the callback with the correct data, context (name, meta and data) and updaterId whenever data is published to another channel by another party.", async () => {
            // Create a new Glue for the other party.
            const otherGlue = await createGlue(true);


            // The names of the channels to be added.
            const firstChannelName = "red";
            const secondChannelName = "yellow";

            // Add the channels.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, secondInfo] = await Promise.all([addNewChannel(myGlue, firstChannelName), addNewChannel(myGlue, secondChannelName)]);
            // Join the first channel.
            await myGlue.channels.join(firstChannelName);
            // Join the second channel by the other party.
            await otherGlue.channels.join(secondChannelName);

            // After subscribing to the second channel using subscribeFor our callback will be called with the current context. We want to skip it and wait for the publish by the other party.
            let secondChannelInitialContextReceived = false;

            // Subscribe for channel context update.
            const subscriptionPromise: Promise<{ data: object; context: Glue42Web.ChannelContext; updaterId: string; unsubscribeFuncPromise: Promise<() => void> }> = new Promise((resolve) => {
                const unsubscribeFuncPromise = myGlue.channels.subscribeFor(secondChannelName, (data, context, updaterId) => {
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
            await otherGlue.channels.publish(data);

            // The received channel context update.
            const result = await subscriptionPromise;

            // The expected new context.
            const context = {
                ...secondInfo,
                data
            };

            expect(result.context).to.eql(context);
            expect(result.data).to.eql(data);
            expect(otherGlue.connection.peerId).to.equal(result.updaterId);

            // Clean up.
            const unsubscribeFunc = await result.unsubscribeFuncPromise;
            unsubscribeFunc();
        });

        it("Should return a working unsubscribe function.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // The number of times our callback gets called.
            // After subscribing using subscribeFor our callback will be called once. We want this to be the only time our callback gets called.
            let numberOfTimesCallbackCalled = 0;

            // Subscribe for channel context update.
            const unsubscribeFunc = await myGlue.channels.subscribeFor(channelName, () => {
                numberOfTimesCallbackCalled++;
            });
            // Immediately unsubscribe.
            unsubscribeFunc();

            // Promise that will be rejected after 3k ms if we received any additional context.
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (numberOfTimesCallbackCalled !== 1) {
                        return reject("The callback should have been called once.");
                    }

                    return resolve();
                }, 3000);
            });

            // The data to be published.
            const data = {
                test: 42
            };
            // Publish the data.
            await myGlue.channels.publish(data);

            return timeoutPromise;
        });

        it("Should not invoke the callback when the setup is there but no data is published (3k ms).", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // The number of times our callback gets called.
            // After subscribing using subscribeFor our callback will be called once. We want this to be the only time our callback gets called.
            let numberOfTimesCallbackCalled = 0;

            // Subscribe for channel context update.
            const unsubscribeFunc = await myGlue.channels.subscribeFor(channelName, () => {
                numberOfTimesCallbackCalled++;
            });

            // Promise that will be rejected after 3k ms if we received any additional context.
            const timeoutPromise = new Promise((resolve, reject) => {
                unsubscribeFunc();
                setTimeout(() => {
                    if (numberOfTimesCallbackCalled !== 1) {
                        return reject("The callback should have been called once.");
                    }

                    return resolve();
                }, 3000);
            });

            return timeoutPromise;
        });
    });

    describe("publish()", () => {
        it("Should reject with an error when data isn't of type object.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.publish(1 as any);
                throw new Error("publish() should have thrown an error because data wasn't of type object!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the data as an object!");
            }
        });

        it("Should reject with an error when name is provided, but isn't of type string.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // The data to be published.
            const data = {
                test: 42
            };

            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.publish(data, 1 as any);
                throw new Error("publish() should have thrown an error because name wasn't of type string!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the name as a string!");
            }
        });

        it("Should reject with an error when not in a channel.", async () => {
            // The data to be published.
            const data = {
                test: 42
            };

            try {
                await myGlue.channels.publish(data);
                throw new Error("publish() should have thrown an error because not joined to any channel!");
            } catch (error) {
                expect(error.message).to.equal("Not joined to any channel!");
            }
        });

        it("Should correctly update the data of the current channel when no name is provided.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // The data to be published.
            const data = {
                test: 42
            };
            // Publish the data.
            await myGlue.channels.publish(data);

            // The channel context from get().
            const channelContextFromGet = await myGlue.channels.get(channelName);

            // The channels contexts.
            const channelContexts = await myGlue.channels.list();

            // The channel context from list().
            const channelContextFromList = channelContexts.find((channelContext) => channelContext.name === channelName);

            expect(channelContextFromGet.data).to.eql(data);
            expect(channelContextFromList?.data).to.eql(data);
        });

        it("Should correctly update the data of the provided channel when name is provided.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);

            // The data to be published.
            const data = {
                test: 42
            };
            // Publish the data.
            await myGlue.channels.publish(data, channelName);

            // The channel context from get().
            const channelContextFromGet = await myGlue.channels.get(channelName);

            // The channels contexts.
            const channelContexts = await myGlue.channels.list();

            // The channel context from list().
            const channelContextFromList = channelContexts.find((channelContext) => channelContext.name === channelName);

            expect(channelContextFromGet.data).to.eql(data);
            expect(channelContextFromList?.data).to.eql(data);
        });

        it("Should not update the data of the current channel when name is provided.", async () => {
            // The names of the channels to be added.
            const firstChannelName = "red";
            const secondChannelName = "yellow";

            // The initial data of the first channel.
            const firstChannelInitialData = {
                test: 24
            };

            // Add the channels.
            await Promise.all([addNewChannel(myGlue, firstChannelName, firstChannelInitialData), addNewChannel(myGlue, secondChannelName)]);
            // Join the first channel.
            await myGlue.channels.join(firstChannelName);

            // The data to be published to the second channel.
            const data = {
                test: 42
            };
            // Publish the data.
            await myGlue.channels.publish(data, secondChannelName);

            // The channel context from get().
            const firstChannelContextFromGet = await myGlue.channels.get(firstChannelName);

            // The channels contexts.
            const channelContexts = await myGlue.channels.list();

            // The channel context from list().
            const firstChannelContextFromList = channelContexts.find((channelContext) => channelContext.name === firstChannelName);

            expect(firstChannelContextFromGet.data).to.eql(firstChannelInitialData);
            expect(firstChannelContextFromList?.data).to.eql(firstChannelInitialData);
        });
    });

    describe("all()", () => {
        it("Should return an array with the correct channel names added by us and by another party.", async () => {
            // Create a new Glue for the other party.
            const otherGlue = await createGlue(true);

            // The names of the channels to be added by us.
            const channelNamesToBeAddedByUs = ["red", "yellow", "blue"];
            // The names of the channels to be added by the other party.
            const channelNamesToBeAddedByTheOtherParty = ["green", "pink", "orange"];

            // Add the channels.
            await Promise.all([
                ...channelNamesToBeAddedByUs.map((channelNameToBeAddedByUs => addNewChannel(myGlue, channelNameToBeAddedByUs))),
                ...channelNamesToBeAddedByTheOtherParty.map((channelNameToBeAddedByTheOtherParty => addNewChannel(otherGlue, channelNameToBeAddedByTheOtherParty)))
            ]);

            // The channel names that were added.
            const channelNames = await myGlue.channels.all();

            for (const channelNameToBeAdded of [...channelNamesToBeAddedByUs, ...channelNamesToBeAddedByTheOtherParty]) {
                expect(channelNames).to.include(channelNameToBeAdded);
            }
            expect(channelNames).to.be.of.length(channelNamesToBeAddedByUs.length + channelNamesToBeAddedByTheOtherParty.length);
        });

        it("Should return an empty array when there are no channels.", async () => {
            // The channel names that were added.
            const channelNames = await myGlue.channels.all();

            expect(channelNames).to.be.an("array").that.is.empty;
        });
    });

    describe("list()", () => {
        it("Should return an array with the correct channel contexts added by us and by another party.", async () => {
            // Create a new Glue for the other party.
            const otherGlue = await createGlue(true);

            // The names of the channels to be added by us.
            const channelNamesToBeAddedByUs = ["red", "yellow", "blue"];
            // The names of the channels to be added by the other party.
            const channelNamesToBeAddedByTheOtherParty = ["green", "pink", "orange"];

            // Add the channels.
            const infos = await Promise.all([
                ...channelNamesToBeAddedByUs.map((channelNameToBeAddedByUs => addNewChannel(myGlue, channelNameToBeAddedByUs))),
                ...channelNamesToBeAddedByTheOtherParty.map((channelNameToBeAddedByTheOtherParty => addNewChannel(otherGlue, channelNameToBeAddedByTheOtherParty)))
            ]);

            // The channel contexts that were added.
            const channelContexts = await myGlue.channels.list();

            expect(channelContexts).to.deep.include.members(infos);
            expect(channelContexts).to.be.of.length(channelNamesToBeAddedByUs.length + channelNamesToBeAddedByTheOtherParty.length);
        });

        it("Should return an empty array when there are no channels.", async () => {
            // The channel contexts that were added.
            const channelContexts = await myGlue.channels.list();

            expect(channelContexts).to.be.an("array").that.is.empty;
        });
    });

    describe("get()", () => {
        it("Should reject with an error when name isn't of type string.", async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.get(1 as any);
                throw new Error("get() should have thrown an error because name wasn't of type string!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the channel name as a string!");
            }
        });

        it("Should reject with an error when there isn't a channel with the provided name.", async () => {
            // Provided channel name.
            const channelName = "red";

            try {
                await myGlue.channels.get(channelName);
                throw new Error("get() should have thrown an error because there wasn't a channel with the provided name!");
            } catch (error) {
                expect(error.message).to.equal(`A channel with name: ${channelName} doesn't exist!`);
            }
        });

        it("Should return the context (name, meta and data) of the provided channel.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            const info = await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // The data to be published.
            const data = {
                test: 42
            };
            // Publish the data.
            await myGlue.channels.publish(data);

            // The expected new context.
            const context = {
                ...info,
                data
            };

            // The channel context.
            const channelContext = await myGlue.channels.get(channelName);

            expect(channelContext).to.eql(context);
        });
    });

    describe("join()", () => {
        it("Should reject with an error when name isn't of type string.", async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.join(1 as any);
                throw new Error("join() should have thrown an error because there wasn't a channel with the provided name!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the channel name as a string!");
            }
        });

        it("Should reject with an error when there isn't a channel with the provided name.", async () => {
            // Provided channel name.
            const channelName = "red";

            try {
                await myGlue.channels.join(channelName);
                throw new Error("join() should have thrown an error because name wasn't of type string!");
            } catch (error) {
                expect(error.message).to.equal(`A channel with name: ${channelName} doesn't exist!`);
            }
        });

        it("Should join the provided channel.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // The current channel.
            const currentChannel = myGlue.channels.current();

            expect(currentChannel).to.equal(channelName);
        });

        it("Should leave the current channel.", async () => {
            // The names of the channels to be added.
            const firstChannelName = "red";
            const secondChannelName = "yellow";

            // Add the channels.
            await Promise.all([addNewChannel(myGlue, firstChannelName), addNewChannel(myGlue, secondChannelName)]);
            // Join the first channel.
            await myGlue.channels.join(firstChannelName);

            // The current channel.
            let currentChannel = myGlue.channels.current();

            expect(currentChannel).to.equal(firstChannelName);

            // Join the second channel.
            await myGlue.channels.join(secondChannelName);

            // The current channel.
            currentChannel = myGlue.channels.current();

            expect(currentChannel).to.not.equal(firstChannelName);
            expect(currentChannel).to.equal(secondChannelName);
        });
    });

    describe("leave()", () => {
        it("Should leave the current channel.", async () => {
            // The name of the channel to be added.
            const channelName = "red";

            // Add the channel.
            await addNewChannel(myGlue, channelName);
            // Join the channel.
            await myGlue.channels.join(channelName);

            // Leave the channel.
            await myGlue.channels.leave();

            // The current channel.
            const currentChannel = myGlue.channels.current();

            expect(currentChannel).to.be.undefined;
        });
    });

    // my() is an alias of current().
    for (const methodName of ["current", "my"]) {
        describe(`${methodName}()`, () => {
            it("Should return the current channel.", async () => {
                // The name of the channel to be added.
                const channelName = "red";

                // Add the channel.
                await addNewChannel(myGlue, channelName);
                // Join the channel.
                await myGlue.channels.join(channelName);

                // The current channel.
                const currentChannel = eval(`myGlue.channels.${methodName}()`);

                expect(currentChannel).to.equal(channelName);
            });

            it("Should return undefined if no channel has been joined.", async () => {
                // The current channel.
                const currentChannel = eval(`myGlue.channels.${methodName}()`);

                expect(currentChannel).to.be.undefined;
            });
        });
    }

    // onChanged() is an alias of changed().
    for (const methodName of ["changed", "onChanged"]) {
        describe(`${methodName}()`, () => {
            it("Should throw an error when callback isn't of type function.", () => {
                try {
                    eval(`myGlue.channels.${methodName}("string")`);
                    throw new Error(`${methodName}() should have thrown an error because callback wasn't of type function!`);
                } catch (error) {
                    expect(error.message).to.equal("Please provide the callback as a function!");
                }
            });

            it("Should invoke the callback with the new channel name whenever a new channel is joined.", async () => {
                // The names of the channels to be added.
                const firstChannelName = "red";
                const secondChannelName = "yellow";

                // Add the channels.
                await Promise.all([addNewChannel(myGlue, firstChannelName), addNewChannel(myGlue, secondChannelName)]);
                // Join the first channel.
                await myGlue.channels.join(firstChannelName);

                // Subscribe for channel change.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const channelChangedPromise: Promise<string> = new Promise((resolve) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const unsubscribeFunc: () => void = eval(`myGlue.channels.${methodName}((channelName) => {
                        unsubscribeFunc();
                        return resolve(channelName);
                    })`);
                });

                // Join the second channel.
                await myGlue.channels.join(secondChannelName);

                // The new channel name.
                const newChannelName = await channelChangedPromise;

                expect(newChannelName).to.equal(secondChannelName);
            });

            it("Should invoke the callback with undefined whenever the current channel is left.", async () => {
                // The name of the channel to be added.
                const channelName = "red";

                // Add the channel.
                await addNewChannel(myGlue, channelName);
                // Join the channel.
                await myGlue.channels.join(channelName);

                // Subscribe for channel change.
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const channelChangedPromise: Promise<string> = new Promise((resolve) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const unsubscribeFunc: () => void = eval(`myGlue.channels.${methodName}((channelName) => {
                        unsubscribeFunc();
                        return resolve(channelName);
                    })`);
                });

                // Join the second channel.
                await myGlue.channels.leave();

                // The new channel name.
                const newChannelName = await channelChangedPromise;

                expect(newChannelName).to.be.undefined;
            });

            it("Should return a working unsubscribe function.", async () => {
                // The names of the channels to be added.
                const firstChannelName = "red";
                const secondChannelName = "yellow";

                // Add the channels.
                await Promise.all([addNewChannel(myGlue, firstChannelName), addNewChannel(myGlue, secondChannelName)]);
                // Join the first channel.
                await myGlue.channels.join(firstChannelName);

                // Set to true if we received the new channel name after unsubscribing.
                // eslint-disable-next-line prefer-const
                let channelNameReceived = false;

                // Subscribe for channel change.
                const unsubscribeFunc: () => void = eval(`myGlue.channels.${methodName}(() => {
                    channelNameReceived = true;
                })`);
                // Immediately unsubscribe.
                unsubscribeFunc();

                // Promise that will be rejected after 3k ms if we received a new channel name.
                const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (channelNameReceived) {
                            return reject("Received a new channel name.");
                        }

                        return resolve();
                    }, 3000);
                });

                // Join the second channel.
                await myGlue.channels.join(secondChannelName);

                return timeoutPromise;
            });

            it("Should not invoke the callback when the setup is there but the current channel isn't changed (3k ms).", async () => {
                // The name of the channel to be added.
                const channelName = "red";

                // Add the channel.
                await addNewChannel(myGlue, channelName);
                // Join the channel.
                await myGlue.channels.join(channelName);

                // Set to true if we received a new channel name.
                // eslint-disable-next-line prefer-const
                let channelNameReceived = false;

                // Subscribe for channel change.
                const unsubscribeFunc: () => void = eval(`myGlue.channels.${methodName}(() => {
                    channelNameReceived = true;
                })`);

                // Promise that will be rejected after 3k ms if we received a new channel name.
                const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        unsubscribeFunc();
                        if (channelNameReceived) {
                            return reject("Received a new channel name.");
                        }

                        return resolve();
                    }, 3000);
                });

                return timeoutPromise;
            });
        });
    }

    describe("add()", () => {
        it("Should reject with an error when info isn't of type object.", async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.add(1 as any);
                throw new Error("add() should have thrown an error because info wasn't of type object!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the info as an object!");
            }
        });

        it("Should reject with an error when info doesn't contain a name.", async () => {
            const info = {
                meta: {
                    color: "red"
                },
                data: {}
            };
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.add(info as any);
                throw new Error("add() should have thrown an error because info was missing name!");
            } catch (error) {
                expect(error.message).to.equal("info.name is missing!");
            }
        });

        it("Should reject with an error when info.name isn't of type string.", async () => {
            const info = {
                name: 1,
                meta: {
                    color: "red"
                },
                data: {}
            };
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.add(info as any);
                throw new Error("add() should have thrown an error because info.name wasn't of type string!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the info.name as a string!");
            }
        });

        it("Should reject with an error when info doesn't contain meta.", async () => {
            const info = {
                name: "red",
                data: {}
            };
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.add(info as any);
                throw new Error("add() should have thrown an error because info was missing meta!");
            } catch (error) {
                expect(error.message).to.equal("info.meta is missing!");
            }
        });

        it("Should reject with an error when info.meta isn't of type object.", async () => {
            const info = {
                name: "red",
                meta: 1,
                data: {}
            };
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.add(info as any);
                throw new Error("add() should have thrown an error because info.meta wasn't of type object!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the info.meta as an object!");
            }
        });

        it("Should reject with an error when info.meta doesn't contain color.", async () => {
            const info = {
                name: "red",
                meta: {},
                data: {}
            };
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.add(info as any);
                throw new Error("add() should have thrown an error because info.meta was missing color!");
            } catch (error) {
                expect(error.message).to.equal("info.meta.color is missing!");
            }
        });

        it("Should reject with an error when info.meta.color isn't of type string.", async () => {
            const info = {
                name: "red",
                meta: {
                    color: 1
                },
                data: {}
            };
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await myGlue.channels.add(info as any);
                throw new Error("add() should have thrown an error because info.meta.color wasn't of type string!");
            } catch (error) {
                expect(error.message).to.equal("Please provide the info.meta.color as a string!");
            }
        });

        it("Should add a new channel with the correct context (name, meta and data).", async () => {
            // The info of the channel to be added.
            const channelNameAndColor = "red";
            const info = {
                name: channelNameAndColor,
                meta: {
                    color: channelNameAndColor
                },
                data: {
                    test: 42
                }
            };

            // Add the channel.
            await myGlue.channels.add(info);

            // The channel context from get().
            const channelContextFromGet = await myGlue.channels.get(channelNameAndColor);

            // The channels contexts.
            const channelContexts = await myGlue.channels.list();

            // The channel context from list().
            const channelContextFromList = channelContexts.find((channelContext) => channelContext.name === channelNameAndColor);

            expect(channelContextFromGet).to.eql(info);
            expect(channelContextFromList).to.eql(info);
        });

        it("Should not automatically join the newly added channel.", async () => {
            // The info of the channel to be added.
            const channelNameAndColor = "red";
            const info = {
                name: channelNameAndColor,
                meta: {
                    color: channelNameAndColor
                },
                data: {
                    test: 42
                }
            };

            // Add the channel.
            await myGlue.channels.add(info);

            // The current channel from my().
            const currentChannelFromMy = myGlue.channels.my();

            // The current channel from current().
            const currentChannelFromCurrent = myGlue.channels.current();

            expect(currentChannelFromMy).to.be.undefined;
            expect(currentChannelFromCurrent).to.be.undefined;
        });
    });
});
