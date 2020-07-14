import GoldenLayout from "@glue42/golden-layout";

export type ComponentState = GoldenLayout.Component["config"]["componentState"];

export type ParentItem = WorkspaceItem | RowItem | ColumnItem | GroupItem;

export type AnyItem = ParentItem | WindowItem;

export interface WorkspaceItem {
    id?: string;
    type?: "workspace";
    children: Array<RowItem | ColumnItem | GroupItem | WindowItem>;
    config?: {
        context?: object;
        [k: string]: object;
    };
}

export interface GroupItem {
    id?: string;
    type: "group";
    children: WindowItem[];
    config?: {
        [k: string]: object;
    };
}

export interface WindowItem {
    id: string;
    type: "window";
    config: {
        url: string;
        appName: string;
        windowId?: string;
        isMaximized: boolean;
        isLoaded: boolean;
        isFocused: boolean;
    };
}

export interface RowItem {
    id?: string;
    type: "row";
    children: Array<RowItem | ColumnItem | GroupItem | WindowItem>;
    config?: {
        [k: string]: object;
    };
}

export interface ColumnItem {
    id?: string;
    type: "column";
    children: Array<RowItem | ColumnItem | GroupItem | WindowItem>;
    config?: {
        [k: string]: object;
    };
}

export interface WorkspaceSummary {
    id: string;
    config: WorkspaceConfig;
}

export interface WorkspaceConfig {
    frameId: string;
    title: string;
    positionIndex: number;
    name: string;
}

export interface WindowSummary {
    itemId: string;
    parentId: string;
    config: {
        frameId: string;
        workspaceId: string;
        positionIndex: number;
        windowId?: string;
        isMaximized: boolean;
        isLoaded: boolean;
        isFocused: boolean;
        appName: string;
        url: string;
    };
}

export interface ContainerSummary {
    itemId: string;
    config: {
        frameId: string;
        workspaceId: string;
        positionIndex: number;
    };
}

export interface FrameSummary {
    id: string;
}

export interface WorkspaceSnapshot {
    id: string;
    config: object;
    children: object;
    frameSummary: FrameSummary;
}

export interface WindowAddedArgs {
    newWindow: Window;
    windows: Window[];
}

export interface Bounds {
    left: number;
    width: number;
    top: number;
    height: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Window {
    id: string;
    bounds?: Bounds;
    appName?: string;
    windowId?: string;
    url?: string;
}

export interface Workspace {
    id: string;
    windows: Window[];
    layout: GoldenLayout;
    context?: object;
}

export interface FrameLayoutConfig {
    workspaceLayout: GoldenLayout.Config;
    workspaceConfigs: Array<{ id: string; config: GoldenLayout.Config }>;
    frameId: string;
}

export interface WindowDefinition {
    appName?: string;
    url?: string;
    windowId?: string;
}

export interface StartupConfig {
    emptyFrame: boolean;
    disableCustomButtons: boolean;
    workspaceName?: string;
    workspaceNames?: string[];
    context?: object;
}

export type WorkspaceOptionsWithTitle = GoldenLayout.WorkspacesOptions & { title?: string };
export type LayoutWithMaximizedItem = GoldenLayout & { _maximizedItem?: GoldenLayout.ContentItem };
