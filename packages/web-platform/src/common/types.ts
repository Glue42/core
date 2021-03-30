/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import { Decoder } from "decoder-validate";
import { Glue42WebPlatform } from "../../platform";

export type Glue42API = Glue42.Glue;
export type Glue42Config = Glue42.Config;
export type LibDomains = "system" | "windows" | "appManager" | "layouts" | "workspaces" | "intents" | "channels";

export interface InternalWindowsConfig {
    windowResponseTimeoutMs: number;
    defaultWindowOpenBounds: Glue42Web.Windows.Bounds;
}

export interface InternalApplicationsConfig {
    local: Array<Glue42Web.AppManager.Definition | Glue42WebPlatform.Applications.FDC3Definition>;
    remote?: Glue42WebPlatform.RemoteStore;
}

export interface InternalLayoutsConfig {
    mode: "idb" | "session";
    local: Array<Glue42Web.Layouts.Layout>;
}

export interface InternalPlatformConfig {
    glueFactory?: (config?: Glue42Web.Config) => Promise<Glue42Web.API>;
    glue?: Glue42Web.Config;
    gateway?: Glue42WebPlatform.Gateway.Config;
    windows: InternalWindowsConfig;
    applications: InternalApplicationsConfig;
    layouts: InternalLayoutsConfig;
    channels: {
        definitions: Glue42WebPlatform.Channels.ChannelDefinition[];
    };
    plugins?: {
        definitions: Glue42WebPlatform.Plugins.PluginDefinition[];
    };
    workspaces?: Glue42WebPlatform.Workspaces.Config;
    environment: any;
}

export interface CoreClientData {
    windowId: string;
    win: Window;
}

export interface LibController {
    start(config: InternalPlatformConfig): Promise<void>;
    handleControl(args: any): Promise<any>;
    handleClientUnloaded?(windowId: string, win: Window): void;
}

export interface SessionNonGlueData {
    windowId: string;
}

export interface SessionWindowData {
    windowId: string;
    name: string;
}

export interface WorkspaceWindowSession {
    windowId: string;
    frameId: string;
    initialTitle?: string;
}

export interface BridgeOperation {
    name: string;
    execute: (args: any, commandId: string) => Promise<any> | void;
    dataDecoder?: Decoder<any>;
    resultDecoder?: Decoder<any>;
}

export interface ModeExecutor {
    setup(): Promise<void>;
}

export interface ApplicationStartConfig {
    name: string;
    id?: string;
    context?: any;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    relativeTo?: string;
    relativeDirection?: "top" | "left" | "right" | "bottom";
    waitForAGMReady?: boolean;
}

export type SystemOperationTypes = "getEnvironment" | "getBase";

export interface ControlMessage extends Glue42WebPlatform.Plugins.ControlMessage {
    commandId?: string;
}
