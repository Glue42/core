import { Inject, Injectable } from "@angular/core";
import { CONFIG_TOKEN } from "./tokens";
import { Glue42NgSettings } from "./types";

@Injectable()
export class GlueConfigService {
    private readonly _userSettings: Glue42NgSettings;

    constructor(@Inject(CONFIG_TOKEN) userSettings: Glue42NgSettings) {
        this._userSettings = Object.assign({ holdInit: true }, userSettings);
    }

    public getSettings(): Glue42NgSettings {
        return this._userSettings;
    }
}