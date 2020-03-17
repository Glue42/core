import { ServerApp, ServerSettings, SharedAsset } from "./user.config";

export type CliCommand = "serve" | "build" | "init";

export interface CliConfig {
    rootDirectory: string;
    command: CliCommand;
    glueAssets: CliGlueAssets;
    server: {
        settings: CliServerSettings;
        apps: CliServerApp[];
        sharedAssets: SharedAsset[];
    };
    logging?: "full" | "dev";
}

export interface CliServerApp extends ServerApp {
    cookieID: string;
}

export interface CliGlueAssets {
    sharedWorker: string;
    gateway: string;
    config: string;
}

export interface CliServerSettings extends ServerSettings {
    port: number;
}

// init -> no config needed (can generate config, just to prepare it for serve and to showcase the defaults)
// build -> on config needed (can use defaults location for packages and output)
// serve -> config is needed (must define the apps)
