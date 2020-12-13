// describe('onInstanceStarted()', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(() => {
//         return gtf.appManager.stopAllOtherInstances();
//     });

//     it('Should throw an error when callback isn\'t of type function.', () => {
//         try {
//             glue.appManager.onInstanceStarted(42);
//             throw new Error('onInstanceStarted() should have thrown an error because callback wasn\'t of type function!');
//         } catch (error) {
//             expect(error.message).to.equal('Please provide the callback as a function!');
//         }
//     });

//     it('Should invoke the callback with the newly started application instance.', async () => {
//         const appNameToStart = 'coreSupport';

//         const instanceStartedPromise = new Promise((resolve) => {
//             const unsubscribeFunc = glue.appManager.onInstanceStarted((instance) => {
//                 if (instance.application.name === appNameToStart) {
//                     unsubscribeFunc();

//                     return resolve();
//                 }
//             });
//         });

//         await glue.appManager.application(appNameToStart).start();

//         return instanceStartedPromise;
//     });

//     it('Should replay started instances by invoking the callback with all previously started instances.', async () => {
//         const appNameToStart = 'coreSupport';

//         await glue.appManager.application(appNameToStart).start();

//         const allInstancesAppNames = [appNameToStart, RUNNER];
//         const startedInstancesAppNames = [];

//         const instanceStartedPromise = new Promise((resolve) => {
//             const unsubscribeFunc = glue.appManager.onInstanceStarted((instance) => {
//                 startedInstancesAppNames.push(instance.application.name);

//                 if (allInstancesAppNames.every((instanceAppName) => startedInstancesAppNames.includes(instanceAppName)) &&
//                     startedInstancesAppNames.every((startedInstanceAppName) => allInstancesAppNames.includes(startedInstanceAppName))) {
//                     unsubscribeFunc();

//                     return resolve();
//                 }
//             });
//         });

//         return instanceStartedPromise;
//     });

//     it('Should return a working unsubscribe function.', async () => {
//         let instanceStarted = false;

//         const unsubscribeFunc = glue.appManager.onInstanceStarted(() => {
//             instanceStarted = true;
//         });
//         unsubscribeFunc();

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 if (instanceStarted) {
//                     return reject(new Error('An instance was started.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         await glue.appManager.application('coreSupport').start();

//         return timeoutPromise;
//     });

//     it('Should not invoke the callback when the setup is there but no instance is started (3k ms).', () => {
//         let instanceStarted = false;

//         let doneReplaying = false;

//         const unsubscribeFunc = glue.appManager.onInstanceStarted(() => {
//             if (doneReplaying) {
//                 instanceStarted = true;
//             } else {
//                 doneReplaying = true;
//             }
//         });

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 unsubscribeFunc();
//                 if (instanceStarted) {
//                     return reject(new Error('An instance was started.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         return timeoutPromise;
//     });
// });
