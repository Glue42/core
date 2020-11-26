import { TestBed } from "@angular/core/testing";
import { GlueConfigService } from "../glue-config.service";
import { CONFIG_TOKEN } from "../tokens";
import { Glue42NgSettings } from "../types";

describe("GlueConfigService ", () => {
    let configMock = {};
    let service: GlueConfigService;

    describe("getSettings ", () => {
        it("should return an object with a single property holdInit true, if no config was provided", () => {
            configMock = undefined;

            TestBed.configureTestingModule({
                providers: [
                    GlueConfigService,
                    {
                        provide: CONFIG_TOKEN,
                        useValue: configMock
                    }
                ]
            });

            service = TestBed.inject(GlueConfigService);

            const settings = service.getSettings();

            expect(settings).toEqual({ holdInit: true });
        });

        [
            { config: { test: 42 } },
            { factory: (): number => 42 },
            { config: { test: 42 }, factory: (): number => 42 }
        ].forEach((input) => {
            it(`should return an object with equal properties, but added holdInit true, if it was not specified: ${JSON.stringify(input)}`, () => {
                configMock = input;

                TestBed.configureTestingModule({
                    providers: [
                        GlueConfigService,
                        {
                            provide: CONFIG_TOKEN,
                            useValue: configMock
                        }
                    ]
                });

                service = TestBed.inject(GlueConfigService);

                const settings = service.getSettings();

                expect(Object.assign({ holdInit: true }, input) as Glue42NgSettings).toEqual(settings);
            });
        });

        [
            { config: { test: 42 }, holdInit: false },
            { factory: (): number => 42, holdInit: false },
            { config: { test: 42 }, factory: (): number => 42, holdInit: false }
        ].forEach((input) => {
            it(`should return an object with equal properties and holdInit false, if it was specified as false: ${JSON.stringify(input)}`, () => {
                configMock = input;

                TestBed.configureTestingModule({
                    providers: [
                        GlueConfigService,
                        {
                            provide: CONFIG_TOKEN,
                            useValue: configMock
                        }
                    ]
                });

                service = TestBed.inject(GlueConfigService);

                const settings = service.getSettings();

                expect(input as Glue42NgSettings).toEqual(settings);
            });
        });

        [
            { config: { test: 42 }, holdInit: true },
            { factory: (): number => 42, holdInit: true },
            { config: { test: 42 }, factory: (): number => 42, holdInit: true }
        ].forEach((input) => {
            it(`should return an object with equal properties, but added holdInit true, if it was specified as true: ${JSON.stringify(input)}`, () => {
                configMock = input;

                TestBed.configureTestingModule({
                    providers: [
                        GlueConfigService,
                        {
                            provide: CONFIG_TOKEN,
                            useValue: configMock
                        }
                    ]
                });

                service = TestBed.inject(GlueConfigService);

                const settings = service.getSettings();

                expect(input as Glue42NgSettings).toEqual(settings);
            });
        });

    });
});