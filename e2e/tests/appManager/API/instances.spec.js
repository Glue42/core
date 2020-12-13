// describe('instances()', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(() => {
//         return gtf.appManager.stopAllOtherInstances();
//     });

//     it('Should return all running application instances.', async () => {
//         const runningInstancesAtStart = glue.appManager.instances();

//         expect(runningInstancesAtStart).to.be.of.length(1);
//         expect(runningInstancesAtStart[0].application.name).to.equal(RUNNER);

//         await glue.appManager.application('coreSupport').start();
//         const runningInstancesAfterStartingSupport = glue.appManager.instances();

//         expect(runningInstancesAfterStartingSupport).to.be.of.length(2);

//         const runningInstancesAppNamesAfterStartingSupport = runningInstancesAfterStartingSupport.map((runningInstanceAfterStartingSupport) => runningInstanceAfterStartingSupport.application.name);

//         expect(runningInstancesAppNamesAfterStartingSupport.includes(RUNNER)).to.be.true;
//         expect(runningInstancesAppNamesAfterStartingSupport.includes('coreSupport')).to.be.true;
//     });
// });
