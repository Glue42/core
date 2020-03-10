export interface UserServerSettings {
    port?: number;
    disableCache?: boolean;
    verboseLogging?: boolean;
}

export interface UserServerApp {
    route: string;
    url?: {
        base: string;
        path: string;
    };
    file?: {
        path: string;
    };
}

export interface UserConfig {
    apps: UserServerApp[];
    glueAssets?: {
        sharedWorker?: string;
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

export interface ServerConfig {
    glueAssets: {
        sharedWorker: string;
    };
    apps: DevServerApp[];
    serverSettings: ServerSettings;
    sharedAssets?: SharedAsset[];
}
