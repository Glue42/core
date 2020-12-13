// describe('onInstanceStarted()', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(() => {
//         return gtf.appManager.stopAllOtherInstances();
//     });

//     it('Should throw an error when callback isn\'t of type function.', () => {
//         const app = glue.appManager.application('coreSupport');

//         try {
//             app.onInstanceStarted(42);
//             throw new Error('app.onInstanceStarted() should have thrown an error because callback wasn\'t of type function!');
//         } catch (error) {
//             expect(error.message).to.equal('Please provide the callback as a function!');
//         }
//     });

//     it.skip('Should invoke the callback with the newly started application instance. | https://github.com/Glue42/core/issues/148', async () => {
//         const appNameToStart = 'coreSupport';
//         const app = glue.appManager.application(appNameToStart);

//         const instanceStartedPromise = new Promise((resolve) => {
//             const unsubscribeFunc = app.onInstanceStarted((instance) => {
//                 if (instance.application.name === appNameToStart) {
//                     unsubscribeFunc();

//                     return resolve();
//                 }
//             });
//         });

//         await app.start();

//         return instanceStartedPromise;
//     });

//     it.skip('Should not call the callback when an instance of another application is started. | https://github.com/Glue42/core/issues/148', async () => {
//         const currentAppName = RUNNER;
//         const currentApp = glue.appManager.application(currentAppName);

//         const appNameToStart = 'coreSupport';
//         const appToStart = glue.appManager.application(appNameToStart);

//         let instanceStarted = false;
//         let doneReplaying = false;

//         const unsubscribeFunc = currentApp.onInstanceStarted(() => {
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

//         await appToStart.start();

//         return timeoutPromise;
//     });

//     it.skip('Should return a working unsubscribe function. | https://github.com/Glue42/core/issues/148', async () => {
//         const app = glue.appManager.application('coreSupport');

//         let instanceStarted = false;

//         const unsubscribeFunc = app.onInstanceStarted(() => {
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

//         await app.start();

//         return timeoutPromise;
//     });

//     it.skip('Should not invoke the callback when the setup is there but no instance is started (3k ms). | https://github.com/Glue42/core/issues/148', () => {
//         const app = glue.appManager.application('coreSupport');

//         let instanceStarted = false;

//         let doneReplaying = false;

//         const unsubscribeFunc = app.onInstanceStarted(() => {
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
