export interface UserServerSettings {
    port?: number;
    disableCache?: boolean;
    verboseLogging?: boolean;
}

export interface UserServerApp {
    route: string;
    localhost?: {
        port: number;
    };
    file?: {
        path: string;
    };
}

export interface UserConfig {
    apps: UserServerApp[];
    glueAssets?: {
        sharedWorker?: string;
        gateway?: string;
    };
    serverSettings?: UserServerSettings;
    sharedAssets?: SharedAsset[];
}

export interface SharedAsset {
    path: string;
    route: string;
}

export interface ServerSettings extends UserServerSettings {
    port: number;
}

export interface DevServerApp extends UserServerApp {
    cookieID: string;
}

export interface GlueAssets {
    sharedWorker: string;
    gateway: string;
}

export interface ServerConfig {
    glueAssets: GlueAssets;
    apps: DevServerApp[];
    serverSettings: ServerSettings;
    sharedAssets?: SharedAsset[];
}
