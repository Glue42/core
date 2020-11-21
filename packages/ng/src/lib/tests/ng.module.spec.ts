import { TestBed } from "@angular/core/testing";
import { Glue42Ng } from "../ng.module";
import { FactoryProvider, APP_INITIALIZER, ValueSansProvider } from "@angular/core";
import { Glue42Initializer } from "../glue-initializer.service";
import { Glue42Store } from "../glue-store.service";
import { GlueConfigService } from "../glue-config.service";
import { Glue42NgSettings } from "../types";

describe("Glue42Ng", () => {

    describe("forRoot unit", () => {

        let initializerSpy: jasmine.SpyObj<Glue42Initializer>;

        beforeEach(() => {
            initializerSpy = jasmine.createSpyObj<Glue42Initializer>("Glue42Initializer", ["start"]);
            initializerSpy.start.and.resolveTo();
        });

        it("should return an object with ngModule which is of class Glue42Ng and providers array", () => {
            const ngModule = Glue42Ng.forRoot();
            expect(ngModule.ngModule.name).toEqual("Glue42Ng");
        });

        it("should have a provider for APP_INITIALIZER", () => {
            const ngModule = Glue42Ng.forRoot();

            const providers = ngModule.providers;

            expect(providers.some((pr: FactoryProvider) => pr.provide && pr.provide === APP_INITIALIZER)).toBeTrue();
        });

        it("should have a provider for APP_INITIALIZER, multi true and Glue42Initializer, Glue42Store as deps", () => {
            const ngModule = Glue42Ng.forRoot();

            const providers = ngModule.providers;
            const appInitializerProvider = providers.find((pr: FactoryProvider) => pr.provide && pr.provide === APP_INITIALIZER) as FactoryProvider;

            const multi = appInitializerProvider.multi;
            const hasGlue42Initializer = appInitializerProvider.deps.some((dep) => dep.name === "Glue42Initializer");
            const hasGlue42Store = appInitializerProvider.deps.some((dep) => dep.name === "Glue42Store");

            expect(multi).toBeTrue();
            expect(hasGlue42Initializer).toBeTrue();
            expect(hasGlue42Store).toBeTrue();
        });

        it("should have a provider for Glue42Store", () => {
            const ngModule = Glue42Ng.forRoot();

            const providers = ngModule.providers;

            expect(providers.some((pr) => typeof pr === "function" && pr.name === "Glue42Store")).toBeTrue();
        });

        it("should have a provider for Glue42Initializer", () => {
            const ngModule = Glue42Ng.forRoot();

            const providers = ngModule.providers;

            expect(providers.some((pr) => typeof pr === "function" && pr.name === "Glue42Initializer")).toBeTrue();
        });

        it("the initializerFactory should call the initializer start once", async () => {

            const ngModule = Glue42Ng.forRoot();

            const appInitializer = ngModule.providers[0] as FactoryProvider;

            const useFactoryFunc = appInitializer.useFactory(initializerSpy);

            await useFactoryFunc();

            expect(initializerSpy.start).toHaveBeenCalledTimes(1);
        });

        it("the initializerFactory should return promise by default", async () => {
            const ngModule = Glue42Ng.forRoot();

            const appInitializer = ngModule.providers[0] as FactoryProvider;

            const useFactoryFunc = appInitializer.useFactory(initializerSpy);

            const factoryResult = useFactoryFunc();

            expect(factoryResult).toBeInstanceOf(Promise);

            await factoryResult;
        });

        it("when settings.holdInit true the init factory should return a promise", async () => {
            const ngModule = Glue42Ng.forRoot({ holdInit: true });

            const appInitializer = ngModule.providers[0] as FactoryProvider;

            const useFactoryFunc = appInitializer.useFactory(initializerSpy);

            const factoryResult = useFactoryFunc();

            expect(factoryResult).toBeInstanceOf(Promise);

            await factoryResult;
        });

        [
            { holdInit: false },
            { factory: (): number => 42 },
            { config: { test: 42 } },
            { config: { test: 42 }, factory: (): number => 42, holdInit: false }
        ].forEach((input) => {
            it(`should set the exact same settings object in the CONFIG_TOKEN: ${JSON.stringify(input)}`, () => {
                const ngModule = Glue42Ng.forRoot(input as Glue42NgSettings);

                const valueProvider = ngModule.providers[1] as ValueSansProvider;

                const tokenValue = valueProvider.useValue;

                expect(tokenValue).toEqual(input);
            });

        });
    });

    describe("forRoot integration ", () => {

        it("should not register Glue42Store when provided without forRoot", () => {
            TestBed.configureTestingModule({ imports: [Glue42Ng] });

            expect(() => TestBed.inject(Glue42Store)).toThrowError(/No provider/);
        });

        it("should not register Glue42Initializer when provided without forRoot", () => {
            TestBed.configureTestingModule({ imports: [Glue42Ng] });

            expect(() => TestBed.inject(Glue42Initializer)).toThrowError(/No provider/);
        });

        it("should not register GlueConfigService when provided without forRoot", () => {
            TestBed.configureTestingModule({ imports: [Glue42Ng] });

            expect(() => TestBed.inject(GlueConfigService)).toThrowError(/No provider/);
        });

        it("should register Glue42Store and Glue42Initializer and GlueConfigService when provided with forRoot", () => {
            TestBed.configureTestingModule({ imports: [Glue42Ng.forRoot()] });

            const initService = TestBed.inject(Glue42Initializer);
            const storeService = TestBed.inject(Glue42Store);
            const configService = TestBed.inject(GlueConfigService);

            expect(initService).toBeTruthy();
            expect(storeService).toBeTruthy();
            expect(configService).toBeTruthy();
        });
    });

});
