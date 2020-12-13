// describe('properties', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(() => {
//         return gtf.appManager.stopAllOtherInstances();
//     });

//     describe('id', () => {
//         it('Should be set correctly.', async () => {
//             const instance = await glue.appManager.application('coreSupport').start();
//             const instanceId = instance.id;

//             expect(instanceId).to.not.be.empty;
//             expect(instanceId).to.be.a('string');
//         });
//     });

//     describe('application', () => {
//         it('Should be set correctly.', async () => {
//             const appName = 'coreSupport';
//             const app = glue.appManager.application(appName);
//             const instance = await app.start();

//             expect(instance.application).to.eql(app);
//         });
//     });

//     describe('agm', () => {
//         it('Should be set correctly.', async () => {
//             const appName = 'coreSupport';
//             const instance = await glue.appManager.application(appName).start();

//             expect(instance.agm.application).to.equal(appName);
//             expect(instance.agm.applicationName).to.equal(appName);
//         });
//     });
// });
