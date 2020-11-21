/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from "@angular/core/testing";
import { Glue42Initializer } from "../glue-initializer.service";
import { Subject, Observable, Subscription } from "rxjs";
import { Glue42NgConfig, Glue42NgFactory, Glue42NgSettings } from "../types";
import { GlueConfigService } from "../glue-config.service";

describe("Glue42Initializer ", () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let glueInstanceMock: any;
    let service: Glue42Initializer;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let factorySpy: jasmine.Spy<Glue42NgFactory>;

    let configMock: Glue42NgConfig = {};

    let settingsMock: Glue42NgSettings = {};

    let configSpy: jasmine.SpyObj<GlueConfigService>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const waitFor = (callCount: number, done: DoneFn) => {
        return (): void => {
            --callCount;
            if (!callCount) {
                done();
            }
        };
    };

    beforeEach(() => {
        glueInstanceMock = { test: 42 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).GlueWeb = undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Glue = undefined;

        factorySpy = jasmine
            .createSpy().and
            .resolveTo(glueInstanceMock);

        configMock = {};

        settingsMock = {
            config: configMock,
            factory: factorySpy
        };

        configSpy = jasmine.createSpyObj<GlueConfigService>("GlueConfigService", ["getSettings"]);

        configSpy.getSettings.and.returnValue(settingsMock);

        TestBed.configureTestingModule({
            providers: [
                Glue42Initializer,
                {
                    provide: GlueConfigService,
                    useValue: configSpy
                }
            ]
        });
        service = TestBed.inject(Glue42Initializer);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    it("should be created with default timeout of 3000 milliseconds", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((service as any).defaultInitTimeoutMilliseconds).toEqual(3000);
    });

    it("should be creates with a subject observable", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((service as any).initializationSource).toBeInstanceOf(Subject);
    });

    describe("onState() ", () => {
        let subscription: Subscription;

        afterEach(() => {
            if (subscription) {
                subscription.unsubscribe();
                subscription = null;
            }
        });

        it("should show exist and return an observable", () => {
            expect(service.onState).toBeTruthy();
            const functionResult = service.onState();
            expect(functionResult).toBeInstanceOf(Observable);
        });

        it("should not emit when start was never called", (done: DoneFn) => {
            const timeout: NodeJS.Timeout = setTimeout(() => {
                expect().nothing();
                done();
            }, 3000);

            service
                .onState()
                .subscribe(() => {
                    clearTimeout(timeout);
                    done.fail("Something was emitted even though start was never called");
                });
        });

        it("should emit an error when start was called and there is no factory", (done: DoneFn) => {
            settingsMock.factory = undefined;
            service
                .onState()
                .subscribe((data) => {
                    try {
                        expect(data.glueInstance).toBeFalsy();
                        expect(data.error).toBeTruthy();
                        done();
                    } catch (error) {
                        done.fail(error);
                    }
                });

            service.start().catch(() => { });
        });

        it("should emit an error when start was called, but the factory call threw", (done: DoneFn) => {
            factorySpy.and.rejectWith("Factory threw");

            service
                .onState()
                .subscribe((data) => {
                    try {
                        expect(data.glueInstance).toBeFalsy();
                        expect(data.error).toBeTruthy();
                        done();
                    } catch (error) {
                        done.fail(error);
                    }
                });

            service.start().catch(() => { });
        });

        it("should emit an error when start was called, but the factory timed out", (done: DoneFn) => {
            factorySpy.and.returnValue(new Promise(() => {
                // never resolve
            }));

            service
                .onState()
                .subscribe((data) => {
                    try {
                        expect(data.glueInstance).toBeFalsy();
                        expect(data.error).toBeTruthy();
                        done();
                    } catch (error) {
                        done.fail(error);
                    }
                });

            service.start().catch(() => { });
        });

        it("should not emit an error object when start was called and the factory resolved", (done: DoneFn) => {
            service
                .onState()
                .subscribe((data) => {
                    try {
                        expect(data.glueInstance).toBeTruthy();
                        expect(data.error).toBeFalsy();
                        done();
                    } catch (error) {
                        done.fail(error);
                    }
                });

            service.start().catch(() => { });
        });

        it("should emit the object returned by the factory when start was called and the factory resolved", (done: DoneFn) => {
            service
                .onState()
                .subscribe((data) => {
                    try {
                        expect(data.error).toBeFalsy();
                        expect(data.glueInstance as unknown).toEqual({ test: 42 });
                        done();
                    } catch (error) {
                        done.fail(error);
                    }
                });

            service.start().catch(() => { });
        });
    });

    describe("start() ", () => {

        let subscription: Subscription;

        afterEach(() => {
            if (subscription) {
                subscription.unsubscribe();
                subscription = null;
            }
        });

        it("should exist and return a promise", async () => {
            expect(service.onState).toBeTruthy();
            const functionResult = service.start();
            expect(functionResult).toBeInstanceOf(Promise);

            await functionResult;
        });

        it("should resolve when config was not provided, but there is a factory function", async () => {
            settingsMock.config = undefined;
            await service.start();
            expect().nothing();
        });

        it("should resolve and emit the value returned from the factory as glueInstance", (done: DoneFn) => {

            const ready = waitFor(2, done);

            service.onState().subscribe((result) => {
                try {
                    expect(result.glueInstance as unknown).toEqual({ test: 42 });
                    ready();
                } catch (error) {
                    done.fail(error);
                }
            });

            service.start().then(ready).catch(done.fail);
        });

        it("should use the provided factory function when it is provided but there is also a window factory", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).GlueWeb = jasmine
                .createSpy().and
                .resolveTo({ test: 24 });

            await service.start();

            expect(factorySpy).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((window as any).GlueWeb).toHaveBeenCalledTimes(0);
        });

        it("should use the window factory function when no factory function was provided", async () => {
            settingsMock.factory = undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).GlueWeb = jasmine
                .createSpy().and
                .resolveTo({ test: 24 });
            await service.start();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((window as any).GlueWeb).toHaveBeenCalled();
        });

        it("should call the factory function with the provided config", async () => {

            await service.start();

            expect(factorySpy).toHaveBeenCalledWith(configMock);
        });

        it("should resolve, but emit an error when no factory was provided and the window object does not have a factory", (done: DoneFn) => {
            const ready = waitFor(2, done);
            settingsMock.factory = undefined;

            subscription = service.onState().subscribe((result) => {

                try {
                    expect(result.error).toBeTruthy();
                    expect(result.glueInstance).toBeFalsy();
                    ready();
                } catch (error) {
                    done.fail(error);
                }

            });

            service.start().then(ready).catch(done.fail);
        });

        it("should resolve, but emit an error when the factory function threw", (done: DoneFn) => {
            const ready = waitFor(2, done);

            factorySpy.and.rejectWith("Factory threw");

            service
                .onState()
                .subscribe((data) => {
                    try {
                        expect(data.glueInstance).toBeFalsy();
                        expect(data.error).toBeTruthy();
                        ready();
                    } catch (error) {
                        done.fail(error);
                    }
                });

            service.start().then(ready).catch(done.fail);
        });

        it("should resolve, but emit an error when the factory function timed out", (done: DoneFn) => {
            const ready = waitFor(2, done);

            factorySpy.and.returnValue(new Promise(() => {
                // never resolve
            }));

            service
                .onState()
                .subscribe((data) => {
                    try {
                        expect(data.glueInstance).toBeFalsy();
                        expect(data.error).toBeTruthy();
                        ready();
                    } catch (error) {
                        done.fail(error);
                    }
                });

            service.start().then(ready).catch(done.fail);
        });

        it("should resolve without waiting for the factory when holdInit is false", (done: DoneFn) => {
            const ready = waitFor(2, done);

            let factoryResolve = false;

            settingsMock.holdInit = false;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            settingsMock.factory = (): Promise<any> => {
                return new Promise((resolve) => {
                    setImmediate(() => {
                        factoryResolve = true;
                        resolve();
                        ready();
                    });
                });
            };

            const startPromise = service.start();

            startPromise
                .then(() => {
                    expect(factoryResolve).toBeFalse();
                    ready();
                })
                .catch(() => {
                    done.fail("The factory resolved before the start, with holdInit: false");
                });
        });

        it("should wait for the factory to resolve when holdInit is true", (done: DoneFn) => {
            const ready = waitFor(2, done);

            let factoryResolve = false;

            settingsMock.holdInit = true;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            settingsMock.factory = (): Promise<any> => {
                return new Promise((resolve) => {
                    setImmediate(() => {
                        factoryResolve = true;
                        resolve();
                        ready();
                    });
                });
            };

            const startPromise = service.start();

            startPromise
                .then(() => {
                    expect(factoryResolve).toBeTrue();
                    ready();
                })
                .catch(() => {
                    done.fail("The factory resolved after the start, with holdInit: true");
                });
        });
    });

});
