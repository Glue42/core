import { InternalPlatformConfig } from "./types";

export const defaultPlatformConfig: InternalPlatformConfig = {
    windows: {
        windowResponseTimeoutMs: 10000,
        defaultWindowOpenBounds: {
            top: 0,
            left: 0,
            width: 600,
            height: 600
        }
    },
    applications: {
        mode: "local",
        local: []
    },
    layouts: {
        mode: "local",
        local: []
    },
    channels: {
        definitions: []
    },
    plugins: {
        definitions: []
    },
    gateway: {
        logging: {
            level: "info"
        }
    },
    glue: {}
};

export const defaultTargetString = "*";

export const defaultFetchTimeoutMs = 3000;