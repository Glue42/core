/*eslint indent: [2, 4, {"SwitchCase": 1}]*/
import {
    ControlArguments,
    OpenWorkspaceArguments,
    LayoutSelector,
    SaveLayoutArguments,
    OpenWorkspaceResult,
    GetWorkspaceSnapshotResult,
    ItemSelector,
    CloseItemResult,
    RestoreItemResult,
    MaximizeItemResult,
    AddContainerArguments,
    AddWindowArguments,
    AddItemResult,
    SetItemTitleArguments,
    AddWorkspaceChildrenResult,
    AddWorkspaceChildrenArguments,
    CreateWorkspaceArguments,
    BundleWorkspaceArguments,
    MoveFrameArguments,
    MoveWindowToArguments,
    GenerateLayoutArguments,
} from "./types";
import manager from "../manager";
import store from "../store";
import { WorkspaceSummary, ColumnItem, RowItem, WorkspaceLayout, WorkspaceItem } from "../types/internal";
import configConverter from "../config/converter";
import configFactory from "../config/factory";
import GoldenLayout, { RowConfig, ColumnConfig } from "@glue42/golden-layout";
import { idAsString } from "../utils";
import converter from "../config/converter";
import { Glue42Web } from "@glue42/web";
import factory from "../config/factory";
import { EventActionType, EventPayload } from "../types/events";

declare const window: Window & { glue: Glue42Web.API };

class GlueFacade {
    private readonly _workspacesControlMethod = "T42.Workspaces.Control";
    private readonly _workspacesEventMethod = "T42.Workspaces.Events";
    private _inDisposing = false;

    private _frameId: string;

    public async init(frameId: string): Promise<void> {
        this._frameId = frameId;
        if (window.glue) {
            await this.registerAgmMethods();
        }
    }

    public dispose() {
        this._inDisposing = true;
    }

    public subscribeForWorkspaceEvents() {
        manager.workspacesEventEmitter.onFrameEvent((action, payload) => {
            this.publishEventData(action, payload, "frame");
        });

        manager.workspacesEventEmitter.onWindowEvent((action, payload) => {
            this.publishEventData(action, payload, "window");
        });

        manager.workspacesEventEmitter.onWorkspaceEvent((action, payload) => {
            this.publishEventData(action, payload, "workspace");
        });

        manager.workspacesEventEmitter.onContainerEvent((action, payload) => {
            this.publishEventData(action, payload, "box");
        });
    }

    private async registerAgmMethods(): Promise<void> {
        await window.glue.agm.registerAsync({
            name: this._workspacesControlMethod
        }, this.handleControl);
    }

