import { Glue42Core } from "../glue";
import { ConnectionSettings } from "./connection/types";

declare global {
    interface Window {
        glueDesktop?: GlueDesktopObject;
        glue42gd?: Glue42Core.GDObject;
        gdPreloadPromise: Promise<Glue42Core.GDObject>;
        WebSocket: any;
        XDomainRequest?: any;
    }
}

/** @ignore */
export interface GlueDesktopObject {
    version: string;
}

export interface Mark {
    name: string;
    time: number;
    diff: number;
}

export interface Timer {
    startTime: number;
    endTime: number;
    period: number;
    marks: Mark[];
    stop: () => number;
    mark(name: string): void;
}

export interface InternalConfig {
    connection: ConnectionSettings;
    logger: { console: Glue42Core.LogLevel; publish: Glue42Core.LogLevel };
    auth: Glue42Core.Auth | undefined;
    metrics: boolean | Glue42Core.MetricsConfig;
    contexts: boolean | undefined;
    version: string;
    libs: any[];
    bus: boolean;
    customLogger?: Glue42Core.CustomLogger;
}

export interface GDStaringContext {
    gwURL?: string;
    gwToken?: string;
    applicationConfig: {
        name: string
    };
    env: string;
    region: string;
    instanceId: string;
}
