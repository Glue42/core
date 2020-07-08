import GoldenLayout from "golden-layout";
import { Bounds, Workspace, Window } from "../types/internal";
import { CallbackRegistry } from "callback-registry";

export class LayoutEventEmitter {
    private readonly _registry: CallbackRegistry;

    constructor(registry: CallbackRegistry) {
        this._registry = registry;
    }

    public onWorkspaceLayoutInit(callback: () => void): () => void {
        return this._registry.add("workspace-layout-initialised", callback);
    }

    public onContentLayoutInit(callback: (layout: GoldenLayout) => void): () => void {
        return this._registry.add("content-layout-init", callback);
    }

    public onOuterLayoutContainerResized(callback: (target: Element) => void): () => void {
        return this._registry.add("outer-layout-container-resized", callback);
    }

    public onContentContainerResized(callback: (target: GoldenLayout.ContentItem, id?: string) => void, id?: string): () => void {
        if (id) {
            return this._registry.add(`workspace-content-container-resized-${id}`, callback);
        }

        return this._registry.add("workspace-content-container-resized", callback);
    }

    public onContentItemResized(callback: (target: Element, id: string) => void): () => void {
        return this._registry.add("content-item-resized", callback);
    }

    public onContentComponentCreated(callback: (component: GoldenLayout.Component, workspaceId: string) => void) {
        return this._registry.add("content-component-created", callback);
    }

    public onFrameCloseRequested(callback: () => void): () => void {
        return this._registry.add("close-frame", callback);
    }

    public onRestoreRequested(callback: () => void): () => void {
        return this._registry.add("restore-frame", callback);
    }

    public onMaximizeRequested(callback: () => void): () => void {
        return this._registry.add("maximize-frame", callback);
    }

    public onMinimizeRequested(callback: () => void): () => void {
        return this._registry.add("minimize-frame", callback);
    }

    public onMoveAreaChanged(callback: (target: Element) => void): () => void {
        return this._registry.add("move-area-changed", callback);
    }

    public onTabCloseRequested(callback: (item: GoldenLayout.ContentItem) => void): () => void {
        return this._registry.add("tab-close-requested", callback);
    }

    public onTabDragStart(callback: (tab: GoldenLayout.Tab) => void): () => void {
        return this._registry.add("tab-drag-start", callback);
    }

    public onTabDrag(callback: (tab: GoldenLayout.Tab) => void): () => void {
        return this._registry.add("tab-drag", callback);
    }

    public onTabDragEnd(callback: (tab: GoldenLayout.Tab) => void): () => void {
        return this._registry.add("tab-drag-end", callback);
    }

    public onTabElementMouseDown(callback: (tab: GoldenLayout.Tab) => void) {
        return this._registry.add("tab-element-mouse-down", callback);
    }

    public onSelectionChanged(callback: (toBack: Array<{ id: string; bounds: Bounds }>, toFront: Array<{ id: string; bounds: Bounds }>) => void) {
        return this._registry.add("selection-changed", callback);
    }

    public onWorkspaceAdded(callback: (workspace: Workspace) => void) {
        return this._registry.add("workspace-added", callback);
    }

    public onWorkspaceSelectionChanged(callback: (workspace: Workspace, toBack: Window[]) => void) {
        return this._registry.add("workspace-selection-changed", callback);
    }

    public onWorkspaceTabCloseRequested(callback: (workspace: Workspace) => void): () => void {
        return this._registry.add("workspace-tab-close-requested", callback);
    }

    public onAddButtonClicked(callback: (args: { laneId: string; workspaceId: string; bounds: Bounds; parentType: string }) => void): () => void {
        return this._registry.add("add-button-clicked", callback);
    }

    public onContentLayoutStateChanged(callback: (layoutId: string) => void): () => void {
        return this._registry.add("content-layout-state-changed", callback);
    }

    public onContentItemCreated(callback: (workspaceId: string, item: GoldenLayout.ContentItem) => void) {
        return this._registry.add("content-item-created", callback);
    }

    public onWorkspaceAddButtonClicked(callback: () => void) {
        return this._registry.add("workspace-add-button-clicked", callback);
    }

    public onWorkspaceSaveRequested(callback: (workspaceId: string) => void) {
        return this._registry.add("workspace-save-requested", callback);
    }

    public onStackMaximized(callback: (stack: GoldenLayout.ContentItem) => void) {
        return this._registry.add("stack-maximized", callback);
    }

    public onStackRestored(callback: (stack: GoldenLayout.ContentItem) => void) {
        return this._registry.add("stack-restored", callback);
    }

    public onEjectRequested(callback: (item: GoldenLayout.ContentItem) => void) {
        return this._registry.add("eject-requested", callback);
    }

    public raiseEvent(name: "stack-maximized" | "stack-restored", data: { stack: GoldenLayout.ContentItem }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "workspace-save-requested", data: { workspaceId: string }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "workspace-selection-changed", data: { workspace: Workspace; toBack: Window[] }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "content-item-created", data: { workspaceId: string; item: GoldenLayout.ContentItem }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "content-component-created", data: { component: GoldenLayout.ContentItem; workspaceId: string }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "content-layout-state-changed", data: { layoutId: string }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "add-button-clicked", data: { args: { laneId: string; workspaceId: string; bounds: Bounds; parentType?: string } }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "workspace-tab-close-requested" | "workspace-added", data: { workspace: Workspace }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "selection-changed", data: { toBack: Window[]; toFront: Window[] }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "tab-drag-start" | "tab-drag" | "tab-drag-end" | "tab-element-mouse-down", data: { tab: GoldenLayout.Tab }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "tab-close-requested" | "eject-requested", data: { item: GoldenLayout.ContentItem }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "content-item-resized", data: { target: Element; id: string }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "workspace-content-container-resized", data: { target: GoldenLayout.ContentItem; id?: string }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "outer-layout-container-resized" | "move-area-changed", data: { target: Element }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "content-layout-init", data: { layout: GoldenLayout }): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: "workspace-layout-initialised" | "close-frame" | "restore-frame" | "maximize-frame" | "minimize-frame" | "workspace-add-button-clicked", data: {}): Promise<void> | Array<Promise<void>>;
    public raiseEvent(name: string, data: object): Promise<void> | Array<Promise<void>> {
        const result = this._registry.execute(name, ...Object.values(data));

        if ((Array.isArray(result) && result.some((r) => r && (r as Promise<object>).then)) ||
            (result && !Array.isArray(result) && (result as Promise<object>).then)) {
            return (result as Array<Promise<unknown>>) as Array<Promise<void>>;
        }

        return (Promise.resolve(result) as Promise<unknown>) as Promise<void>;
    }

    public raiseEventWithDynamicName(name: string, ...args: object[]) {
        this._registry.execute(name, ...args);
    }
}
