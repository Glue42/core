import { Glue42WebPlatform } from "../../../platform";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AppManagerOperationTypes = "appHello" | "applicationStart" | "instanceStop" | "registerWorkspaceApp" | "unregisterWorkspaceApp";

export interface BaseApplicationData {
    name: string;
    createOptions: Glue42WebPlatform.Applications.CreateOptions;
    userProperties?: any;
    title?: string;
    version?: string;
    icon?: string;
    caption?: string;
}

export interface InstanceProcessInfo {
    data: InstanceData;
    monitorState?: {
        child: Window;
    };
    context?: any;
}

export interface BasicInstanceData {
    id: string;
}

export interface InstanceData {
    id: string;
    applicationName: string;
}

export interface BridgeInstanceData {
    windowId: string;
    appName: string;
}

export interface ApplicationData extends BaseApplicationData {
    instances: InstanceData[];
}

export interface AppHelloSuccess {
    apps: ApplicationData[];
}

export interface AppHello {
    windowId?: string;
}

export interface ApplicationStartConfig {
    name: string;
    context?: any;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    relativeTo?: string;
    relativeDirection?: "top" | "left" | "right" | "bottom";
    waitForAGMReady?: boolean;
}

export interface InstanceLock {
    keyOne: Promise<void>;
    keyTwo: Promise<void>;
    openKeyOne: (value?: void | PromiseLike<void> | undefined) => void;
    openKeyTwo: (value?: void | PromiseLike<void> | undefined) => void;
}