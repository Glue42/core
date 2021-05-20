import GoldenLayout from "@glue42/golden-layout";

export type ComponentState = GoldenLayout.Component["config"]["componentState"];

export type ParentItem = WorkspaceItem | RowItem | ColumnItem | GroupItem;

export type AnyItem = ParentItem | WindowItem;

export interface WorkspaceItem {
    id?: string;
    type?: "workspace";
    children: Array<RowItem | ColumnItem | GroupItem | WindowItem>;
    config?: {
        name?: string;
        context?: object;
        reuseWorkspaceId?: string;
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
        allowDrop?: boolean;
        allowExtract?: boolean;
        showEjectButtons?: boolean;
        allowSplitters?: boolean;
        showWindowCloseButtons?: boolean;
        showAddWindowButtons?: boolean;
        [k: string]: any;
    };
}

export interface GroupItem {
    id?: string;
    type: "group";
    children: WindowItem[];
    config?: {
        allowDrop?: boolean;
        allowExtract?: boolean;
        showEjectButton?: boolean;
        showMaximizeButton?: boolean;
        showAddWindowButton?: boolean;
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
        [k: string]: any;
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
        workspaceId?: string;
        frameId?: string;
        positionIndex?: number;
        title?: string;
        context?: string;
        allowExtract?: boolean;
        showCloseButton?: boolean;
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
    };
}

export interface RowItem {
    id?: string;
    type: "row";
    children: Array<RowItem | ColumnItem | GroupItem | WindowItem>;
    config?: {
        allowDrop?: boolean;
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
        [k: string]: any;
    };
}

export interface ColumnItem {
    id?: string;
    type: "column";
    children: Array<RowItem | ColumnItem | GroupItem | WindowItem>;
    config?: {
        allowDrop?: boolean;
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
        [k: string]: any;
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
    layoutName?: string;
    isHibernated: boolean;
    isSelected: boolean;
    lastActive: number;
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
        allowExtract?: boolean;
        showCloseButton?: boolean;
        title: string;
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        widthInPx: number;
        heightInPx: number;
    };
}

export interface ContainerSummary {
    itemId: string;
    type: "group" | "column" | "row" | "workspace";
    config: {
        frameId: string;
        workspaceId: string;
        positionIndex: number;
        allowDrop: boolean;
        allowExtract?: boolean;
        showMaximizeButton?: boolean;
        showEjectButton?: boolean;
        showAddWindowButton?: boolean;
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
        widthInPx?: number;
        heightInPx?: number;
        isPinned?: boolean;
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
    hibernatedWindows: Window[];
    layout: GoldenLayout;
    hibernateConfig?: GoldenLayout.Config;
    context?: object;
    lastActive: number;
}

export interface WorkspaceLayout {
    name: string;
    type: "Workspace";
    metadata?: object;
    components: Array<{ type: "Workspace"; state: WorkspaceItem }>;
}

export interface FrameLayoutConfig {
    workspaceLayout: GoldenLayout.Config;
    workspaceConfigs: Array<{ id: string; config: GoldenLayout.Config }>;
    frameId: string;
    showLoadingIndicator?: boolean;
}

export interface WindowDefinition {
    appName?: string;
    url?: string;
    windowId?: string;
    context?: object;
    config?: {
        showCloseButton?: boolean;
        allowExtract?: boolean;
        minWidth?: number;
        minHeight?: number;
        maxWidth?: number;
        maxHeight?: number;
    };
}

export interface StartupConfig {
    emptyFrame: boolean;
    disableCustomButtons: boolean;
    workspaceName?: string;
    workspaceNames?: string[];
    context?: object;
    build: boolean;
}


export interface APIWIndowSettings {
    id: string | string[];
    windowId: string;
    isMaximized: boolean;
    isFocused: boolean;
    appName?: string;
    url?: string;
    workspaceId: string;
    frameId: string;
    title: string;
    positionIndex: number;
    allowExtract: boolean;
    showCloseButton: boolean;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    widthInPx: number;
    heightInPx: number;
}

export interface GDWindowOptions {
    windowId: string;
    id?: string;
    appName?: string;
    url?: string;
    title?: string;
    context?: object;
    allowExtract: boolean;
    showCloseButton: boolean;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
}

export interface SavedConfigWithData {
    config: GoldenLayout.Config;
    layoutData: {
        metadata: object;
        name: string;
        context: object;
    };
}

export interface SaveWorkspaceConfig {
    title?: string;
    workspace: Workspace;
    name: string;
    saveContext: boolean;
}

export interface WorkspaceDropOptions {
    allowDrop?: boolean;
    allowDropLeft?: boolean;
    allowDropTop?: boolean;
    allowDropRight?: boolean;
    allowDropBottom?: boolean;
}

export interface ComponentFactory {
    createLogo?: (options: { domNode: HTMLElement }, frameId: string) => void;
    createAddWorkspace?: (options: { domNode: HTMLElement }, frameId: string) => void;
    createSystemButtons?: (options: { domNode: HTMLElement }, frameId: string) => void;
    createWorkspaceContents?: (options: { domNode: HTMLElement, workspaceId: string }) => void;
    createAddApplicationPopup?: (options: AddApplicationPopupOptions) => void;
    createSaveWorkspacePopup?: (options: SaveWorkspacePopupOptions) => void;
    createAddWorkspacePopup?: (options: OpenWorkspacePopupOptions) => void;

