import { Glue42Web } from "@glue42/web";

export type WindowOperationsTypes = "openWindow" |
    "windowHello" | "getUrl" | "getTitle" | "setTitle" |
    "moveResize" | "focus" | "close" | "getBounds" | "getFrameBounds" |
    "registerWorkspaceWindow" | "unregisterWorkspaceWindow";

export interface OpenWindowConfig {
    name: string;
    url: string;
    options?: Glue42Web.Windows.Settings;
}

export interface OpenWindowSuccess {
    windowId: string;
    name: string;
}

export interface HelloSuccess {
    windows: OpenWindowSuccess[];
    isWorkspaceFrame: boolean;
}

export interface SimpleWindowCommand {
    windowId: string;
}

export interface WindowTitleConfig {
    windowId: string;
    title: string;
}

export interface WindowMoveResizeConfig {
    windowId: string;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    relative?: boolean;
}

export interface WindowBoundsResult {
    windowId: string;
    bounds: Glue42Web.Windows.Bounds;
}

export interface FrameWindowBoundsResult {
    bounds: Glue42Web.Windows.Bounds;
}

export interface WindowUrlResult {
    windowId: string;
    url: string;
}
