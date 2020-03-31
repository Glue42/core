import { ServerApp, ServerSettings, SharedAsset } from "./user.config";

export type CliCommand = "serve" | "build" | "init";

export interface CliConfig extends FullDevConfig {
    rootDirectory: string;
    command: CliCommand;
}

export interface FullDevConfig {
    glueAssets: CliGlueAssets;
    server: {
        settings: CliServerSettings;
        apps: CliServerApp[];
        sharedAssets: SharedAsset[];
    };
    logging?: "full" | "dev" | "default";
}

export interface CliServerApp extends ServerApp {
    cookieID: string;
}

export interface CliGlueAssets {
    worker: string;
    gateway: {
        location: string;
        gwLogAppender?: string;
    };
    config: string;
    route: string;
}

export interface CliServerSettings extends ServerSettings {
    port: number;
}
