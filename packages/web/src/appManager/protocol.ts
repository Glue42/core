/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "../../web";
import { appHelloSuccessDecoder, applicationStartConfigDecoder, appRemoveConfigDecoder, appsExportOperationDecoder, baseApplicationDataDecoder, basicInstanceDataDecoder, instanceDataDecoder, windowHelloDecoder } from "../shared/decoders";
import { BridgeOperation } from "../shared/types";

export type AppManagerOperationTypes = "appHello" | "applicationAdded" |
    "applicationRemoved" | "applicationChanged" | "instanceStarted" | "instanceStopped" |
    "applicationStart" | "instanceStop" | "import" | "remove" | "export" | "clear";

export const operations: { [key in AppManagerOperationTypes]: BridgeOperation } = {
    appHello: { name: "appHello", dataDecoder: windowHelloDecoder, resultDecoder: appHelloSuccessDecoder },
    applicationAdded: { name: "applicationAdded", dataDecoder: baseApplicationDataDecoder },
    applicationRemoved: { name: "applicationRemoved", dataDecoder: baseApplicationDataDecoder },
    applicationChanged: { name: "applicationChanged", dataDecoder: baseApplicationDataDecoder },
    instanceStarted: { name: "instanceStarted", dataDecoder: instanceDataDecoder },
    instanceStopped: { name: "instanceStopped", dataDecoder: instanceDataDecoder },
    applicationStart: { name: "applicationStart", dataDecoder: applicationStartConfigDecoder, resultDecoder: instanceDataDecoder },
    instanceStop: { name: "instanceStop", dataDecoder: basicInstanceDataDecoder },
    import: { name: "import" },
    remove: { name: "remove", dataDecoder: appRemoveConfigDecoder },
    export: { name: "export", resultDecoder: appsExportOperationDecoder },
    clear: { name: "clear" }
};

export interface InstanceData {
    id: string;
    applicationName: string;
}

export interface BaseApplicationData {
    name: string;
    type: string;
    userProperties: any;
    title?: string;
    version?: string;
    icon?: string;
    caption?: string;
}

export interface ApplicationData extends BaseApplicationData {
    instances: InstanceData[];
}

export interface AppRemoveConfig {
    name: string;
}

export interface AppsExportOperation {
    definitions: Glue42Web.AppManager.Definition[];
}

export interface AppsImportOperation {
    definitions: Array<Glue42Web.AppManager.Definition | FDC3Definition>;
    mode: "replace" | "merge";
}

export interface AppHelloSuccess {
    apps: ApplicationData[];
}

export interface ApplicationStartConfig {
    name: string;
    waitForAGMReady: boolean;
    context?: any;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    relativeTo?: string;
    relativeDirection?: "top" | "left" | "right" | "bottom";
}

export interface BasicInstanceData {
    id: string;
}

export interface FDC3Definition {
    name: string;
    title?: string;
    version?: string;
    appId: string;
    manifest: string;
    manifestType: string;
    tooltip?: string;
    description?: string;
    contactEmail?: string;
    supportEmail?: string;
    publisher?: string;
    images?: Array<{ url?: string }>;
    icons?: Array<{ icon?: string }>;
    customConfig?: any;
    intents?: Intent[];
}

export interface Intent {
    name: string;
    displayName?: string;
    contexts?: string[];
    customConfig?: any;
}

export interface DefinitionParseResult {
    valid: Glue42Web.AppManager.Definition[];
    invalid: Array<{ app: string; error: string }>;
}
