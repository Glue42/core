// describe('start()', () => {
//     before(() => {
//         return coreReady;
//     });

//     afterEach(() => {
//         return gtf.appManager.stopAllOtherInstances();
//     });

//     it('Should throw an error when context isn\'t of type object.', async () => {
//         const app = glue.appManager.application('coreSupport');

//         try {
//             await app.start(42);
//             throw new Error('app.start() should have thrown an error because context wasn\'t of type object!');
//         } catch (error) {
//             expect(error.message).to.equal('Please provide the context as an object!');
//         }
//     });

//     it('Should throw an error when options isn\'t of type object.', async () => {
//         const app = glue.appManager.application('coreSupport');

//         try {
//             await app.start({}, 42);
//             throw new Error('app.start() should have thrown an error because options wasn\'t of type object!');
//         } catch (error) {
//             expect(error.message).to.equal('Please provide the options as an object!');
//         }
//     });

//     it('Should start the application.', async () => {
//         const app = glue.appManager.application('coreSupport');

//         expect(app.instances).to.be.of.length(0);

//         await app.start();

//         expect(app.instances).to.be.of.length(1);
//     });

//     it.skip('Should start the application with the provided context.', async () => {
//         const context = {
//             test: 42
//         };

//         const instance = await glue.appManager.application('coreSupport').start(context);

//         expect(instance.context).to.eql(context);
//     });

//     it.skip('Should start the application with the provided start options.', async () => {
//         const bounds = {
//             top: 200,
//             left: 300,
//             width: 400,
//             height: 500
//         };
//         const options = {
//             ...bounds
//         };

//         const instance = await glue.appManager.application('coreSupport').start({}, options);
//         const window = glue.windows.findById(instance.agm.windowId);

//         const windowBounds = await window.getBounds();

//         expect(windowBounds).to.eql(bounds);
//     });

//     it('Should assign different ids to two instances of the same application started at the same time.', async () => {
//         const app = glue.appManager.application('coreSupport');


//         expect(app.instances).to.be.of.length(0);

//         const [instanceA, instanceB] = await Promise.all([app.start(), app.start()]);

//         expect(app.instances).to.be.of.length(2);
//         expect(instanceA.id).to.not.be.equal(instanceB.id);
//     });
// });
