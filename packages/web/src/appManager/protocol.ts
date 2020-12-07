/* eslint-disable @typescript-eslint/no-explicit-any */
import { appHelloSuccessDecoder, applicationStartConfigDecoder, baseApplicationDataDecoder, basicInstanceDataDecoder, instanceDataDecoder, windowHelloDecoder } from "../shared/decoders";
import { BridgeOperation } from "../shared/types";

export type AppManagerOperationTypes = "appHello" | "applicationAdded" |
    "applicationRemoved" | "applicationChanged" | "instanceStarted" | "instanceStopped" |
    "applicationStart" | "instanceStop";

export const operations: { [key in AppManagerOperationTypes]: BridgeOperation } = {
    appHello: { name: "appHello", dataDecoder: windowHelloDecoder, resultDecoder: appHelloSuccessDecoder },
    applicationAdded: { name: "applicationAdded", dataDecoder: baseApplicationDataDecoder },
    applicationRemoved: { name: "applicationRemoved", dataDecoder: baseApplicationDataDecoder },
    applicationChanged: { name: "applicationChanged", dataDecoder: baseApplicationDataDecoder },
    instanceStarted: { name: "instanceStarted", dataDecoder: instanceDataDecoder },
    instanceStopped: { name: "instanceStopped", dataDecoder: instanceDataDecoder },
    applicationStart: { name: "applicationStart", dataDecoder: applicationStartConfigDecoder, resultDecoder: instanceDataDecoder },
    instanceStop: { name: "instanceStop", dataDecoder: basicInstanceDataDecoder }
};

export interface InstanceData {
    id: string;
    applicationName: string;
}

export interface BaseApplicationData {
    name: string;
    userProperties: any;
    title?: string;
    version?: string;
    icon?: string;
    caption?: string;
}

export interface ApplicationData extends BaseApplicationData {
    instances: InstanceData[];
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
