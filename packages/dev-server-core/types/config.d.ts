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
    cookieID: string;
}

export interface ServerConfig {
    glueAssets: GlueAssets;
    apps: DevServerApp[];
    serverSettings: ServerSettings;
    sharedAssets?: SharedAsset[];
}


export interface ServerSettings {
    port?: number;
    disableCache?: boolean;
    verboseLogging?: boolean;
}

export interface GlueAssets {
    sharedWorker: string;
    gateway: string;
}
