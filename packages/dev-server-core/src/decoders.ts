import { Decoder, object, array, optional, string, number, boolean, constant } from "@mojotech/json-type-validation";
import { ServerConfig, GlueAssets, ServerSettings, SharedAsset, DevServerApp } from "../types/config";

const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");
const nonNegativeNumberDecoder: Decoder<number> = number().where((num) => num >= 0, "Expected a non-negative number");

const serverSettingsDecoder: Decoder<ServerSettings> = object({
    port: nonNegativeNumberDecoder,
    disableCache: optional(boolean()),
    logging: optional(constant("full"))
});

const glueAssetsDecoder: Decoder<GlueAssets> = object({
    sharedWorker: nonEmptyStringDecoder,
    gateway: nonEmptyStringDecoder,
    config: nonEmptyStringDecoder
});

const sharedAssetDecoder: Decoder<SharedAsset> = object({
    path: nonEmptyStringDecoder,
    route: nonEmptyStringDecoder
});

const devServerAppDecoder: Decoder<DevServerApp> = object({
    route: nonEmptyStringDecoder,
    localhost: optional(object({
        port: nonNegativeNumberDecoder
    })),
    file: optional(object({
        path: nonEmptyStringDecoder
    })),
    cookieID: optional(nonEmptyStringDecoder)
});

export const serverConfigDecoder: Decoder<ServerConfig> = object({
    glueAssets: glueAssetsDecoder,
    apps: array(devServerAppDecoder),
    serverSettings: serverSettingsDecoder,
    sharedAssets: optional(array(sharedAssetDecoder))
});