    hideSystemPopups?: (cb: () => void) => void;
}

export interface DecoratedComponentFactory {
    createLogo?: (options: { domNode: HTMLElement }) => void;
    createAddWorkspace?: (options: { domNode: HTMLElement }) => void;
    createSystemButtons?: (options: { domNode: HTMLElement }) => void;
    createWorkspaceContents?: (options: { domNode: HTMLElement, workspaceId: string }) => void;
    createAddApplicationPopup?: (options: AddApplicationPopupOptions) => void;
    createSaveWorkspacePopup?: (options: SaveWorkspacePopupOptions) => void;
    createAddWorkspacePopup?: (options: OpenWorkspacePopupOptions) => void;

    hideSystemPopups?: (cb: () => void) => void;
}

interface BasePayloadOptions {
    domNode: HTMLElement;
    resizePopup: (size: any) => void;
    hidePopup: () => void;
    callback?: () => void;
    frameId: string;
}

export interface AddApplicationPopupOptions extends BasePayloadOptions {
    boxId: string;
    workspaceId: string;
    parentType?: string;
}

export interface SaveWorkspacePopupOptions extends BasePayloadOptions {
    workspaceId: string;
    buildMode: boolean;
}

// tslint:disable-next-line: no-empty-interface
export interface OpenWorkspacePopupOptions extends BasePayloadOptions {
}

export interface VisibilityState {
    logo: [options: { domNode: HTMLElement }, frameId: string],
    addWorkspace: [options: { domNode: HTMLElement }, frameId: string],
    systemButtons: [options: { domNode: HTMLElement }, frameId: string],
    workspaceContents: Array<[options: { domNode: HTMLElement, workspaceId: string }]>
}

export type WorkspaceOptionsWithTitle = GoldenLayout.WorkspacesOptions & { title?: string };
export type WorkspaceOptionsWithLayoutName = GoldenLayout.WorkspacesOptions & { layoutName?: string };
export type LayoutWithMaximizedItem = GoldenLayout & { _maximizedItem?: GoldenLayout.ContentItem };

export interface MaximumActiveWorkspacesRule {
    threshold: number;
}

export interface IdleWorkspacesRule {
    idleMSThreshold: number;
}

export interface WorkspacesHibernationConfig {
    maximumActiveWorkspaces?: MaximumActiveWorkspacesRule;
    idleWorkspaces?: IdleWorkspacesRule;
}

export type LoadingStrategy = "direct" | "delayed" | "lazy";

export interface WorkspacesLoadingConfig {
    /**
     * Default restore strategy when restoring Swimlane workspaces.
     */
    defaultStrategy?: LoadingStrategy;
    delayed: {
        /**
         * Valid only in `delayed` mode. Initial period after which to start loading applications in batches.
         */
        initialOffsetInterval?: number;
        /**
         * Valid only in `delayed` mode. Interval in minutes at which to load the application batches.
         */
        interval?: number;
        /**
         * Valid only in `delayed` mode. Number of applications in a batch to be loaded at each interval.
         */
        batch?: number;
    }
    /**
     * Visual indicator `Zzz` on tabs of apps which are not loaded yet. Useful for developing and testing purposes.
     */
    showDelayedIndicator?: boolean;
}

export interface WorkspacesSystemConfig {
    src: string;
    hibernation?: WorkspacesHibernationConfig;
    loadingStrategy?: WorkspacesLoadingConfig;
}

export interface Constraints {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
}
