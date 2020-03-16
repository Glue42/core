import { UserConfig } from "./config/config";

export const gCoreDeps = ["@glue42/gateway-core", "@glue42/worker-core"];

export const glueDevConfigDefaults: {name: string; data: UserConfig} = {
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
        test:24
    }
};
