const controlMethodName = 'G42Core.E2E.Control';

let myStreams = [];
let mySubscriptions = [];
const intentToUnsubObj = {};

const setContext = async ({ name, data }, success, error) => {
    if (!name) {
        return error(`Context name is not provided to operation setContext!`);
    }
    if (!data) {
        return error(`Context data is not provided to operation setContext!`);
    }

    await glue.contexts.set(name, data);

    success();
};

const updateContext = async ({ name, data }, success, error) => {
    if (!name) {
        return error(`Context name is not provided to operation setContext!`);
    }
    if (!data) {
        return error(`Context data is not provided to operation setContext!`);
    }

    await glue.contexts.update(name, data);

    success();
};

const getContext = async ({ name }, success, error) => {
    if (!name) {
        return error(`Context name is not provided to operation getContext`);
    }

    const context = await glue.contexts.get(name);

    success({ result: context });
};

const getAllContextNames = async (_, success) => {
    const contextNames = glue.contexts.all();

    success({ result: contextNames });
};

const register = async ({ methodDefinition }, success) => {
    await glue.interop.register(methodDefinition, (args) => {
        const shouldFail = args.shouldFail;

        if (typeof shouldFail !== 'undefined') {
            if ((typeof shouldFail === 'boolean' && shouldFail) ||
                (shouldFail.application === glue.interop.instance.application) ||
                (shouldFail.instance === glue.interop.instance.instance) ||
                (Array.isArray(shouldFail) && shouldFail.some((app) => app.instance === glue.interop.instance.instance))) {
                throw new Error('Failing on purpose!');
            }
        }

        return args;
    });
    success();
};

const unregisterMethod = async ({ methodDefinition }, success) => {
    glue.interop.unregister(methodDefinition);
    success();
};

const registerAsync = async ({ methodDefinition, responseName }, success) => {
    await glue.interop.registerAsync(methodDefinition, async (args, _, successCallback, errorCallback) => {
        const shouldFail = args.shouldFail;

        if (typeof shouldFail !== 'undefined') {
            if ((typeof shouldFail === 'boolean' && shouldFail) ||
                (shouldFail.application === glue.interop.instance.application) ||
                (shouldFail.instance === glue.interop.instance.instance) ||
                (Array.isArray(shouldFail) && shouldFail.some((app) => app.instance === glue.interop.instance.instance))) {

                errorCallback('Failing on purpose!');

                return;
            }
        }

        await glue.interop.invoke(responseName, { args });

        successCallback();
    });
    success();
};

const createStream = async ({ methodDefinition }, success) => {
    let publicData;
    let newStream;

    const subscriptionRequestHandler = (request) => {
        if (request.arguments.reject) {
            request.reject();
            return;
        }

        if (request.arguments.publicData) {
            publicData = request.arguments.publicData;
        }

        const branchKey = request.arguments.branchKey;
        if (branchKey) {
            request.acceptOnBranch(branchKey);
            return;
        }

        request.accept();
    };

    const subscriptionAddedHandler = (subscription) => {
        const privateData = subscription.arguments.privateData;
        if (privateData) {
            const data = {
                private: privateData
            };

            subscription.push(data);
            return;
        }

        if (subscription.arguments.closeMe) {
            setTimeout(() => {
                subscription.close();
            }, subscription.arguments.closeMeAfter || 1000);
            return;
        }

        if (publicData) {
            const data = {
                public: publicData
            };
            newStream.push(data);
        }
    };

    newStream = await glue.interop.createStream(methodDefinition, {
        subscriptionAddedHandler,
        subscriptionRequestHandler
    });
    myStreams.push(newStream);
    success();
};

const pushStream = async ({ methodDefinition, data, branches }, success) => {
    const stream = myStreams.find((myStream) => myStream.definition.name === methodDefinition.name);

    if (typeof stream === 'undefined') {
        throw new Error('You need to open a coreSupport stream before you use it!');
    }

    stream.push(data, branches);

    success();
};

