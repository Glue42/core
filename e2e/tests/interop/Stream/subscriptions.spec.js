describe('subscriptions()', () => {
    let myStreams = [];
    const callbackNeverCalled = () => { };

    before(() => {
        return coreReady;
    });

    afterEach(async () => {
        await Promise.all([gtf.agm.unregisterMyStreams(myStreams), gtf.agm.unregisterAllMyNonSystemMethods()]);

        myStreams = [];
    });

    describe('Streaming client subscription: ', () => {
        let methodDefinition;
        let subDefinition;
        let glueApplication;
        let stream;

        beforeEach(() => gtf.createApp()
            .then((app) => {
                glueApplication = app;
            })
            .then(() => {
                methodDefinition = {
                    name: gtf.agm.getMethodName()
                };
                subDefinition = {
                    name: methodDefinition.name
                };

                return glueApplication.agm.createStream(methodDefinition);
            }).then((str) => {
                stream = str;
            }));

        afterEach(async () => {
            await glueApplication.stop();

            glueApplication = null;
        });

        it('A subscription should resolve when subscribing immediately after createStream resolves', (done) => {
            const subscriptionOptions = {
                target: 'best',
                arguments: {
                    reject: false
                }
            };

            glue.interop.subscribe(subDefinition, subscriptionOptions)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscription should fail if the request is rejected by the server when target is "best"', (done) => {
            const subscriptionOptions = {
                target: 'best',
                arguments: {
                    reject: true
                }
            };

            glue.interop.subscribe(subDefinition, subscriptionOptions)
                .then(() => {
                    done('Should not resolve');
                })
                .catch(() => {
                    done();
                });
        });

        it('A subscription should fail if the request is rejected by the server when target is "all"', (done) => {
            const subscriptionOptions = {
                target: 'all',
                arguments: {
                    reject: true
                }
            };

            glue.interop.subscribe(subDefinition, subscriptionOptions)
                .then(() => {
                    done('should not be in then');
                })
                .catch(() => {
                    done();
                });
        });

        it('A subscription should fail if the request is rejected by the server when target is specific instance', (done) => {
            const subscriptionOptions = {
                target: glueApplication.agm.instance,
                arguments: {
                    reject: true
                }
            };

            glue.interop.subscribe(subDefinition, subscriptionOptions)
                .then(() => {
                    done('should not be in then');
                })
                .catch(() => {
                    done();
                });
        });

        it('A subscription should succeed if the request is accepted by the server', (done) => {
            const subscriptionOptions = {
                target: glueApplication.agm.instance,
                arguments: {
                    reject: false
                }
            };

            glue.interop.subscribe(subDefinition, subscriptionOptions)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscription should fail if the stream does not exist', (done) => {
            const subscriptionOptions = {
                waitTimeoutMs: 500
            };

            glue.interop.subscribe('not-existing', subscriptionOptions)
                .then(() => {
                    done('Should not be resolved!');
                })
                .catch(() => {
                    done();
                });
        });

        it('A subscription should have all properties defined in the API', (done) => {
            const subscriptionOptions = {
                target: glueApplication.agm.instance,
                arguments: {
                    reject: false
                }
            };

            glue.interop.subscribe(subDefinition, subscriptionOptions)
                .then((sub) => {
                    expect(sub.stream).to.not.be.undefined;
                    expect(sub.serverInstance).to.not.be.undefined;
                    expect(sub.requestArguments).to.not.be.undefined;
                    expect(sub.onClosed).to.not.be.undefined;
                    expect(sub.onFailed).to.not.be.undefined;
                    expect(sub.onData).to.not.be.undefined;
                    expect(sub.close).to.not.be.undefined;
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscriber should receive private data', (done) => {
            const privateData = {
                test: 42
            };

            const streamOptions = {
                target: glueApplication.agm.instance,
                arguments: {
                    privateData
                }
            };

            glue.interop.subscribe(subDefinition, streamOptions)
                .then((sub) => {
                    sub.onData((streamData) => {
                        if (streamData.data.private) {
                            expect(streamData.data.private).to.eql(privateData);
                            done();
                        }
                    });
                });
        });

        it('A subscriber should receive public data', (done) => {
            const publicData = {
                asd: 27
            };

            const streamOptions = {
                target: glueApplication.agm.instance,
                arguments: {
                    publicData
                }
            };

            glue.interop.subscribe(subDefinition, streamOptions)
                .then((sub) => {
                    sub.onData((streamData) => {
                        if (streamData.data.public) {
                            expect(streamData.data.public).to.eql(publicData);
                            done();
                        }
                    });
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscriber\'s onData streamData should have all properties defined in the API', (done) => {
            const privateData = {
                test: 44
            };

            const streamOptions = {
                target: glueApplication.agm.instance,
                arguments: {
                    privateData
                }
            };

            glue.interop.subscribe(subDefinition, streamOptions)
                .then((sub) => {
                    sub.onData((streamData) => {
                        try {
                            expect(streamData.data.private).to.eql(privateData);
                            expect(streamData.private).to.be.true;
                            expect(streamData.requestArguments).to.not.be.undefined;
                            expect(streamData.server).to.not.be.undefined;
                            done();
                        } catch (error) {
                            done(error);
                        }
                    });

                    stream.push({ private: privateData });
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscriber should receive close notification when the stream is closed server-side', (done) => {
            glue.interop.subscribe(subDefinition)
                .then((sub) => {
                    sub.onClosed(() => {
                        done();
                    });

                    stream.close();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscriber should receive close notification when the stream is closed server-side with correct reason, when the stream is closed', (done) => {
            glue.interop.subscribe(subDefinition)
                .then((sub) => {
                    sub.onClosed((reason) => {
                        try {
                            expect(reason).to.not.be.undefined;
                            expect(typeof reason.message).to.eql('string');
                            expect(typeof reason.stream).to.eql('object');

                            done();
                        } catch (error) {
                            done(error);
                        }
                    });

                    stream.close();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscriber\'s onClosed reason object should contain correct server and stream data', (done) => {
            glue.interop.subscribe(subDefinition)
                .then((sub) => {
                    sub.onClosed((reason) => {
                        try {
                            expect(reason).to.not.be.undefined;
                            expect(reason.server).to.not.be.undefined;
                            expect(reason.stream).to.not.be.undefined;
                            expect(reason.server.application).to.eql(glueApplication.agm.instance.application);

                            done();
                        } catch (error) {
                            done(error);
                        }
                    });

                    stream.close();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscriber should receive close notification when the stream is closed server-side with correct reason object, when the stream closes this subscription', (done) => {
            const streamOptionsCloseMe = {
                arguments: {
                    closeMe: true,
                    closeMeAfter: 1000
                }
            };

            glue.interop.subscribe(subDefinition, streamOptionsCloseMe)
                .then((sub) => {
                    sub.onClosed((reason) => {
                        try {
                            expect(reason).to.not.be.undefined;
                            expect(typeof reason.message).to.eql('string');
                            done();
                        } catch (error) {
                            done(error);
                        }
                    });
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('A subscriber should receive close notification when the stream is closed client-side with correct reason object', (done) => {
            glue.interop.subscribe(methodDefinition)
                .then((sub) => {
                    sub.onClosed((reason) => {
                        try {
                            expect(reason).to.not.be.undefined;
                            expect(typeof reason.message).to.eql('string');
                            expect(typeof reason.server).to.eql('object');
                            expect(typeof reason.stream).to.eql('object');
                            expect(reason.server.application).to.eql(glueApplication.agm.instance.application);

                            done();
                        } catch (error) {
                            done(error);
                        }
                    });
                    sub.close();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('Streaming server subscribers: ', () => {
        let methodDefinition;
        let glueApplicationOne;
        let glueApplicationTwo;
        let currentRequest;
        let subDefinition;
        let subsCount = 0;
        let onEnoughSubsCallbacks = [];
        let onAddedLogic;
        let str;

        const onSubscriptionRequest = (request) => {
            currentRequest = request;
            request.accept();
        };

        beforeEach(async () => {
            methodDefinition = {
                name: gtf.agm.getMethodName()
            };
            subsCount = 0;
            onEnoughSubsCallbacks = [];
            onAddedLogic = null;

            [glueApplicationOne, glueApplicationTwo] = await Promise.all([gtf.createApp(), gtf.createApp()]);

            subDefinition = { ...methodDefinition };

            const stream = await glue.interop.createStream(subDefinition,
                {
                    subscriptionRequestHandler: onSubscriptionRequest,
                    subscriptionAddedHandler: () => {
                        ++subsCount;
                        if (onEnoughSubsCallbacks.length && subsCount == 2) {
                            onEnoughSubsCallbacks.forEach(cb => cb());
                        }

                        if (onAddedLogic) {
                            onAddedLogic();
                        }
                    }
                });
            myStreams.push(stream);
            str = stream;
        });

        afterEach(async () => {
            await Promise.all([glueApplicationOne.stop(), glueApplicationTwo.stop()]);
            glueApplicationOne = null;
            glueApplicationTwo = null;
        });

        it('Only a specific subscription should receive data when the server pushes to that subscriber', (done) => {
            const ready = gtf.waitFor(2, done);

            const streamOptionsReceiveData = {
                arguments: {
                    receive: true
                }
            };

            const streamOptionsDoNotReceiveData = {
                arguments: {
                    receive: false
                }
            };

            const receiveArgs = {
                test: 42
            };

            const noReceiveArgs = {
                test: 24
            };

            const validateData = (args) => {
                if (args.requestArguments.receive === true) {
                    expect(args.data).to.eql(receiveArgs);
                    ready();
                }

                if (args.requestArguments.receive === false) {
                    expect(args.data).to.eql(noReceiveArgs);
                    ready();
                }
            };

            const execPushLogic = () => {
                str.subscriptions().forEach((sub) => {
                    if (sub.arguments.receive) {
                        sub.push(receiveArgs);
                    }

                    if (!sub.arguments.receive) {
                        sub.push(noReceiveArgs);
                    }
                });
            };

            Promise.all([
                glueApplicationOne.agm.subscribe(subDefinition, streamOptionsReceiveData),
                glueApplicationTwo.agm.subscribe(subDefinition, streamOptionsDoNotReceiveData)
            ]).then((subs) => {
                subs.forEach(s => s.onData(validateData));

                if (subsCount == 2) {
                    execPushLogic();
                } else {
                    onEnoughSubsCallbacks.push(execPushLogic);
                }
            });
        });

        it('The subscription object should have all properties defined in the API', (done) => {
            const streamOptions = {
                arguments: {
                    branch: 'myBranch'
                }
            };

            onAddedLogic = () => {
                try {
                    const subscription = str.subscriptions()[0];

                    expect(subscription.arguments).to.not.be.undefined;
                    expect(subscription.branchKey).to.not.be.undefined;
                    expect(typeof subscription.close).to.eql('function');
                    expect(subscription.instance).to.not.be.undefined;
                    expect(typeof subscription.push).to.eql('function');
                    expect(subscription.stream).to.not.be.undefined;

                    done();
                } catch (error) {
                    done(error);
                }
            };

            glueApplicationOne.agm.subscribe(subDefinition, streamOptions).catch(done);
        });

        it('The request object should have all properties defined in the API', (done) => {
            currentRequest = null;
            const streamOptions = {
                arguments: {
                    branch: 'myBranch'
                }
            };

            glueApplicationOne.agm.subscribe(subDefinition, streamOptions)
                .then(() => {
                    expect(currentRequest.instance).to.not.be.undefined;
                    expect(currentRequest.arguments).to.not.be.undefined;
                    expect(typeof currentRequest.reject).to.eql('function');
                    expect(typeof currentRequest.accept).to.eql('function');
                    expect(typeof currentRequest.acceptOnBranch).to.eql('function');

                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('Complex AGM objects: ', () => {
        let methodDefinition;

        const dataStore = [
            {
                value: null
            }, {},
            {
                a: 1,
                b: '2asd',
                c: Date(),
                d: true
            },
            {
                value: {
                    inner: null
                }
            },
            {
                value: {
                    inner1: null
                }
            },
            {
                value: 1
            },
            {
                value: {
                    inner: 1
                }
            },
            {
                value: 'test'
            },
            {
                value: '2003-01-05T21:32:44.945Z'
            },
            {
                strValue: 'test',
                emptyValue: {}
            },
            {
                strValue: 'test',
                notEmptyValue: {
                    test: 'test'
                }
            },
            {
                test: {
                    nullValue: null,
                    notEmptyValue: {
                        test: ''
                    },
                    intValue: -1,
                    strValue: 'test',
                    dateValue: '2003-01-05T21:32:44.945Z',
                    boolValue: true
                }
            },
            {
                nested1: {
                    nested2: {
                        nested3: {
                            nested4: {
                                nested5: {
                                    number: 11,
                                    nested6: {
                                        nested7: {
                                            intValue: -1
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                arr: []
            },
            {
                arr: ['test1', 'test2', 'test3']
            },
            {
                a: [
                    ['array-item-1'],
                    ['array-item-1', 'array-item-2']
                ]
            },
            {
                arr: [null, null, null]
            },
            {
                arr: [
                    [null],
                    [
                        []
                    ],
                    [
                        [1, 2, 3]
                    ]
                ]
            },
            {
                arr: [{
                    strValue: 'test'
                }, {}, {
                    intValue: 1,
                    dateValue: new Date()
                }, {
                    value: null
                }]
            },
            {
                arr: [
                    [1, 2, 3],
                    [1, '2', 3],
                    [],
                    [true, false],
                    [
                        [1, 2],
                        [3, 4]
                    ]
                ]
            },
            {
                arr: [-1, 10.22, 10.111111111111, 'test', true, false, '2003-01-05T21:32:44.945Z', null, {}, {
                    test: null
                }, {
                    test: 'test'
                }, [], [[]], [{}, []]]
            },
            {
                snapshot: [{
                    symbol: 'AAPL',
                    price: 119.948,
                    sequence: 535
                }, {
                    symbol: 'MSFT',
                    price: 45.745,
                    sequence: 536
                }, {
                    symbol: 'GOOG',
                    price: 68.98,
                    sequence: 537
                }, {
                    symbol: 'FB',
                    price: 537.362,
                    sequence: 538
                }, {
                    symbol: 'YHOO',
                    price: 49.387,
                    sequence: 539
                }],
                lastUpdateSeq: 540
            },
            {
                test: [{
                    id: '3bc6d7a5-81e0-403c-bb14-002f582fbb42',
                    sequenceId: null,
                    type: 'Execution',
                    source: 'OMS',
                    sourceNotificationId: 'OMS_cihqc7sxh0000s8ipuu4ozc6t',
                    title: 'Darketofzocmetruvtufultumhubenagaf.',
                    notificationTime: '2041-09-05T01:13:14.820Z',
                    creationTime: '2015-12-03T14:28:13.496Z',
                    severity: 'Info',
                    description: 'Mofmihnicawbuzsauvacihvomutvatvungukib.',
                    state: 'Acknowledged',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'ne',
                        value: {
                            stringValue: 'vugahu'
                        }
                    }, {
                        key: 'mumtuvfih',
                        value: {
                            stringValue: 'hojigi'
                        }
                    }],
                    target: {
                        groups: ['Ontario']
                    },
                    reminder: {
                        remindPeriod: 120
                    }
                }, {
                    id: '054ce16b-d759-4016-91f4-6e5fa6dd5a1b',
                    sequenceId: null,
                    type: 'Alert',
                    source: 'GNS',
                    sourceNotificationId: 'GNS_cihqbupsc00009cipgq2txnro',
                    title: 'Belzolicbukgagadativzi.',
                    notificationTime: '2027-08-20T05:41:56.728Z',
                    creationTime: '2015-12-03T14:18:02.894Z',
                    severity: 'Warn',
                    description: 'Vucjabimberfehegatuperbeurtiveliucidoz.',
                    state: 'Closed',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'te',
                        value: {
                            stringValue: 'buga'
                        }
                    }, {
                        key: 'vume',
                        value: {
                            stringValue: 'elmi'
                        }
                    }],
                    lifetime: {
                        expiresAt: '2071-01-20T07:13:32.835Z'
                    },
                    target: {
                        users: ['HowardGriffin', 'FannieMassey']
                    }
                }, {
                    id: '002e26bb-96fa-4cfc-b841-649693e7583c',
                    sequenceId: null,
                    type: 'Workflow',
                    source: 'UNIXTimestamp',
                    sourceNotificationId: 'BPMEngine_cihpzicf800006wip5iei10lq',
                    title: 'Gisizjolawzobzasnufu.',
                    notificationTime: '2084-11-10T03:09:15.631Z',
                    creationTime: '2015-02-07T14:10:38.2275004+02:00',
                    severity: 'Warn',
                    description: 'Kupgezvedgepobjapadazusabakefenudofdamitkobajsajbertateeljo.',
                    state: 'Active',
                    isRead: false,
                    revision: 0,
                    lifetime: {
                        expiresIn: 53990
                    }
                }, {
                    id: '2e9d9954-8fb9-4e67-91e4-2a9ae59d6ad6',
                    sequenceId: null,
                    type: 'Execution',
                    source: 'OMS',
                    sourceNotificationId: 'OMS_cihqcrrr000011cipa4a853ld',
                    title: 'Gitvabkeezjemipevfekkekwumoibrilochumahoav.',
                    notificationTime: '2050-10-15T08:06:41.346Z',
                    creationTime: '2015-12-03T14:43:45.084Z',
                    severity: 'Warn',
                    description: 'Zoidekzagpujhuhupfuwtusecvobumunetargejafonnocbobetiklorzu.',
                    state: 'Acknowledged',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'woisiad',
                        value: {
                            stringValue: 'boshar'
                        }
                    }],
                    target: {
                        users: ['RichardChristensen'],
                        groups: ['Manitoba']
                    }
                }, {
                    id: '2d8befc7-237e-417e-9dba-6fa1cc3b5cda',
                    sequenceId: null,
                    type: 'Workflow',
                    source: 'BPMEngine',
                    sourceNotificationId: 'BPMEngine_cihqcnowm00001cip5m7tamvh',
                    title: 'Sabbezagtibvisebiogevukpuazfebumni.',
                    notificationTime: '2034-12-26T02:14:13.919Z',
                    creationTime: '2015-12-03T14:40:34.777Z',
                    severity: 'Info',
                    description: 'Cabibriisemomifodovpowduzakadmeddajsunijsedtuwepiofkuijvu.',
                    state: 'Active',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'vedda',
                        value: {
                            stringValue: 'nu'
                        }
                    }],
                    target: {
                        users: ['HuldaPowers', 'LeonManning']
                    },
                    reminder: {
                        remindPeriod: 180
                    }
                }, {
                    id: '8c590cd7-7fc5-41eb-9aa3-37e7922979a4',
                    sequenceId: null,
                    type: 'Alert',
                    source: 'Eikon',
                    sourceNotificationId: 'Eikon_cihqcfma0000074ip0849z2p7',
                    title: 'Paapezumtenotuhmeshoglenematuhdeihotogkezangapnicre.',
                    notificationTime: '2093-02-14T23:58:29.829Z',
                    creationTime: '2015-12-03T14:34:18.122Z',
                    severity: 'Error',
                    description: 'Todiagijodiitoehuahivezotogbebmedid.',
                    state: 'Acknowledged',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'rebbe',
                        value: {
                            stringValue: 'hewjasit'
                        }
                    }],
                    target: {
                        groups: ['Nunavut']
                    }
                }, {
                    id: '463b7116-5a02-478d-9ab8-4e593d3e6fda',
                    sequenceId: null,
                    type: 'Notice',
                    source: 'Operate',
                    sourceNotificationId: 'Operate_cihqc840y0002s8ipb07d6lcv',
                    title: 'Wiewdeljipruvatisgukegeef.',
                    notificationTime: '2031-06-21T04:51:40.645Z',
                    creationTime: '2015-12-03T14:28:27.874Z',
                    severity: 'Warn',
                    description: 'Pareipowezojafkezhombadilezfedmegoacozustadigesuphegobaj.',
                    state: 'Acknowledged',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'pekmig',
                        value: {
                            stringValue: 'segnifze'
                        }
                    }],
                    lifetime: {
                        expiresIn: 45437
                    },
                    target: {
                        users: ['MaggieStokes', 'LuluPorter'],
                        groups: ['NewBrunswick']
                    },
                    reminder: {
                        remindPeriod: 270
                    }
                }, {
                    id: 'f3ec5833-8420-442c-8e1b-3849d65965d2',
                    sequenceId: null,
                    type: 'Alert',
                    source: 'Outlook',
                    sourceNotificationId: 'Outlook_cihp2li2l0001gsip3lapxmv0',
                    title: 'Onuzagoutdeutasewitarumojiro.',
                    notificationTime: '2015-11-08T01:46:14.191Z',
                    creationTime: '2015-12-02T17:11:10.270Z',
                    severity: 'Info',
                    description: 'Togkekupofutrobigampugahbusbeokiarijefitadgukref.',
                    state: 'Active',
                    isRead: false,
                    revision: 0,
                    attributes: [{
                        key: 'wukukvew',
                        value: {
                            stringValue: 'hulvewdu'
                        }
                    }, {
                        key: 'mahogag',
                        value: {
                            stringValue: 'ni'
                        }
                    }],
                    target: {
                        users: ['JacksonOwens', 'EmilyLeonard'],
                        groups: ['Manitoba']
                    }
                }]
            }
        ];

        const dataLen = dataStore.length;

        beforeEach(() => {
            methodDefinition = {
                name: gtf.agm.getMethodName()
            };
        });

        describe('Sync methods, registered by others should preserve data: ', () => {
            let glueApplication;

            beforeEach(() => gtf.createApp()
                .then((app) => {
                    glueApplication = app;

                    return glueApplication.agm.register(methodDefinition, callbackNeverCalled);
                }));

            afterEach(async () => {
                await glueApplication.stop();

                glueApplication = null;
            });

            for (let i = 0; i < dataLen; i++) {
                it(`Methods complex data store test number ${i}`, (done) => {
                    glue.interop.invoke(methodDefinition, dataStore[i])
                        .then((args) => {
                            const returnValue = args.returned;
                            expect(returnValue).to.eql(dataStore[i]);
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        });
                });
            }
        });

        describe('Async methods, registered by others should preserve data: ', () => {
            let glueApplication;
            let currentCallbackArgs;

            beforeEach(() => gtf.createApp()
                .then((app) => {
                    glueApplication = app;

                    methodDefinition.name = gtf.agm.getMethodName();

                    return glueApplication.agm.registerAsync(methodDefinition, (args, __, success) => {
                        currentCallbackArgs = args;
                        success();
                    });
                }));

            afterEach(async () => {
                await glueApplication.stop();

                glueApplication = null;
            });

            for (let i = 0; i < dataLen; i++) {
                it(`Methods complex data store test number ${i}`, (done) => {
                    glue.interop.invoke(methodDefinition, dataStore[i])
                        .then(() => {
                            expect(currentCallbackArgs).to.eql(dataStore[i]);
                            done();
                        })
                        .catch((err) => {
                            done(err);
                        });
                });
            }
        });

        describe('Streams should preserve data: ', () => {
            let glueApplication;
            let checkData;
            let stream;
            let subDefinition;

            beforeEach(() => gtf.createApp()
                .then((app) => {
                    glueApplication = app;
                    subDefinition = { ...methodDefinition };
                    return glueApplication.agm.createStream(subDefinition);
                })
                .then((str) => {
                    stream = str;
                    return glue.interop.subscribe(subDefinition);
                })
                .then((sub) => {
                    sub.onData((streamData) => {
                        checkData(streamData.data);
                    });
                })
            );

            afterEach(async () => {
                await glueApplication.stop();

                glueApplication = null;
            });

            for (let i = 0; i < dataLen; i++) {
                it(`Streams complex data store test number ${i}`, (done) => {
                    checkData = (data) => {
                        expect(data).to.eql(dataStore[i]);
                        done();
                    };

                    stream.push(dataStore[i]);
                });
            }
        });
    });

    describe('subscriptions()', () => {
        it('Should return all active subscriptions to the stream.', (done) => {
            const name = gtf.agm.getMethodName();
            const methodDefinition = {
                name,
            };
            let str;

            const subscriptionRequestHandler = (request) => {
                request.accept();
            };

            let subsCount = 0;

            glue.interop.createStream(methodDefinition, {
                subscriptionRequestHandler,
                subscriptionAddedHandler: () => {
                    ++subsCount;
                    if (subsCount === 3) {
                        try {
                            expect(str.subscriptions().length).to.eql(3);
                            done();
                        } catch (err) {
                            done(err);
                        }
                    }
                }
            }).then((stream) => {
                str = stream;
                myStreams.push(stream);
                const promiseSub1 = glue.interop.subscribe(methodDefinition);
                const promiseSub2 = glue.interop.subscribe(methodDefinition);
                const promiseSub3 = glue.interop.subscribe(methodDefinition);

                Promise.all([promiseSub1, promiseSub2, promiseSub3]).catch(done);
            });
        });
    });
});
