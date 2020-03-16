export interface ServerConfig {
    glueAssets: GlueAssets;
    apps: DevServerApp[];
    serverSettings: ServerSettings;
    sharedAssets?: SharedAsset[];
}

export interface SharedAsset {
    path: string;
    route: string;
}

export interface DevServerApp {
    route: string;
    localhost?: {
        port: number;
    };
    file?: {
        path: string;
    };
    cookieID?: string;
}

export interface ServerSettings {
    port: number;
    disableCache?: boolean;
    logging?: "full";
}

export interface GlueAssets {
    sharedWorker: string;
    gateway: string;
    config: string;
}
