import { Glue42Web } from "../../web";
import { openWindowConfigDecoder, coreWindowDataDecoder, windowHelloDecoder, helloSuccessDecoder, simpleWindowDecoder, windowBoundsResultDecoder, windowUrlResultDecoder, windowMoveResizeConfigDecoder, windowTitleConfigDecoder, frameWindowBoundsResultDecoder } from "../shared/decoders";
import { BridgeOperation } from "../shared/types";
import { WebWindowModel } from "./webWindow";

export type WindowOperationTypes = "openWindow" | "getBounds" | "getFrameBounds" |
    "windowHello" | "windowAdded" | "windowRemoved" | "getUrl" |
    "moveResize" | "focus" | "close" | "getTitle" | "setTitle";

export const operations: { [key in WindowOperationTypes]: BridgeOperation } = {
    openWindow: { name: "openWindow", dataDecoder: openWindowConfigDecoder, resultDecoder: coreWindowDataDecoder },
    windowHello: { name: "windowHello", dataDecoder: windowHelloDecoder, resultDecoder: helloSuccessDecoder },
    windowAdded: { name: "windowAdded", dataDecoder: coreWindowDataDecoder },
    windowRemoved: { name: "windowRemoved", dataDecoder: simpleWindowDecoder },
    getBounds: { name: "getBounds", dataDecoder: simpleWindowDecoder, resultDecoder: windowBoundsResultDecoder },
    getFrameBounds: { name: "getFrameBounds", dataDecoder: simpleWindowDecoder, resultDecoder: frameWindowBoundsResultDecoder },
    getUrl: { name: "getUrl", dataDecoder: simpleWindowDecoder, resultDecoder: windowUrlResultDecoder },
    moveResize: { name: "moveResize", dataDecoder: windowMoveResizeConfigDecoder },
    focus: { name: "focus", dataDecoder: simpleWindowDecoder },
    close: { name: "close", dataDecoder: simpleWindowDecoder },
    getTitle: { name: "getTitle", dataDecoder: simpleWindowDecoder, resultDecoder: windowTitleConfigDecoder },
    setTitle: { name: "setTitle", dataDecoder: windowTitleConfigDecoder }
};

export interface WindowProjection {
    id: string;
    model: WebWindowModel;
    api: Glue42Web.Windows.WebWindow;
}

export interface WindowHello {
    windowId?: string;
}

export interface OpenWindowConfig {
    name: string;
    url: string;
    options?: Glue42Web.Windows.Settings;
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

export interface HelloSuccess {
    windows: CoreWindowData[];
    isWorkspaceFrame: boolean;
}

export interface CoreWindowData {
    windowId: string;
    name: string;
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
