/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from "@angular/core/testing";
import { Glue42Initializer } from "../glue-initializer.service";
import { Subject, Observable, Subscription } from "rxjs";
import { Glue42NgConfig, Glue42NgFactory } from "../types";

describe("Glue42Initializer ", () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let glueInstanceMock: any;
    let service: Glue42Initializer;
    let configMock: Glue42NgConfig;
    let factorySpy: jasmine.Spy<Glue42NgFactory>;

    const waitFor = (callCount: number, done: DoneFn) => {
        return (): void => {
            --callCount;
            if (!callCount) {
                done();
            }
        };
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [Glue42Initializer] });
        service = TestBed.inject(Glue42Initializer);

        configMock = { extends: false };
        glueInstanceMock = { test: 42 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).GlueWeb = undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Glue = undefined;

        factorySpy = jasmine
            .createSpy().and
            .resolveTo(glueInstanceMock);
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

            service.start(configMock, undefined).catch(() => { });
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

            service.start(configMock, factorySpy).catch(() => { });
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

            service.start(configMock, factorySpy).catch(() => { });
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

            service.start(configMock, factorySpy).catch(() => { });
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

            service.start(configMock, factorySpy).catch(() => { });
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
            const functionResult = service.start(configMock, factorySpy);
            expect(functionResult).toBeInstanceOf(Promise);

            await functionResult;
        });

        it("should resolve when config was not provided, but there is a factory function", async () => {
            await service.start(undefined, factorySpy);
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

            service.start(configMock, factorySpy).then(ready).catch(done.fail);
        });

        it("should use the provided factory function when it is provided but there is also a window factory", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).GlueWeb = jasmine
                .createSpy().and
                .resolveTo({ test: 24 });

            await service.start(configMock, factorySpy);

            expect(factorySpy).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((window as any).GlueWeb).toHaveBeenCalledTimes(0);
        });

        it("should use the window factory function when no factory function was provided", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).GlueWeb = jasmine
                .createSpy().and
                .resolveTo({ test: 24 });
            await service.start(configMock, undefined);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((window as any).GlueWeb).toHaveBeenCalled();
        });

        it("should call the factory function with the provided config", async () => {

            await service.start(configMock, factorySpy);

            expect(factorySpy).toHaveBeenCalledWith(configMock);
        });

        it("should resolve, but emit an error when no factory was provided and the window object does not have a factory", (done: DoneFn) => {
            const ready = waitFor(2, done);

            subscription = service.onState().subscribe((result) => {

                try {
                    expect(result.error).toBeTruthy();
                    expect(result.glueInstance).toBeFalsy();
                    ready();
                } catch (error) {
                    done.fail(error);
                }

            });

            service.start(configMock, undefined).then(ready).catch(done.fail);
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

            service.start(configMock, factorySpy).then(ready).catch(done.fail);
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

            service.start(configMock, factorySpy).then(ready).catch(done.fail);
        });

    });

});
