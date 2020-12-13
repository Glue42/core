// describe('getContext()', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(() => {
//         return gtf.appManager.stopAllOtherInstances();
//     });

//     it('Should return a promise that resolves with the starting context.', async () => {
//         const startingContext = {
//             test: 42
//         };

//         const instance = await glue.appManager.application('coreSupport').start(startingContext);

//         const context = await instance.getContext();

//         expect(context).to.eql(startingContext);
//     });
// });
