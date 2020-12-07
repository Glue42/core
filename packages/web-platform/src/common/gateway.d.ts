/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "@glue42/gateway-web/web/gateway-web.js" {
    interface LogInfo {
        time: Date;
        output: string;
        level: string;
        line: number;
        message: string;
        namespace: string;
        stacktrace: string;
    }

    export interface GatewayWebAPI {
        start: () => Promise<void>;
        connect: (connectCb: any) => Promise<GwClient>;
    }

    export type GwLoggingConfig = {
        level?: string;
        appender?: (logInfo: LogInfo) => void;
    };

    export interface GwClient {
        send: (data: unknown) => void;
        disconnect: () => unknown;
    }

    export type configure_logging = (config: GwLoggingConfig) => void;
    export type create = (config: any) => GatewayWebAPI;
}