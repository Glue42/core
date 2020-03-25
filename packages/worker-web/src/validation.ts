/* eslint-disable @typescript-eslint/camelcase */
import { Decoder, object, optional, anyJson, string, oneOf, constant } from "@mojotech/json-type-validation";
import { Glue42CoreConfig, GatewayConfig } from "./glue.config";
import { GlobalGateway } from "./gateway.d";

const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");

export const gatewayConfigDecoder: Decoder<GatewayConfig> = object({
    location: optional(nonEmptyStringDecoder),
    logging: optional(object({
        level: optional(oneOf<"trace" | "debug" | "info" | "warn" | "error">(
            constant("trace"),
            constant("debug"),
            constant("info"),
            constant("warn"),
            constant("error")
        )),
        appender: optional(object({
            name: nonEmptyStringDecoder,
            location: nonEmptyStringDecoder
        }))
    }))
});

export const glue42CoreConfigDecoder: Decoder<Glue42CoreConfig> = object({
    glue: optional(anyJson()),
    gateway: optional(gatewayConfigDecoder)
});

export const gateGlobalDecoder: Decoder<GlobalGateway> = object({
    core: object({
        configure_logging: anyJson(),
        create: anyJson()
    })
});