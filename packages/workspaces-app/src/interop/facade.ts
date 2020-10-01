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

declare const window: Window & { glue: Glue42Web.API };

class GlueFacade {
    private readonly _workspacesWindowStream = "T42.Workspaces.Stream.Window";
    private readonly _workspacesContainerStream = "T42.Workspaces.Stream.Container";
    private readonly _workspacesWorkspaceStream = "T42.Workspaces.Stream.Workspace";
    private readonly _workspacesFrameStream = "T42.Workspaces.Stream.Frame";
    private readonly _workspacesControlMethod = "T42.Workspaces.Control";

    private _frameId: string;
    private _frameStream: Glue42Web.Interop.Stream;
    private _workspaceStream: Glue42Web.Interop.Stream;
    private _containerStream: Glue42Web.Interop.Stream;
    private _windowStream: Glue42Web.Interop.Stream;

    public async init(frameId: string): Promise<void> {
        this._frameId = frameId;
        if (window.glue) {
            await this.registerAgmMethods();
        }
    }

    private async registerAgmMethods(): Promise<void> {
        await window.glue.agm.registerAsync({
            name: this._workspacesControlMethod
        }, this.handleControl);

        this._frameStream = await window.glue.agm.createStream({
            name: this._workspacesFrameStream
        }, { subscriptionRequestHandler: this.handleSubscriptionRequested });

        this._workspaceStream = await window.glue.agm.createStream({
            name: this._workspacesWorkspaceStream
        }, { subscriptionRequestHandler: this.handleSubscriptionRequested });

        this._containerStream = await window.glue.agm.createStream({
            name: this._workspacesContainerStream
        }, { subscriptionRequestHandler: this.handleSubscriptionRequested });

        this._windowStream = await window.glue.agm.createStream({
            name: this._workspacesWindowStream
        }, { subscriptionRequestHandler: this.handleSubscriptionRequested });
    }

    private handleControl = async (args: ControlArguments, caller: object, successCallback: (result: object) => void, errorCallback: (error: string) => void) => {
        try {
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
                    await this.handleCloseItem(args.operationArguments);
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

    private async handleCloseItem(operationArguments: ItemSelector): Promise<CloseItemResult> {
        await manager.closeItem(operationArguments.itemId);
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

    // private subscribeForEvents() {
    //     manager.workspacesEventEmitter.onFrameEvent((action, payload) => {
    //         const frameBranchKey = `frame_${payload.frameSummary.id}`;
    //         const branchesToStream = [
    //             ...this.getBranchesToStream(this._frameStream, [frameBranchKey]),
    //         ];

    //         branchesToStream.forEach((b) => {
    //             b.push({ action, payload });
    //         });
    //     });

    //     manager.workspacesEventEmitter.onWindowEvent((action, payload) => {
    //         const windowBranchKey = `window_${payload.windowSummary.itemId}`;
    //         const workspaceBranchKey = `workspace_${payload.windowSummary.config.workspaceId}`;
    //         const frameBranchKey = `frame_${payload.windowSummary.config.frameId}`;
    //         const branchesToStream = [
    //             ...this.getBranchesToStream(this._windowStream, [windowBranchKey, workspaceBranchKey, frameBranchKey]),
    //         ];

    //         branchesToStream.forEach((b) => {
    //             b.push({ action, payload });
    //         });
    //     });

    //     manager.workspacesEventEmitter.onWorkspaceEvent((action, payload) => {
    //         const workspaceBranchKey = `workspace_${payload.workspaceSummary.id}`;
    //         const frameBranchKey = `frame_${payload.frameSummary.id}`;
    //         const branchesToStream = [
    //             ...this.getBranchesToStream(this._workspaceStream, [workspaceBranchKey, frameBranchKey]),
    //         ];

    //         branchesToStream.forEach((b) => {
    //             b.push({ action, payload });
    //         });
    //     });

    //     manager.workspacesEventEmitter.onContainerEvent((action, payload) => {
    //         const workspaceBranchKey = `workspace_${payload.containerSummary.config.workspaceId}`;
    //         const frameBranchKey = `frame_${payload.containerSummary.config.frameId}`;
    //         const branchesToStream = [
    //             ...this.getBranchesToStream(this._containerStream, [workspaceBranchKey, frameBranchKey]),
    //         ];

    //         branchesToStream.forEach((b) => {
    //             b.push({ action, payload });
    //         });
    //     });
    // }

    private getBranchesToStream(stream: Glue42Web.Interop.Stream, branchKeys: string[]) {
        const globalBranch = stream.branches("global");
        const branches = stream.branches().filter((b) => branchKeys.some((el) => el === b.key));
        const result = [];

        if (globalBranch) {
            result.push(globalBranch);
        }

        if (branches) {
            result.push(...branches);
        }

        return result;
    }

    private handleSubscriptionRequested = (request: Glue42Web.Interop.SubscriptionRequest) => {
        const requestArgs = request.arguments;
        if (requestArgs && requestArgs.branch) {
            if (!this.isBranchKeyValid(requestArgs.branch)) {
                request.reject("The branch key was not in the expected format");
            }

            request.acceptOnBranch(requestArgs.branch);
        } else {
            request.reject("Couldn't find a subscription key");
        }
    }

    private isBranchKeyValid(branchKey: string) {
        if (!branchKey) {
            return false;
        }
        if (branchKey === "global") {
            return true;
        }

        const validFirstElements = ["frame", "workspace", "window"];
        const elementsInKey = branchKey.split("_");

        if (elementsInKey.length < 2) {
            return false;
        }

        const firstElement = elementsInKey[0];

        return validFirstElements.some((e) => e === firstElement);
    }
}

export default new GlueFacade();
