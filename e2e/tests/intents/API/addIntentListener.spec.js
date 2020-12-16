describe('addIntentListener()', () => {
    // An unsub function returned by `addIntentListener()`.
    let unsubObj;

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        if (typeof unsubObj !== "undefined") {
            const intentListenerRemovedPromise = gtf.intents.waitForIntentListenerRemoved(unsubObj.intent);
            unsubObj.unsubscribe();
            await intentListenerRemovedPromise;
            unsubObj = undefined;
        }
    });

    it('Should throw an error when intent isn\'t of type string or type object.', (done) => {
        try {
            glue.intents.addIntentListener(42, () => { });

            done('addIntentListener() should have thrown an error because intent wasn\'t of type string or object!');
        } catch (error) {
            expect(error.message).to.equal('expected a value matching one of the decoders, got the errors ["at error: expected a string, got a number", "at error: expected an object, got a number"]');

            done();
        }
    });

    it('Should throw an error when intent.intent isn\'t of type string.', (done) => {
        try {
            glue.intents.addIntentListener({ intent: 42 }, () => { });

            done('addIntentListener() should have thrown an error because intent.intent wasn\'t of type string or object!');
        } catch (error) {
            expect(error.message).to.equal('expected a value matching one of the decoders, got the errors ["at error: expected a string, got an object", "at error.intent: expected a string, got a number"]');

            done();
        }
    });

    it('Should throw an error when handler isn\'t of type function.', (done) => {
        try {
            glue.intents.addIntentListener('our-intent', 42);

            done('addIntentListener() should have thrown an error because handler wasn\'t of type function!');
        } catch (error) {
            expect(error.message).to.equal('Cannot add intent listener, because the provided handler is not a function!');

            done();
        }
    });

    it('Should invoke the handler when the intent is raised.', (done) => {
        const intentName = 'our-intent';
        const raiseContext = {
            data: {
                a: 42
            },
            type: 'test-context'
        };
        unsubObj = glue.intents.addIntentListener(intentName, (context) => {
            try {
                expect(context).to.eql(raiseContext);

                done();
            } catch (error) {
                done(error);
            }
        });
        unsubObj.intent = intentName;

        glue.intents.raise({
            intent: intentName,
            context: raiseContext
        });
    });

    it('Should return a working unsubscribe function.', (done) => {
        const intentName = 'test-intent';

        const unsub = glue.intents.addIntentListener(intentName, () => { });
        unsub.unsubscribe();

        glue.intents.raise(intentName)
            .then(() => done(`raise() should have thrown an error because an intent with name ${intentName} shouldn't be present!`))
            .catch((error) => {
                try {
                    expect(error.message).to.equal(`Internal Platform Communication Error. Attempted operation: "raiseIntent" with data: {"intent":"${intentName}"}.  -> Inner message: The platform rejected operation raiseIntent for domain: intents with reason: "Intent ${intentName} not found!"`);

                    done()
                } catch (error) {
                    done(error);
                }
            });
    });

    it('Should throw an error when called twice for the same intent.', (done) => {
        const intentName = 'test-intent';

        unsubObj = glue.intents.addIntentListener(intentName, () => { });
        unsubObj.intent = intentName;

        try {
            glue.intents.addIntentListener(intentName, () => { });

            done(`addIntentListener() should have thrown an error because a listener for intent with name ${intentName} is already present!`);
        } catch (error) {
            expect(error.message).to.equal(`Intent listener for intent ${intentName} already registered!`);

            done();
        }
    });

    it('Should not throw an error when called twice for the same intent after unregistering the first one.', async () => {
        const intentName = 'test-intent';

        const intentListenerRemovedPromise = gtf.intents.waitForIntentListenerRemoved(intentName);

        const unsub = glue.intents.addIntentListener(intentName, () => { });
        unsub.unsubscribe();

        await intentListenerRemovedPromise;

        unsubObj = glue.intents.addIntentListener(intentName, () => { });
        unsubObj.intent = intentName;
    });
});
