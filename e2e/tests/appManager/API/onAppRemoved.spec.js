// describe('onAppRemoved()', () => {
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
//             glue.appManager.onAppRemoved(42);
//             throw new Error('onAppRemoved() should have thrown an error because callback wasn\'t of type function!');
//         } catch (error) {
//             expect(error.message).to.equal('Please provide the callback as a function!');
//         }
//     });

//     it('Should invoke the callback with the removed application provided by a remote source.', async () => {
//         const apps = await gtf.appManager.getRemoteSourceApplications();
//         const nameOfAppToRemove = 'AppWithDetails-remote';

//         const newApps = apps.filter((app) => app.name !== nameOfAppToRemove);

//         const appRemovedPromise = new Promise((resolve) => {
//             const unsubscribeFunc = glue.appManager.onAppRemoved((app) => {
//                 if (app.name === nameOfAppToRemove) {
//                     unsubscribeFunc();

//                     return resolve();
//                 }
//             });
//         });

//         await gtf.appManager.setRemoteSourceApplications(newApps);

//         return appRemovedPromise;
//     });

//     it('Should return a working unsubscribe function.', async () => {
//         const apps = await gtf.appManager.getRemoteSourceApplications();
//         const nameOfAppToRemove = 'AppWithDetails-remote';

//         const newApps = apps.filter((app) => app.name !== nameOfAppToRemove);

//         let appRemoved = false;

//         const unsubscribeFunc = glue.appManager.onAppRemoved(() => {
//             appRemoved = true;
//         });
//         unsubscribeFunc();

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 if (appRemoved) {
//                     return reject(new Error('An app was removed.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         await gtf.appManager.setRemoteSourceApplications(newApps);

//         return timeoutPromise;
//     });

//     it('Should not invoke the callback when the setup is there but no app is removed (3k ms).', () => {
//         let appRemoved = false;

//         const unsubscribeFunc = glue.appManager.onAppRemoved(() => {
//             appRemoved = true;
//         });

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 unsubscribeFunc();
//                 if (appRemoved) {
//                     return reject(new Error('An app was removed.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         return timeoutPromise;
//     });
// });
