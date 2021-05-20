/* eslint-disable @typescript-eslint/no-explicit-any */
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
    WorkspaceSelector,
    LockContainerArguments,
    LockWindowArguments,
    LockWorkspaceArguments,
    ResizeItemArguments,
} from "./types";
import manager from "../manager";
import store from "../state/store";
import { WorkspaceSummary, ColumnItem, RowItem, WorkspaceLayout, WorkspaceItem } from "../types/internal";
import GoldenLayout, { RowConfig, ColumnConfig } from "@glue42/golden-layout";
import { idAsString } from "../utils";
import { Glue42Web } from "@glue42/web";
import { EventActionType, EventPayload } from "../types/events";
import { WorkspacesConfigurationFactory } from "../config/factory";
import { ConfigConverter } from "../config/converter";
import { ConstraintsValidator } from "../config/constraintsValidator";
import { WorkspacesLocker } from "../locking";

declare const window: Window & { glue: Glue42Web.API };

export class GlueFacade {
    private readonly _workspacesControlMethod = "T42.Workspaces.Control";
    private readonly _workspacesEventMethod = "T42.Workspaces.Events";
    private _configFactory: WorkspacesConfigurationFactory;
    private _glue: Glue42Web.API;
    private _inDisposing = false;
    private _frameId: string;
    private _converter: ConfigConverter;
    private _constraintValidator: ConstraintsValidator;
    private _controlPromise: Promise<any> = Promise.resolve();
    private _locker: WorkspacesLocker;

    public async init(glue: Glue42Web.API, frameId: string): Promise<void> {
        this._frameId = frameId;
        this._glue = glue;
        this._configFactory = new WorkspacesConfigurationFactory(glue);
        this._converter = new ConfigConverter(this._configFactory);
        this._locker = new WorkspacesLocker(manager);
        this._constraintValidator = new ConstraintsValidator();

        if (this._glue) {
            await this.registerAgmMethods();
        }
    }

    public dispose(): void {
        this._inDisposing = true;
    }

