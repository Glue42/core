// describe('onInstanceStopped()', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(() => {
//         return gtf.appManager.stopAllOtherInstances();
//     });

//     it('Should throw an error when callback isn\'t of type function.', () => {
//         const app = glue.appManager.application('coreSupport');

//         try {
//             app.onInstanceStopped(42);
//             throw new Error('app.onInstanceStopped() should have thrown an error because callback wasn\'t of type function!');
//         } catch (error) {
//             expect(error.message).to.equal('Please provide the callback as a function!');
//         }
//     });

//     it.skip('Should invoke the callback with the stopped application instance. | https://github.com/Glue42/core/issues/148', async () => {
//         const appNameToStartAndStop = 'coreSupport';
//         const app = glue.appManager.application(appNameToStartAndStop);

//         const instanceToStop = await app.start();

//         const instanceStoppedPromise = new Promise((resolve) => {
//             const unsubscribeFunc = app.onInstanceStopped((instance) => {
//                 if (instance.application.name === appNameToStartAndStop) {
//                     unsubscribeFunc();

//                     return resolve(instance);
//                 }
//             });
//         });

//         expect(app.instances).to.be.of.length(1);

//         await instanceToStop.stop();

//         return instanceStoppedPromise;
//     });

//     it.skip('Should return a working unsubscribe function. | https://github.com/Glue42/core/issues/148', async () => {
//         const app = glue.appManager.application('coreSupport');
//         const instanceToStop = await app.start();

//         let instanceStopped = false;

//         const unsubscribeFunc = app.onInstanceStopped(() => {
//             instanceStopped = true;
//         });
//         unsubscribeFunc();

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 if (instanceStopped) {
//                     return reject(new Error('An instance was stopped.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         await instanceToStop.stop();

//         return timeoutPromise;
//     });

//     it.skip('Should not invoke the callback when the setup is there but no instance is stopped (3k ms). | https://github.com/Glue42/core/issues/148', async () => {
//         const app = glue.appManager.application('coreSupport');

//         await app.start();

//         let instanceStopped = false;

//         const unsubscribeFunc = app.onInstanceStopped(() => {
//             instanceStopped = true;
//         });

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 unsubscribeFunc();
//                 if (instanceStopped) {
//                     return reject(new Error('An instance was stopped.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         return timeoutPromise;
//     });
// });