    private handleControl = async (args: ControlArguments, caller: object, successCallback: (result: object) => void, errorCallback: (error: string) => void) => {
        try {
            await manager.initPromise;

            switch (args.operation) {
                case "isWindowInWorkspace":
                    successCallback(this.handleIsWindowInWorkspace(args.operationArguments));
                    break;
                case "addWindow":
                    successCallback(await this.handleAddWindow(args.operationArguments));
                    break;
                case "addContainer":
                    successCallback(await this.handleAddContainer(args.operationArguments));
                    break;
                case "getWorkspaceSnapshot":
                    successCallback(this.handleGetWorkspaceSnapshot(args.operationArguments));
                    break;
                case "openWorkspace":
                    successCallback(await this.handleOpenWorkspace(args.operationArguments));
                    break;
                case "saveLayout":
                    successCallback(await this.handleSaveLayout(args.operationArguments));
                    break;
                case "exportAllLayouts":
                    successCallback(await this.handleExportAllLayouts());
                    break;
                case "deleteLayout":
                    this.handleDeleteLayout(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "getAllWorkspacesSummaries":
                    successCallback(this.handleGetAllWorkspaceSummaries());
                    break;
                case "maximizeItem":
                    this.handleMaximizeItem(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "restoreItem":
                    this.handleRestoreItem(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "closeItem":
                    this.handleCloseItem(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "setItemTitle":
                    await this.handleSetItemTitle(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "addWorkspaceChildren":
                    await this.handleAddWorkspaceChildren(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "ejectWindow":
                    successCallback(await this.handleEject(args.operationArguments));
                    break;
                case "createWorkspace":
                    successCallback(await this.handleCreateWorkspace(args.operationArguments));
                    break;
                case "forceLoadWindow":
                    successCallback(await this.handleForceLoadWindow(args.operationArguments));
                    break;
                case "focusItem":
                    await this.handleFocusItem(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "bundleWorkspace":
                    this.handleBundleWorkspace(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "getFrameSummary":
                    successCallback(await this.handleGetFrameSummary(args.operationArguments));
                    break;
                case "moveFrame":
                    await this.handleMoveFrame(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "getFrameSnapshot":
                    successCallback(await this.handleGetFrameSnapshot());
                    break;
                case "getSnapshot":
                    successCallback(await this.handleGetSnapshot(args.operationArguments));
                    break;
                case "moveWindowTo":
                    await this.handleMoveWindowTo(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "generateLayout":
                    successCallback(await this.handleGenerateLayout(args.operationArguments));
                    break;
                case "ping":
                    successCallback(this.handlePing());
                    break;
                default:
                    errorCallback(`Invalid operation - ${((args as unknown) as { operation: string }).operation}`);
            }

        } catch (error) {
            errorCallback(error.message);
        }
    }

    private async handleOpenWorkspace(operationArguments: OpenWorkspaceArguments): Promise<OpenWorkspaceResult> {
        const id = await manager.openWorkspace(operationArguments.name, operationArguments.restoreOptions);
        const workspaceConfig = manager.stateResolver.getWorkspaceConfig(id);
        const workspaceItem = configConverter.convertToAPIConfig(workspaceConfig) as WorkspaceItem;

        return {
            id: workspaceItem.id,
            children: workspaceItem.children,
            config: workspaceItem.config,
            frameSummary: {
                id: this._frameId
            }
        };
    }

    private async handleExportAllLayouts() {
        const layouts = await manager.exportAllLayouts();
        return {
            layouts
        };
    }

    private async handleSaveLayout(operationArguments: SaveLayoutArguments): Promise<WorkspaceLayout> {
        return await manager.saveWorkspace(
            operationArguments.name,
            operationArguments.workspaceId,
            operationArguments.saveContext);
    }

    private handleDeleteLayout(operationArguments: LayoutSelector): void {
        manager.deleteLayout(operationArguments.name);
    }

    private handleGetWorkspaceSnapshot(operationArguments: ItemSelector): GetWorkspaceSnapshotResult {
        const workspace = store.getById(operationArguments.itemId);
        const workspaceConfig = manager.stateResolver.getWorkspaceConfig(workspace.id);
        const workspaceItem = configConverter.convertToAPIConfig(workspaceConfig);
        return {
            id: workspaceItem.id,
            children: workspaceItem.children,
            config: workspaceItem.config,
            frameSummary: {
                id: this._frameId
            }
        };
    }

    private handleGetAllWorkspaceSummaries() {
        const summaries = store.layouts.map((w) => {
            const summary: WorkspaceSummary = manager.stateResolver.getWorkspaceSummary(w.id);

            return summary;
        });

        return {
            summaries
        };
    }

    private handleCloseItem(operationArguments: ItemSelector): CloseItemResult {
        manager.closeItem(operationArguments.itemId);
    }
    private handleRestoreItem(operationArguments: ItemSelector): RestoreItemResult {
        manager.restoreItem(operationArguments.itemId);
    }
    private handleMaximizeItem(operationArguments: ItemSelector): MaximizeItemResult {
        manager.maximizeItem(operationArguments.itemId);
    }

    private async handleAddContainer(operationArguments: AddContainerArguments): Promise<AddItemResult> {
        const rendererFriendlyConfig = configConverter.convertToRendererConfig(operationArguments.definition);

        if (rendererFriendlyConfig.type === "workspace") {
            throw new Error("Unsuccessful conversion");
        }
        const containerDefinition = {
            id: idAsString(rendererFriendlyConfig.id),
            content: rendererFriendlyConfig.content,
            type: rendererFriendlyConfig.type,
            workspacesConfig: rendererFriendlyConfig.workspacesConfig
        };
        const itemId = await manager.addContainer(containerDefinition,
            operationArguments.parentId);

        return {
            itemId
        };
    }

    private async handleAddWindow(operationArguments: AddWindowArguments): Promise<AddItemResult> {
        const windowConfig = configFactory.createGDWindowConfig({
            windowId: operationArguments.definition.windowId,
            id: undefined,
            appName: operationArguments.definition.appName,
            url: operationArguments.definition.url,
            context: operationArguments.definition.context
        });

        if (operationArguments.definition.windowId) {
            const win = window.glue.windows.list().find((w) => w.id === operationArguments.definition.windowId);
            const url = await win.getURL();

            windowConfig.componentState.url = url;
            windowConfig.componentState.appName = factory.getAppNameFromWindowId(win.id);
        }

        await manager.addWindow(windowConfig, operationArguments.parentId);

        return {
            itemId: idAsString(windowConfig.id),
        };
    }

    private handleSetItemTitle(operationArguments: SetItemTitleArguments) {
        manager.setItemTitle(operationArguments.itemId, operationArguments.title);
    }

    private async handleAddWorkspaceChildren(operationArguments: AddWorkspaceChildrenArguments): Promise<AddWorkspaceChildrenResult> {
        const hasRows = operationArguments.children.some((c) => c.type === "row");
        const hasColumns = operationArguments.children.some((c) => c.type === "column");

        if (hasColumns && hasRows) {
            throw new Error("Can't add both row and column workspace children");
        }

        let itemConfig: ColumnItem | RowItem = {
            type: "column",
            children: operationArguments.children
        };
        if (hasColumns) {
            itemConfig = {
                type: "row",
                children: operationArguments.children
            };
        }
        const convertedConfig = configConverter.convertToRendererConfig(itemConfig);
        await manager.addContainer(convertedConfig as RowConfig | ColumnConfig, operationArguments.workspaceId);

    }

    private async handleEject(operationArguments: ItemSelector) {
        const item = store.getWindowContentItem(operationArguments.itemId);
        if (!item) {
            throw new Error(`Could not find item ${operationArguments.itemId}`);
        }
        return await manager.eject(item);
    }

    private async handleCreateWorkspace(operationArguments: CreateWorkspaceArguments) {
        const config = configConverter.convertToRendererConfig(operationArguments);
        const workspaceId = await manager.createWorkspace(config as GoldenLayout.Config);

        const apiConfig = converter.convertToAPIConfig(manager.stateResolver.getWorkspaceConfig(workspaceId));

        return {
            id: apiConfig.id,
            children: apiConfig.children,
            config: apiConfig.config,
            frameSummary: {
                id: this._frameId
            }
        };
    }

    private async handleForceLoadWindow(operationArguments: ItemSelector): Promise<{ windowId: string }> {
        return await manager.loadWindow(operationArguments.itemId);
    }

    private handleFocusItem(operationArguments: ItemSelector) {
        return manager.focusItem(operationArguments.itemId);
    }

    private handleBundleWorkspace(operationArguments: BundleWorkspaceArguments) {
        return manager.bundleWorkspace(operationArguments.workspaceId, operationArguments.type);
    }

    private handleIsWindowInWorkspace(operationArguments: ItemSelector): { inWorkspace: boolean } {
        return {
            inWorkspace: manager.stateResolver.isWindowInWorkspace(operationArguments.itemId)
        };
    }

    private async handleGetFrameSummary(operationArguments: ItemSelector) {
        return manager.getFrameSummary(operationArguments.itemId);
    }

    private async handleMoveFrame(operationArguments: MoveFrameArguments) {
        await manager.move(operationArguments.location);
    }

    private handleGetFrameSnapshot() {
        return manager.stateResolver.getFrameSnapshot();
    }

    private async handleGetSnapshot(operationArguments: ItemSelector) {
        const snapshot = manager.stateResolver.getSnapshot(operationArguments.itemId);
        return snapshot;
    }

    private async handleMoveWindowTo(operationArguments: MoveWindowToArguments) {
        return manager.moveWindowTo(operationArguments.itemId, operationArguments.containerId);
    }

    private handleGenerateLayout(operationArguments: GenerateLayoutArguments) {
        return manager.generateWorkspaceLayout(operationArguments.name, operationArguments.workspaceId);
    }

    private handlePing() {
        return { live: !this._inDisposing };
    }

    private publishEventData(action: EventActionType, payload: EventPayload, type: "workspace" | "frame" | "box" | "window") {
        const hasEventMethod = window.glue.agm.methods().some(m => m.name === this._workspacesEventMethod);

        if (hasEventMethod) {

            const methodPayload = {
                action,
                type,
                payload
            };
            window.glue.agm.invoke(this._workspacesEventMethod, methodPayload, "all").catch(() => {
                // console.warn(`Could not push data to ${this._workspacesEventMethod} because ${e.message}`);
            });
        }
    }
}

export default new GlueFacade();
