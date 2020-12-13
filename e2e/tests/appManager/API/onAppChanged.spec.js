// describe('onAppChanged()', () => {
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
//             glue.appManager.onAppChanged(42);
//             throw new Error('onAppChanged() should have thrown an error because callback wasn\'t of type function!');
//         } catch (error) {
//             expect(error.message).to.equal('Please provide the callback as a function!');
//         }
//     });

//     it('Should invoke the callback with the changed application provided by a remote source.', async () => {
//         const apps = await gtf.appManager.getRemoteSourceApplications();

//         const nameOfAppToChange = 'AppWithDetails-remote';
//         const newURLOfAppToChange = 'https://tick42.com/';
//         const appToChange = apps.find((app) => app.name === nameOfAppToChange);
//         appToChange.details.url = newURLOfAppToChange;
//         const appsBesidesAppToChange = apps.filter((app) => app.name !== nameOfAppToChange);
//         const newApps = [
//             ...appsBesidesAppToChange,
//             appToChange
//         ];

//         const appChangedPromise = new Promise((resolve) => {
//             const unsubscribeFunc = glue.appManager.onAppChanged((app) => {
//                 if (app.name === nameOfAppToChange) {
//                     unsubscribeFunc();

//                     return resolve();
//                 }
//             });
//         });

//         await gtf.appManager.setRemoteSourceApplications(newApps);

//         return appChangedPromise;
//     });

//     it('Should return a working unsubscribe function.', async () => {
//         const apps = await gtf.appManager.getRemoteSourceApplications();

//         const nameOfAppToChange = 'AppWithDetails-remote';
//         const newURLOfAppToChange = 'https://tick42.com/';
//         const appToChange = apps.find((app) => app.name === nameOfAppToChange);
//         appToChange.details.url = newURLOfAppToChange;
//         const appsBesidesAppToChange = apps.filter((app) => app.name !== nameOfAppToChange);
//         const newApps = [
//             ...appsBesidesAppToChange,
//             appToChange
//         ];

//         let appChanged = false;

//         const unsubscribeFunc = glue.appManager.onAppChanged(() => {
//             appChanged = true;
//         });
//         unsubscribeFunc();

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 if (appChanged) {
//                     return reject(new Error('An app was changed.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         await gtf.appManager.setRemoteSourceApplications(newApps);

//         return timeoutPromise;
//     });

//     it('Should not invoke the callback when the setup is there but no app is changed (3k ms).', () => {
//         let appChanged = false;

//         const unsubscribeFunc = glue.appManager.onAppChanged(() => {
//             appChanged = true;
//         });

//         const timeoutPromise = new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 unsubscribeFunc();

//                 if (appChanged) {
//                     return reject(new Error('An app was changed.'));
//                 }

//                 return resolve();
//             }, 3000);
//         });

//         return timeoutPromise;
//     });
// });
