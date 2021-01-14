import { Glue42Web } from "@glue42/web";
import { Glue42WebPlatform } from "../../../platform";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AppManagerOperationTypes = "appHello" | "applicationStart" | "instanceStop" |
    "registerWorkspaceApp" | "unregisterWorkspaceApp" | "export" | "import" | "remove" | "clear";

export interface BaseApplicationData {
    name: string;
    type: string;
    createOptions: Glue42Web.AppManager.DefinitionDetails;
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

export interface InstanceLock {
    keyOne: Promise<void>;
    keyTwo: Promise<void>;
    openKeyOne: (value?: void | PromiseLike<void> | undefined) => void;
    openKeyTwo: (value?: void | PromiseLike<void> | undefined) => void;
}

export interface AppRemoveConfig {
    name: string;
}

export interface AppsImportOperation {
    definitions: Array<Glue42Web.AppManager.Definition | Glue42WebPlatform.Applications.FDC3Definition>;
    mode: "replace" | "merge";
}

export interface AppsExportOperation {
    definitions: Glue42Web.AppManager.Definition[];
}
