describe('properties', () => {
    let myStreams = [];

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await gtf.agm.unregisterMyStreams(myStreams);

        myStreams = [];
    });

    describe('definition', () => {
        it('Should contain the correct MethodDefinition of the stream.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name,
                description: 'Random description.',
                displayName: 'Best',
                objectTypes: ['hello', 'world']
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);
                try {
                    expect(stream.definition.name).to.eql(name);
                    expect(stream.definition.description).to.eql('Random description.');
                    expect(stream.definition.displayName).to.eql('Best');
                    expect(stream.definition.objectTypes).to.eql(['hello', 'world']);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });

    describe('name', () => {
        it('Should contain the name of the stream.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name
            };

            glue.interop.createStream(methodDefinition).then((stream) => {
                myStreams.push(stream);
                try {
                    expect(stream.name).to.eql(name);
                    done();
                } catch (err) {
                    done(err);
                }
            });
        });
    });
});
