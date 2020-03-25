/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Gateway {
    start: () => void;
    connect: (connectCb: any) => Promise<GwClient>;
}

export type GwLoggingConfig = {
    level: string;
    appender: () => void;
};

export interface GlobalGateway {
    core: {
        configure_logging: (config: GwLoggingConfig) => void;
        create: (config: any) => Gateway;
    };
}

export interface GwClient {
    send: (data: string) => void;
}
