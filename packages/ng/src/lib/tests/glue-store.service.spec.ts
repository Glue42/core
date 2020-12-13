/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from "@angular/core/testing";
import { Glue42Store } from "../glue-store.service";
import { Subject, ReplaySubject, Observable, Subscription } from "rxjs";
import { Glue42Initializer } from "../glue-initializer.service";
import { Glue42 } from "@glue42/desktop";

describe("Glue42Store ", () => {
    let service: Glue42Store;
    let initObs: Subject<unknown>;
    let initializerSpy: jasmine.SpyObj<Glue42Initializer>;

    describe("creation", () => {
        let subscribeSpy: jasmine.Spy<jasmine.Func>;

        beforeEach(() => {
            initializerSpy = jasmine.createSpyObj<Glue42Initializer>("Glue42Initializer", ["onState"]);
            subscribeSpy = jasmine.createSpy();

            initializerSpy.onState.and.returnValue({ subscribe: subscribeSpy } as any);

            TestBed.configureTestingModule({
                providers: [
                    Glue42Store,
                    {
                        provide: Glue42Initializer,
                        useValue: initializerSpy
                    }
                ]
            });
            service = TestBed.inject(Glue42Store);
        });

        it("should be created", () => {
            expect(service).toBeTruthy();
        });

        it("should have a replaySubject when created", () => {
            expect((service as any).readySource).toBeInstanceOf(ReplaySubject);
        });

        it("should subscribe to onState when created", () => {
            expect(subscribeSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("operation", () => {

        let subscription: Subscription;

        beforeEach(() => {

            initObs = new Subject();

            initializerSpy = jasmine.createSpyObj<Glue42Initializer>("Glue42Initializer", ["onState"]);
            initializerSpy.onState.and.returnValue(initObs);

            TestBed.configureTestingModule({
                providers: [
                    Glue42Store,
                    {
                        provide: Glue42Initializer,
                        useValue: initializerSpy
                    }
                ]
            });
            service = TestBed.inject(Glue42Store);
        });

        afterEach(() => {
            if (subscription) {
                subscription.unsubscribe();
                subscription = null;
            }
        });

        it("should have a ready method which returns and observable", () => {

            expect(service.ready).toBeTruthy();
            expect(service.ready()).toBeInstanceOf(Observable);
        });

        it("ready should emit with empty object when initializer emitted success", (done: DoneFn) => {

            subscription = service.ready().subscribe((readyResult) => {
                try {
                    expect(readyResult).toEqual({});
                    done();
                } catch (error) {
                    done.fail(error);
                }
            });

            initObs.next({ glueInstance: { test: 42 } });
        });

        it("this.glueInstance should be set to the same object emitted by the initializer, when no error", () => {
            initObs.next({ glueInstance: { test: 42 } });

            expect((service as any).glueInstance).toEqual({ test: 42 });
        });

        it("ready should emit with error when the initializer emitted an error", (done: DoneFn) => {
            subscription = service.ready().subscribe((readyResult) => {
                try {
                    expect(readyResult).toEqual({ error: { test: 24 } });
                    done();
                } catch (error) {
                    done.fail(error);
                }
            });

            initObs.next({ error: { test: 24 } });
        });

        it("no glue instance should be set when error is emitted", () => {
            initObs.next({ error: { test: 24 } });

            expect((service as any).glueInstance).toBeUndefined();
        });

        it("this.initError should be set to the error object provided by the initializer, when error", () => {
            initObs.next({ error: { test: 24 } });

            expect(service.getInitError()).toEqual({ test: 24 });
        });

        it("initError should be undefined when created", () => {
            expect(service.getInitError()).toBeUndefined();
        });

        it("should be undefined when init onState was heard without error object", () => {
            initObs.next({ glueInstance: { test: 42 } });

            expect(service.getInitError()).toBeUndefined();
        });

        it("accessing glue should throw when no glueInstance was set", () => {
            expect(() => service.getGlue()).toThrow();
        });

        it("accessing glue should return the glueInstance when the initializer emitted success", () => {
            initObs.next({ glueInstance: { test: 42 } });

            expect(service.getGlue()).toEqual((service as any).glueInstance);
        });

        it("accessing glue should return the same object emitted from the initializer", () => {
            initObs.next({ glueInstance: { test: 42 } });

            expect(service.getGlue()).toEqual({ test: 42 } as unknown as Glue42.Glue);
        });
    });
});