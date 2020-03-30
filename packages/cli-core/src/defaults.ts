import { Configuration } from "log4js";
import { FullDevConfig } from "./config/cli.config.d";

export const loggerConfig: Configuration = {
    appenders: {
        out: { type: "console" },
        app: {
            type: "file",
            filename: "glue.core.cli.log"
        }
    },
    categories: {
        "default": { appenders: ["out"], level: "info" },
        "dev": { appenders: ["out"], level: "trace" },
        "full": { appenders: ["out", "app"], level: "trace" }
    }
};

export const gCoreDeps = ["@glue42/gateway-web", "@glue42/worker-web"];

export const glueDevConfigDefaults: { name: string; location: string; data: FullDevConfig } = {
    location: "./",
    name: "glue.config.dev.json",
    data: {
        glueAssets: {
            gateway: {
                location: "./node_modules/@glue42/gateway-web/web/gateway-web.js"
            },
            worker: "./node_modules/@glue42/worker-web/dist/worker.js",
            config: "./glue.config.json",
            route: "/glue"
        },
        server: {
            settings: {
                port: 4242,
                disableCache: true
            },
            apps: [],
            sharedAssets: []
        },
        logging: "default"
    }
};

export const glueConfigDefaults = {
    name: "glue.config.json",
    data: {
        glue: {
            worker: "./worker.js",
            layouts: {
                autoRestore: false,
                autoSaveWindowContext: false
            }
        },
        gateway: {
            location: "./gateway.js"
        }
    }
};