    public subscribeForWorkspaceEvents(): void {
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

    public executeAfterControlIsDone(cb: () => Promise<void> | void): void {
        this._controlPromise.finally(() => {
            return cb();
        });
    }

    private async registerAgmMethods(): Promise<void> {
        await this._glue.agm.registerAsync({
            name: this._workspacesControlMethod
        }, this.handleControl);
    }

    private handleControlCore = async (args: ControlArguments, caller: object, successCallback: (result: object) => void, errorCallback: (error: string) => void) => {
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
                case "hibernateWorkspace":
                    await this.handleHibernateWorkspace(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "resumeWorkspace":
                    await this.handleResumeWorkspace(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "lockWorkspace":
                    this.handleLockWorkspace(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "lockContainer":
                    this.handleLockContainer(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "lockWindow":
                    this.handleLockWindow(args.operationArguments);
                    successCallback(undefined);
                    break;
                case "resizeItem":
                    this.handleResizeItem(args.operationArguments);
                    successCallback(undefined);
                    break;
                default:
                    errorCallback(`Invalid operation - ${((args as unknown) as { operation: string }).operation}`);
            }

        } catch (error) {
            errorCallback(error.message);
            console.warn(error);
        }
    };

    private handleControl = async (args: ControlArguments, caller: object, successCallback: (result: object) => void, errorCallback: (error: string) => void): Promise<void> => {
        const controlPromise = this.handleControlCore(args, caller, successCallback, errorCallback);
        this._controlPromise = controlPromise;
        await controlPromise;
    };

    private async handleOpenWorkspace(operationArguments: OpenWorkspaceArguments): Promise<OpenWorkspaceResult> {
        const id = await manager.openWorkspace(operationArguments.name, operationArguments.restoreOptions);
        const workspaceConfig = manager.stateResolver.getWorkspaceConfig(id);
        const workspaceItem = this._converter.convertToAPIConfig(workspaceConfig) as WorkspaceItem;

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
        const workspaceItem = this._converter.convertToAPIConfig(workspaceConfig);
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
        if (operationArguments.definition.type === "workspace") {
            throw new Error(`Unsuported add container type ${operationArguments.definition.type}`);
        }

        const workspace = store.getByContainerId(operationArguments.parentId) || store.getById(operationArguments.parentId);
        const workspaceItem = this._converter.convertToAPIConfig(manager.stateResolver.getWorkspaceConfig(workspace.id)) as WorkspaceItem;
        this._constraintValidator.fixNewContainer(operationArguments.definition, workspaceItem, operationArguments.parentId);
        const rendererFriendlyConfig = this._converter.convertToRendererConfig(operationArguments.definition);

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

        const workspaceItemAferAdd = this._converter.convertToAPIConfig(manager.stateResolver.getWorkspaceConfig(workspace.id)) as WorkspaceItem;

        this._locker.applyContainerLockConfiguration(operationArguments.definition, workspaceItemAferAdd, itemId);

        return {
            itemId
        };
    }

    private async handleAddWindow(operationArguments: AddWindowArguments): Promise<AddItemResult> {
        const constraintsValidator = new ConstraintsValidator();
        const workspace = store.getByContainerId(operationArguments.parentId) || store.getById(operationArguments.parentId);
        const workspaceItem = this._converter.convertToAPIConfig(manager.stateResolver.getWorkspaceConfig(workspace.id)) as WorkspaceItem;
        constraintsValidator.fixNewWindow(operationArguments.definition as any, workspaceItem, operationArguments.parentId);
        const windowConfig = this._configFactory.createGDWindowConfig({
            windowId: operationArguments.definition.windowId,
            id: undefined,
            appName: operationArguments.definition.appName,
            url: operationArguments.definition.url,
            context: operationArguments.definition.context,
            allowExtract: operationArguments.definition.config?.allowExtract,
            showCloseButton: operationArguments.definition.config?.showCloseButton,
            minWidth: operationArguments.definition.config?.minWidth,
            maxWidth: operationArguments.definition.config?.maxWidth,
            minHeight: operationArguments.definition.config?.minHeight,
            maxHeight: operationArguments.definition.config?.maxHeight,
        });

        if (operationArguments.definition.windowId) {
            const win = this._glue.windows.list().find((w) => w.id === operationArguments.definition.windowId);
            const url = await win.getURL();

            windowConfig.componentState.url = url;
            windowConfig.componentState.appName = this._configFactory.getAppNameFromWindowId(win.id);
        }

        await manager.addWindow(windowConfig, operationArguments.parentId);
        const notLoadedSummary = manager.stateResolver.getWindowSummarySync(windowConfig.id);
        this._locker.applyWindowLockConfiguration(notLoadedSummary);

        return {
            itemId: idAsString(windowConfig.id),
        };
    }

    private handleSetItemTitle(operationArguments: SetItemTitleArguments): void {
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
        const convertedConfig = this._converter.convertToRendererConfig(itemConfig);
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
        if (!operationArguments.config) {
            operationArguments.config = {};
        }
        operationArguments.config.context = operationArguments.config.context || operationArguments.context;
        operationArguments.config.allowDrop = undefined; // The property isn't supported in core

        this._constraintValidator.fixWorkspace(operationArguments);

        const config = this._converter.convertToRendererConfig(operationArguments);
        const workspaceId = await manager.createWorkspace(config as GoldenLayout.Config);
        const apiConfig = this._converter.convertToAPIConfig(manager.stateResolver.getWorkspaceConfig(workspaceId)) as WorkspaceItem;

        this._locker.applyLockConfiguration(operationArguments, apiConfig);

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

    private handleFocusItem(operationArguments: ItemSelector): Promise<void> {
        return manager.focusItem(operationArguments.itemId);
    }

    private handleBundleWorkspace(operationArguments: BundleWorkspaceArguments): void {
        return manager.bundleWorkspace(operationArguments.workspaceId, operationArguments.type);
    }

    private handleIsWindowInWorkspace(operationArguments: ItemSelector): { inWorkspace: boolean } {
        return {
            inWorkspace: manager.stateResolver.isWindowInWorkspace(operationArguments.itemId)
        };
    }

    private handleGetFrameSummary(operationArguments: ItemSelector): { id: string } {
        return manager.getFrameSummary(operationArguments.itemId);
    }

    private async handleMoveFrame(operationArguments: MoveFrameArguments): Promise<void> {
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

    private async handleHibernateWorkspace(operationArguments: WorkspaceSelector) {
        return manager.hibernateWorkspace(operationArguments.workspaceId);
    }

    private async handleResumeWorkspace(operationArguments: WorkspaceSelector) {
        return manager.resumeWorkspace(operationArguments.workspaceId);
    }

    private handleLockWorkspace(operationArguments: LockWorkspaceArguments) {
        return manager.lockWorkspace(operationArguments);
    }

    private handleLockWindow(operationArguments: LockWindowArguments) {
        return manager.lockWindow(operationArguments);
    }

    private handleLockContainer(operationArguments: LockContainerArguments) {
        return manager.lockContainer(operationArguments);
    }

    private handleResizeItem(operationArguments: ResizeItemArguments) {
        return manager.resizeItem(operationArguments);
    }

    private publishEventData(action: EventActionType, payload: EventPayload, type: "workspace" | "frame" | "box" | "window") {
        const hasEventMethod = this._glue.agm.methods().some(m => m.name === this._workspacesEventMethod);

        if (hasEventMethod) {
            const methodPayload = {
                action,
                type,
                payload
            };

            this._glue.agm.invoke(this._workspacesEventMethod, methodPayload).catch(() => {
                // console.warn(`Could not push data to ${this._workspacesEventMethod} because ${e.message}`);
            });
        }
    }
}

export default new GlueFacade();
