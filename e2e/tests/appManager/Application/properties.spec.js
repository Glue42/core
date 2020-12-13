// describe('properties', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(() => {
//         return gtf.appManager.stopAllOtherInstances();
//     });

//     describe('_url', () => {
//         it('Should be set correctly in the case of a Glue42 Core application.', () => {
//             const appName = 'coreSupport';
//             const expectedUrl = gtf.appManager.getLocalApplications().find((localApp) => localApp.name === appName).details.url;
//             const url = glue.appManager.application(appName)._url;

//             expect(url).to.eql(expectedUrl);
//         });

//         it('Should be set correctly in the case of a FDC3 application with a top level url property inside the manifest.', () => {
//             const appName = 'FDC3App-top-level-url';
//             const expectedUrl = JSON.parse(gtf.appManager.getLocalApplications().find((localApp) => localApp.name === appName).manifest).url;
//             const url = glue.appManager.application(appName)._url;

//             expect(url).to.eql(expectedUrl);
//         });

//         it('Should be set correctly in the case of a FDC3 application with a url property inside a top level details property inside the manifest.', () => {
//             const appName = 'FDC3App-url-inside-of-top-level-details';
//             const expectedUrl = JSON.parse(gtf.appManager.getLocalApplications().find((localApp) => localApp.name === appName).manifest).details.url;
//             const url = glue.appManager.application(appName)._url;

//             expect(url).to.eql(expectedUrl);
//         });
//     });

//     describe('name', () => {
//         it('Should be set correctly.', async () => {
//             const localAppNames = gtf.appManager.getLocalApplications().map((localApp) => localApp.name);
//             const validRemoteAppNames = (await gtf.appManager.getRemoteSourceApplications()).map((remoteApp) => remoteApp.name).filter((remoteAppName) => remoteAppName !== 'invalid-application');
//             const allValidAppNames = [
//                 ...localAppNames,
//                 ...validRemoteAppNames
//             ];

//             for (const validAppName of allValidAppNames) {
//                 const app = glue.appManager.application(validAppName);
//                 expect(app.name).to.equal(validAppName);
//             }
//         });
//     });

//     describe('title', () => {
//         it('Should be set correctly.', async () => {
//             const localApps = gtf.appManager.getLocalApplications();
//             const validRemoteApps = (await gtf.appManager.getRemoteSourceApplications()).filter((remoteApp) => remoteApp.name !== 'invalid-application');
//             const allValidApps = [
//                 ...localApps,
//                 ...validRemoteApps
//             ];

//             for (const validApp of allValidApps) {
//                 const app = glue.appManager.application(validApp.name);
//                 expect(app.title).to.equal(validApp.title || '');
//             }
//         });
//     });

//     describe('version', () => {
//         it('Should be set correctly.', async () => {
//             const localApps = gtf.appManager.getLocalApplications();
//             const validRemoteApps = (await gtf.appManager.getRemoteSourceApplications()).filter((remoteApp) => remoteApp.name !== 'invalid-application');
//             const allValidApps = [
//                 ...localApps,
//                 ...validRemoteApps
//             ];

//             for (const validApp of allValidApps) {
//                 const app = glue.appManager.application(validApp.name);
//                 expect(app.version).to.equal(validApp.version || '');
//             }
//         });
//     });

//     describe('icon', () => {
//         it('Should be set correctly.', async () => {
//             const localApps = gtf.appManager.getLocalApplications();
//             const validRemoteApps = (await gtf.appManager.getRemoteSourceApplications()).filter((remoteApp) => remoteApp.name !== 'invalid-application');
//             const allValidApps = [
//                 ...localApps,
//                 ...validRemoteApps
//             ];

//             for (const validApp of allValidApps) {
//                 const app = glue.appManager.application(validApp.name);
//                 expect(app.icon).to.equal(validApp.icon || '');
//             }
//         });
//     });

//     describe('caption', () => {
//         it('Should be set correctly.', async () => {
//             const localApps = gtf.appManager.getLocalApplications();
//             const validRemoteApps = (await gtf.appManager.getRemoteSourceApplications()).filter((remoteApp) => remoteApp.name !== 'invalid-application');
//             const allValidApps = [
//                 ...localApps,
//                 ...validRemoteApps
//             ];

//             for (const validApp of allValidApps) {
//                 const app = glue.appManager.application(validApp.name);
//                 expect(app.caption).to.equal(validApp.caption || '');
//             }
//         });
//     });

//     describe('userProperties', () => {
//         it('Should be set correctly.', async () => {
//             const localApps = gtf.appManager.getLocalApplications();
//             const validRemoteApps = (await gtf.appManager.getRemoteSourceApplications()).filter((remoteApp) => remoteApp.name !== 'invalid-application');
//             const allValidApps = [
//                 ...localApps,
//                 ...validRemoteApps
//             ];

//             for (const validApp of allValidApps) {
//                 const app = glue.appManager.application(validApp.name);
//                 const glue42CoreAppProps = ["name", "title", "version", "customProperties", "icon", "caption"];
//                 const expectedUserProperties = {
//                     ...Object.fromEntries(Object.entries(validApp).filter(([key]) => !glue42CoreAppProps.includes(key))),
//                     ...validApp.customProperties
//                 };

//                 expect(app.userProperties).to.eql(expectedUserProperties);
//             }
//         });
//     });

//     describe('instances', () => {
//         it('Should be set correctly.', async () => {
//             const appName = 'coreSupport';
//             const app = glue.appManager.application(appName);

//             expect(app.instances).to.be.empty;

//             const appInstance = await app.start();

//             const appInstances = app.instances;

//             expect(appInstances).to.be.of.length(1);

//             const onlyInstance = appInstances[0];
//             expect(onlyInstance.id).to.equal(appInstance.id);
//             expect(onlyInstance.application.name).to.equal(appName);

//             await appInstance.stop();

//             expect(app.instances).to.be.empty;
//         });
//     });
// });
