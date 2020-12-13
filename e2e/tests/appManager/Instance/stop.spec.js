// describe('stop()', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(() => {
//         return gtf.appManager.stopAllOtherInstances();
//     });

//     it('Should stop the application instance.', async () => {
//         const appNameToStartAndStop = 'coreSupport';
//         const app = glue.appManager.application(appNameToStartAndStop);

//         const instanceToStop = await app.start();

//         expect(app.instances).to.be.of.length(1);

//         await instanceToStop.stop();

//         expect(app.instances).to.be.of.length(0);
//     });
// });
