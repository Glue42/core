import { Decoder, object, string, number, boolean, optional, array, oneOf, constant } from "@mojotech/json-type-validation";
import { SharedAsset, ServerSettings, ServerApp, GlueDevConfig } from "./user.config";

const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");
const nonNegativeNumberDecoder: Decoder<number> = number().where((num) => num >= 0, "Expected a non-negative number");

const sharedAssetDecoder: Decoder<SharedAsset> = object({
    path: nonEmptyStringDecoder,
    route: nonEmptyStringDecoder
});

const userServerSettingsDecoder: Decoder<ServerSettings> = object({
    port: optional(nonNegativeNumberDecoder),
    disableCache: optional(boolean())
});

const userServerAppDecoder: Decoder<ServerApp> = object({
    route: nonEmptyStringDecoder,
    localhost: optional(object({
        port: nonNegativeNumberDecoder,
        spa: optional(boolean())
    })),
    file: optional(object({
        path: nonEmptyStringDecoder
    }))
});

export const glueDevConfigDecoder: Decoder<GlueDevConfig> = object({
    glueAssets: optional(object({
        worker: optional(nonEmptyStringDecoder),
        gateway: optional(object({
            location: optional(nonEmptyStringDecoder),
            gwLogAppender: optional(nonEmptyStringDecoder)
        })),
        config: optional(nonEmptyStringDecoder),
        route: optional(nonEmptyStringDecoder)
    })),
    server: optional(object({
        apps: array(userServerAppDecoder),
        settings: optional(userServerSettingsDecoder),
        sharedAssets: optional(array(sharedAssetDecoder))
    })),
    logging: optional(oneOf<"full" | "dev" | "default">(
        constant("full"),
        constant("dev"),
        constant("default")
    ))
});

export const serverDecoderDecorator = object({
    server: object({
        apps: array(userServerAppDecoder)
    })
});
