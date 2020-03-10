import { Decoder, object, string, number, boolean, optional, array } from "@mojotech/json-type-validation";
import { SharedAsset, UserServerSettings, UserServerApp, UserConfig } from "./config";

const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");
const nonNegativeNumberDecoder: Decoder<number> = number().where((num) => num >= 0, "Expected a non-negative number");

const sharedAssetDecoder: Decoder<SharedAsset> = object({
    path: nonEmptyStringDecoder,
    route: nonEmptyStringDecoder
});

const userServerSettingsDecoder: Decoder<UserServerSettings> = object({
    port: optional(nonNegativeNumberDecoder),
    disableCache: boolean(),
    verboseLogging: boolean()
});

const userServerAppDecoder: Decoder<UserServerApp> = object({
    route: nonEmptyStringDecoder,
    url: optional(object({
        base: nonEmptyStringDecoder,
        path: nonEmptyStringDecoder
    })),
    file: optional(object({
        path: nonEmptyStringDecoder
    }))
});

export const serverConfigDecoder: Decoder<UserConfig> = object({
    glueAssets: optional(object({
        sharedWorker: optional(nonEmptyStringDecoder)
    })),
    apps: array(userServerAppDecoder),
    serverSettings: optional(userServerSettingsDecoder),
    sharedAssets: optional(array(sharedAssetDecoder))
});
