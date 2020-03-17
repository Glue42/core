import { Configuration } from "log4js";
import { GlueDevConfig } from "./config/user.config";

export const loggerConfig: Configuration = {
    appenders: {
        out: { type: "console" },
        app: {
            type: "file",
            filename: "glue.core.cli.log"
        }
    },
    categories: {
        "default": { appenders: ["out"], level: "warn" },
        "dev": { appenders: ["out"], level: "trace" },
        "full": { appenders: ["out", "app"], level: "trace" }
    }
};

export const gCoreDeps = ["@glue42/gateway-core", "@glue42/worker-core"];

export const glueDevConfigDefaults: { name: string; data: GlueDevConfig } = {
    name: "glue.config.dev.json",
    data: {
        glueAssets: {
            gateway: "./node_modules/@glue42/gateway-core",
            sharedWorker: "./node_modules/@glue42/worker-core",
            config: "./glue.config.json"
        },
        serverSettings: {
            port: 4242,
            disableCache: true
        },
        sharedAssets: [],
        apps: []
    }
};

// todo: define config shape and defaults
export const glueConfigDefaults = {
    name: "glue.config.json",
    data: {
        test: 24
    }
};
