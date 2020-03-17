export interface GlueDevConfig {
    glueAssets?: GlueAssets;
    serverSettings?: ServerSettings;
    sharedAssets?: SharedAsset[];
    apps?: ServerApp[];
    logging?: "full" | "dev";
}

export interface GlueAssets {
    sharedWorker?: string;
    gateway?: string;
    config?: string;
}

export interface ServerSettings {
    port?: number;
    disableCache?: boolean;
}

export interface SharedAsset {
    path: string;
    route: string;
}

export interface ServerApp {
    route: string;
    localhost?: {
        port: number;
    };
    file?: {
        path: string;
    };
}