const closeStream = async ({ methodDefinition }, success) => {
    const stream = myStreams.find((myStream) => myStream.definition.name === methodDefinition.name);

    if (typeof stream === 'undefined') {
        throw new Error('You are trying to close a stream that is not opened(was never opened or was closed).Remember to call the`createStream()` method on a coreSupport object before trying to close a stream.');
    }

    stream.close();
    myStreams = myStreams.filter((myStream) => myStream.definition.name !== methodDefinition.name);

    success();
};

const subscribe = async ({ methodDefinition, parameters, responseName }, success, error) => {
    try {
        const newSubscription = await glue.interop.subscribe(methodDefinition, parameters);
        mySubscriptions.push(newSubscription);
        newSubscription.onData(({ data, requestArguments }) => {
            glue.interop.invoke(responseName, { data, requestArguments });
        });

        success();
    } catch (err) {
        error('Subscription rejected!');
    }
};

const unsubscribe = async ({ methodDefinition }, success) => {
    const subscription = mySubscriptions.find((mySubscription) => mySubscription.stream.name === methodDefinition.name);

    if (typeof subscription === 'undefined') {
        throw new Error('You are trying to unsubscribe from a stream you are not subscribed to.Remember to call the`subscribe()` method on a coreSupport object before trying to unsubscribe from a stream.');
    }

    subscription.close();
    mySubscriptions = mySubscriptions.filter((mySubscription) => mySubscription.stream.name !== methodDefinition.name);

    success();
};

const waitForMethodAdded = async ({ methodDefinition, targetAgmInstance }, success) => {
    await new Promise((resolve) => {
        const unsub = glue.interop.serverMethodAdded(({ method, server }) => {
            if (method.name === methodDefinition.name) {
                if (typeof targetAgmInstance === "undefined") {
                    unsub();
                    resolve();
                } else {
                    if (targetAgmInstance === server.instance) {
                        unsub();
                        resolve();
                    }
                }
            }
        });
    });
    success();
};

const addIntentListener = async ({ intent }, success, error) => {
    const intentName = intent.intent;
    if (typeof intentToUnsubObj[intentName] === 'undefined') {
        const unsubObj = glue.intents.addIntentListener(intent, (context) => {
            return context;
        });

        intentToUnsubObj[intentName] = unsubObj;
        success();
    } else {
        error(`Intent ${intentName} already registered!`);
    }
};

const unregisterIntent = ({ intent }, success, error) => {
    const intentName = intent.intent;
    if (typeof intentToUnsubObj[intentName] === 'undefined') {
        error(`Intent ${intentName} already unregistered!`);
    } else {
        intentToUnsubObj[intentName].unsubscribe();

        delete intentToUnsubObj[intentName];

        success();
    }
};

const publish = async ({ data, name }, success) => {
    await glue.channels.publish(data, name);

    success();
};

const operations = [
    { name: 'setContext', execute: setContext },
    { name: 'updateContext', execute: updateContext },
    { name: 'getContext', execute: getContext },
    { name: 'getAllContextNames', execute: getAllContextNames },
    { name: 'register', execute: register },
    { name: 'unregisterMethod', execute: unregisterMethod },
    { name: 'registerAsync', execute: registerAsync },
    { name: 'createStream', execute: createStream },
    { name: 'pushStream', execute: pushStream },
    { name: 'closeStream', execute: closeStream },
    { name: 'subscribe', execute: subscribe },
    { name: 'unsubscribe', execute: unsubscribe },
    { name: 'waitForMethodAdded', execute: waitForMethodAdded },
    { name: 'addIntentListener', execute: addIntentListener },
    { name: 'unregisterIntent', execute: unregisterIntent },
    { name: 'publish', execute: publish }
];

const handleControl = (args, _, success, error) => {
    const operation = args.operation;
    const params = args.params;

    const foundOperation = operations.find((op) => op.name === operation);

    if (!foundOperation) {
        error(`Unrecognized operation: ${operation}`);
        return;
    }

    foundOperation.execute(params, success, error);
};

GlueWeb().then((glue) => {
    window.glue = glue;

    glue.intents.addIntentListener('core-intent', (context) => context);

    return glue.interop.registerAsync(controlMethodName, handleControl);
}).catch(console.error);
