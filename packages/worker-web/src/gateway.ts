/* eslint-disable @typescript-eslint/camelcase */
import { Gateway, GlobalGateway } from "./gateway.d";
import { GatewayConfig } from "./glue.config";
import { gwGlobal } from "./defaults";
import { gateGlobalDecoder } from "./validation";
import { Err } from "@mojotech/json-type-validation/dist/types/result";
import { DecoderError } from "@mojotech/json-type-validation/dist/types/decoder";

declare const gateway_web: GlobalGateway;

const getAppender = (appenderConfig: { name: string; location: string }): () => void => {
    if (!appenderConfig) {
        return;
    }

    importScripts(appenderConfig.location);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appenderFunc: () => void = (self as any)[appenderConfig.name];

    if (typeof appenderFunc !== "function") {
        throw new Error("The appender function found, but it is not of type function");
    }

    return appenderFunc;
};

const configureGwLogging = (gwConfig: GatewayConfig): void => {
    let appender: () => void;
    try {
        appender = getAppender(gwConfig.logging.appender);
    } catch (error) {
        console.warn("Error applying custom logging configuration for the gateway, falling back to default logging configuration. Inner error:");
        console.warn(error);
        return;
    }

    const loggingConfig = {
        level: gwConfig.logging.level,
        appender
    };

    gateway_web.core.configure_logging(loggingConfig);
};

const verifyGatewayScript = (): void => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoderResult = gateGlobalDecoder.run((self as any)[gwGlobal]);

    if (!decoderResult.ok) {
        throw new Error(`The global gateway object is not valid: ${(decoderResult as Err<DecoderError>).error.message}`);
    }
};

export const startGateway = (config: GatewayConfig): Gateway => {
    try {
        importScripts(config.location);
    } catch (error) {
        throw new Error(`Error loading the gateway from: ${config.location}. Inner error: ${JSON.stringify(error)}`);
    }

    verifyGatewayScript();

    if (config.logging) {
        configureGwLogging(config);
    }
    const gateway = gateway_web.core.create({});

    gateway.start();

    return gateway;
};