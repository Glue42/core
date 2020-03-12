import { Glue42Core } from "../glue";
import { ConnectionSettings } from "./connection/types";

declare global {
    interface Window {
        glueDesktop?: GlueDesktopObject;
        glue42gd?: GDObject;
        gdPreloadPromise: Promise<GDObject>;
        WebSocket: any;
        XDomainRequest?: any;
    }
}

/** @ignore */
export interface GDObject {
    /** Id of the window */
    windowId: string;
    /** Name of the application running in the window */
    appName: string;
    /** Name of the application running in the window */
    applicationName: string;
    application: string;
    /** Instance of the application running in the window */
    appInstanceId: string;
    gwURL: string;
    pid: number;
    env: {
        env: string;
        machineName: string;
        region: string;
        windowsUserDomain: string;
        windowsUserId: string;
        windowsUserName: string;
    };
    activityInfo: {
        activityId: string,
        activityType: string,
        windowType: string,
        windowName: string,
        gwToken: string,
        isOwner: boolean
    };
    updatePerfData: (perf: object) => void;
    getGWToken(): Promise<string>;
    getWindowInfo(id: string): {
        applicationName: string;
        activityId?: string;
        activityWindowId?: string;
    };
}

/** @ignore */
export interface GlueDesktopObject {
    version: string;
}

export interface Timer {
    startTime: number;
    endTime: number;
    period: number;
    stop: () => number;
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
