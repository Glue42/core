/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from "@angular/core";
import { CONFIG_TOKEN } from "./tokens";
import { Glue42NgFactory, Glue42NgFactoryConfig, Glue42NgSettings } from "./types";

@Injectable()
export class GlueConfigService {
    private readonly _userSettings: Glue42NgSettings;
    private readonly isEnterprise: boolean;

    constructor(@Inject(CONFIG_TOKEN) userSettings: Glue42NgSettings) {
        this._userSettings = Object.assign({ holdInit: true }, userSettings);
        this.isEnterprise = typeof (window as any).glue42gd !== "undefined";
    }

    public getSettings(): Glue42NgSettings {
        return this._userSettings;
    }

    public verifyConfig(): void {
        if (this._userSettings.web && this._userSettings.webPlatform) {
            throw new Error("Cannot initialize, because the config is over-specified: it contains settings for both web and webPlatform. Please set one or the other");
        }
    }

    public getFactory(): Glue42NgFactory | undefined {
        if (this.isEnterprise) {
            return this._userSettings.desktop?.factory ||
                this._userSettings.web?.factory ||
                this._userSettings.webPlatform?.factory ||
                (window as any).Glue;
        }

        const webFactory = this._userSettings.web?.factory || (window as any).GlueWeb;
        const webPlatformFactory = this._userSettings.webPlatform?.factory || (window as any).GlueWebPlatform;

        return webFactory || webPlatformFactory;
    }

    public getConfig(): Glue42NgFactoryConfig | undefined {
        if (this.isEnterprise) {
            return this._userSettings.desktop?.config ||
                this._userSettings.web?.config ||
                this._userSettings.webPlatform?.config;
        }

        return this._userSettings.web?.config || this._userSettings.webPlatform?.config;
    }

    public getHoldInit(): boolean {
        return this._userSettings.holdInit;
    }
}