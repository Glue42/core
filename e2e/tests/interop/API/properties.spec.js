describe('properties', () => {
    before(() => {
        return coreReady;
    });

    describe('instance', () => {
        it('AGM should exist when glue is initialized', () => {
            expect(glue.agm).to.not.be.undefined;
        });

        it('AGM should should contain all properties defined in the API', () => {
            const {
                agm
            } = glue;
            expect(agm.instance).to.not.be.undefined;
            expect(typeof agm.createStream).to.eql('function');
            expect(typeof agm.invoke).to.eql('function');
            expect(typeof agm.methodAdded).to.eql('function');
            expect(typeof agm.methodRemoved).to.eql('function');
            expect(typeof agm.methods).to.eql('function');
            expect(typeof agm.methodsForInstance).to.eql('function');
            expect(typeof agm.register).to.eql('function');
            expect(typeof agm.registerAsync).to.eql('function');
            expect(typeof agm.serverAdded).to.eql('function');
            expect(typeof agm.serverMethodAdded).to.eql('function');
            expect(typeof agm.serverMethodRemoved).to.eql('function');
            expect(typeof agm.serverRemoved).to.eql('function');
            expect(typeof agm.servers).to.eql('function');
            expect(typeof agm.subscribe).to.eql('function');
            expect(typeof agm.unregister).to.eql('function');
        });

        it('AGM instance should contain all properties with default value defined in the API', () => {
            const {
                instance
            } = glue.agm;

            expect(typeof instance.application).to.eql('string');
            expect(typeof instance.machine).to.eql('string');
            expect(typeof instance.pid).to.eql('number');
            expect(typeof instance.user).to.eql('string');
            expect(instance.windowId).to.not.be.undefined;
            expect(typeof instance.getMethods).to.eql('function');
            expect(typeof instance.getStreams).to.eql('function');
            // In Glue42 Core the environment is null and not a string!
            expect(instance.environment, "environment").to.be.null;
            // In Glue42 Core the environment is null and not a string!
            expect(instance.region, "region").to.be.null;
            // In Glue42 Core the service is undefined!
            expect(instance.service, "service").to.be.undefined;
            expect(typeof instance.peerId, "peerId").to.eql("string");
            expect(typeof instance.isLocal, "isLocal").to.eql("boolean");
            expect(typeof instance.instance, "instance").to.eql("string");
            expect(typeof instance.api, "api").to.eql("string");
        });

        it('AGM instance should contain all properties defined in the API', () => {
            const {
                instance
            } = glue.agm;

            expect(typeof instance.application).to.eql('string');
            expect(typeof instance.machine).to.eql('string');
            expect(typeof instance.pid).to.eql('number');
            expect(typeof instance.user).to.eql('string');
            expect(instance.windowId).to.not.be.undefined;
            expect(typeof instance.getMethods).to.eql('function');
            expect(typeof instance.getStreams).to.eql('function');
        });


        it('Should contain an application property that includes RUNNER.', (done) => {
            expect(glue.interop.instance.application.includes(RUNNER)).to.be.true;
            done();
        });
    });
});
