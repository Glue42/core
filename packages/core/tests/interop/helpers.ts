import { Glue42Core } from "../../glue";

let genericStream: Glue42Core.Interop.Stream | undefined;
let genericStreamName: string;
let id = 1;
let intervalId: any;

export const compareInstance = (i1: Glue42Core.Interop.Instance, i2: Glue42Core.Interop.Instance) => {
    if ((!i1 && i2) || (i1 && !i2)) {
        return false;
    }
    return i1.application === i2.application &&
        i1.user === i2.user &&
        i1.instance === i2.instance &&
        i1.pid === i2.pid;
};

export const waitFor = (num: number, funcToCall: any) => {
    let left = num;
    return () => {

        left--;
        // console.log('waitFor.left', left)
        if (left === 0) {
            funcToCall();
        }
    };
};

export const getMethodName = () => {
    return `agm.integration.tests.method.${(new Date()).getTime()}.${id++}`;
};

/**
 * Parameters:
 * reject - if true rejects the subscription
 * branch - accepts the subscription on a branch
 * privateData - returned back to subscriber on private channel
 * publicData - server streams publicData to all subscriptions
 * branchData - {branchKey, data}
 * closeAfter - closes the stream after X milliseconds
 * waitForSubsCount - used in combination with delayedPrivateData
 * delayedPrivateData -
 * @param done
 */
export const registerGenericStream = async (glue: Glue42Core.GlueCore) => {
    genericStreamName = `agm.integration.tests.stream.${(new Date()).getTime()}.${id++}`;

    let branch;
    let publicData: any;
    let branchData: any;

    const stream = await glue.agm.createStream(genericStreamName,
        {
            subscriptionRequestHandler(request) {
                const args: any = request.arguments;
                publicData = args.publicData;
                branchData = args.branchData;

                if (!args.reject) {
                    if (args.branch) {
                        branch = args.branch;
                        request.acceptOnBranch(branch);
                    } else {
                        request.accept();
                    }
                } else {
                    request.reject();
                }
            },
            subscriptionAddedHandler(subscription) {
                // sends back private data as requested by the client
                if (subscription.arguments.privateData) {
                    subscription.push(subscription.arguments.privateData);
                }

                if (subscription.arguments.closeAfter) {
                    setTimeout(() => {
                        subscription.close();
                    }, subscription.arguments.closeAfter);
                }

                if (subscription.arguments.waitForSubsCount && genericStream?.subscriptions().length === subscription.arguments.waitForSubsCount) {
                    if (subscription.arguments.delayedData) {
                        genericStream?.push(subscription.arguments.delayedData, [subscription.arguments.branch]);
                    } else if (subscription.arguments.delayedPrivateData) {
                        subscription.push(subscription.arguments.delayedPrivateData);
                    }
                }
            }
        });

    // tslint:disable-next-line:no-console
    console.log(`stream ${genericStreamName} ready`);
    genericStream = stream;

    // start publishing public data
    intervalId = setInterval(() => {
        if (publicData) {
            stream.push({ publicData });
        }
        if (branchData) {
            Object.keys(branchData).forEach((branchKey) => {
                stream.push({ branchData: branchData[branchKey] }, [branchKey]);
            });
        }
    }, 50);

    return stream;
};

export const unregisterGenericStream = () => {
    clearInterval(intervalId);
    intervalId = undefined;
    genericStream?.close();
    genericStream = undefined;
};

// let interop: Glue42Core.Interop.API;
// let methodName: string;
// let dummyTab;
// let DUMMY_SERVER_NAME = "Dummy server";
// let index = 0;

// function registerMethod(done) {
//     let calledDone = false;
//     methodName = "BasicMethod" + index;
//     index += 1;
//     console.log("registering method " + methodName);

//     interop.methodAdded(function (m) {
//         if (m.name === methodName && !calledDone) {
//             calledDone = true;
//             done();
//         }
//     });

//     interop.register(methodName, function (args) {
//         console.debug("Invoked with args...", args);
//         if (args && args.justReturn) {
//             return { justReturn: args.justReturn };
//         }
//     });
// }

// function unregisterMethod(done) {
//     console.log("unregistering method " + methodName);
//     interop.unregister(methodName);
//     console.log("unregistered method " + methodName);
//     done();
// }

// function startDummyServer(done) {
//     let calledDone = false;

//     interop.serverAdded(function (server) {
//         console.debug("added", server);

//         if (
//             !calledDone
//             && server.application === DUMMY_SERVER_NAME
//         ) {
//             console.debug("done() beforeEach");
//             calledDone = true;
//             done();
//         }
//     });

//     // setTimeout(function () {
//     console.log(Date(), "opening");
//     dummyTab = window.open(
//         window.location.href.replace("index-methods", "dummy-server"),
//         "dummy-server"
//     );
//     // }, 2000)

// }

// function closeDummyServer(done) {
//     if (dummyTab && typeof dummyTab.close === "function") {
//         dummyTab.close();
//     }
//     // console.debug('done() afterEach');
//     done();
// }
