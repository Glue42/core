/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import { Decoder } from "decoder-validate";
import { Glue42WebPlatform } from "../../platform";

export type Glue42API = Glue42.Glue;
export type Glue42Config = Glue42.Config;
export type LibDomains = "windows" | "appManager" | "layouts" | "workspaces";

export interface InternalWindowsConfig {
    windowResponseTimeoutMs: number;
    defaultWindowOpenBounds: Glue42Web.Windows.Bounds;
}

export interface InternalApplicationsConfig {
    mode: "local" | "remote" | "supplier";
    local: Array<Glue42WebPlatform.Applications.Glue42CoreDefinition | Glue42WebPlatform.Applications.FDC3Definition>;
    remote?: Glue42WebPlatform.RemoteStore;
    supplier?: Glue42WebPlatform.Supplier<Array<Glue42WebPlatform.Applications.Glue42CoreDefinition | Glue42WebPlatform.Applications.FDC3Definition>>;
}

export interface InternalLayoutsConfig {
    mode: "local" | "remote" | "supplier";
    local: Array<Glue42Web.Layouts.Layout>;
    remote?: Glue42WebPlatform.RemoteStore;
    supplier?: Glue42WebPlatform.Supplier<Array<Glue42Web.Layouts.Layout>>;
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
}

export interface CoreClientData {
    windowId: string;
    win: Window;
}

export interface LibController {
    start(config: InternalPlatformConfig): Promise<void>;
    handleControl(args: any): Promise<void>;
    handleClientUnloaded(windowId: string, win: Window): void;
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