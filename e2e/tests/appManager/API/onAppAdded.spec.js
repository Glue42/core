// describe('onAppAdded()', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(async () => {
//         await gtf.appManager.resetRemoteSourceApplications();

//         // Wait for the reset application definitions from the remoteSource to be fetched.
//         return gtf.waitForFetch();
//     });

//     it('Should throw an error when callback isn\'t of type function.', () => {
//         try {
//             glue.appManager.onAppAdded(42);
//             throw new Error('onAppAdded() should have thrown an error because callback wasn\'t of type function!');
//         } catch (error) {
//             expect(error.message).to.equal('Please provide the callback as a function!');
//         }
//     });

//     it('Should invoke the callback with the newly added application provided by a remote source.', async () => {
//         const newApplicationToAdd = {
//             name: 'new-application',
//             details: {
//                 url: 'https://glue42.com/'
//             }
//         };

//         const appAddedPromise = new Promise((resolve) => {
//             const unsubscribeFunc = glue.appManager.onAppAdded((app) => {
//                 // The method replays all previously added applications.
//                 if (app.name === newApplicationToAdd.name) {
//                     unsubscribeFunc();

//                     return resolve();
//                 }
//             });
//         });

//         await gtf.appManager.addRemoteSourceApplication(newApplicationToAdd);

//         return appAddedPromise;
//     });

//     it('Should replay existing applications by invoking the callback with all previously added applications provided inside of localApplications and by a remoteSource.', async () => {
//         const localAppNames = gtf.appManager.getLocalApplications().map((localApp) => localApp.name);
//         const validRemoteAppNames = (await gtf.appManager.getRemoteSourceApplications()).map((remoteApp) => remoteApp.name).filter((remoteAppName) => remoteAppName !== 'invalid-application');
//         const allValidAppNames = [
//             ...localAppNames,
//             ...validRemoteAppNames
//         ];

//         const appNamesCallbackCalledWith = [];

//         const allAppsAddedPromise = new Promise((resolve) => {
//             const unsubscribeFunc = glue.appManager.onAppAdded((app) => {
//                 appNamesCallbackCalledWith.push(app.name);

//                 if (appNamesCallbackCalledWith.every((appNameCallbackCalledWith) => allValidAppNames.includes(appNameCallbackCalledWith)) &&
//                     allValidAppNames.every((appName) => appNamesCallbackCalledWith.includes(appName))) {
//                     unsubscribeFunc();

//                     return resolve();
//                 }
//             });
//         });

//         return allAppsAddedPromise;
//     });

//     it('Should return a working unsubscribe function.', async () => {
//         const newApplicationToAdd = {
//             name: 'new-application',
//             details: {
//                 url: 'https://glue42.com/'
//             }
//         };

//         let appAdded = false;

//         const unsubscribeFunc = glue.appManager.onAppAdded(() => {
//             appAdded = true;
//         });
//         unsubscribeFunc();

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 if (appAdded) {
//                     return reject(new Error('An app was added.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         await gtf.appManager.addRemoteSourceApplication(newApplicationToAdd);

//         return timeoutPromise;
//     });

//     it('Should not invoke the callback when the setup is there but no app is changed (3k ms).', async () => {
//         const localAppNames = gtf.appManager.getLocalApplications().map((localApp) => localApp.name);
//         const validRemoteAppNames = (await gtf.appManager.getRemoteSourceApplications()).map((remoteApp) => remoteApp.name).filter((remoteAppName) => remoteAppName !== 'invalid-application');
//         const allValidAppNames = [
//             ...localAppNames,
//             ...validRemoteAppNames
//         ];

//         const appsAddedNames = [];
//         let doneReplaying = false;
//         let appAdded = false;

//         const unsubscribeFunc = glue.appManager.onAppAdded((app) => {
//             if (doneReplaying) {
//                 appAdded = true;
//             } else {
//                 appsAddedNames.push(app.name);

//                 doneReplaying = allValidAppNames.every((validAppName) => appsAddedNames.includes(validAppName));
//             }
//         });

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 unsubscribeFunc();

//                 if (appAdded) {
//                     return reject(new Error('An app was added.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         return timeoutPromise;
//     });
// });
