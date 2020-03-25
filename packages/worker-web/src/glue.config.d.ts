/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GatewayConfig {
    location?: string;
    logging?: {
        level?: "trace" | "debug" | "info" | "warn" | "error";
        appender?: {
            name: string;
            location: string;
        };
    };
}

export interface Glue42CoreConfig {
    glue?: any;
    gateway?: GatewayConfig;
}