export interface GlueDevConfig {
    glueAssets?: GlueAssets;
    server?: {
        settings?: ServerSettings;
        apps: ServerApp[];
        sharedAssets?: SharedAsset[];
    };
    logging?: "full" | "dev"| "default";
}

export interface GlueAssets {
    gateway?: {
        location?: string;
        gwLogAppender?: string;
    };
    worker?: string;
    config?: string;
    route?: string;
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
        spa?: boolean;
    };
    file?: {
        path: string;
    };
}