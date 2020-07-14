"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("../manager");
const store_1 = require("../store");
const converter_1 = require("../config/converter");
const factory_1 = require("../config/factory");
const utils_1 = require("../utils");
const converter_2 = require("../config/converter");
class GlueFacade {
    constructor() {
        this._workspacesWindowStream = "T42.Workspaces.Stream.Window";
        this._workspacesContainerStream = "T42.Workspaces.Stream.Container";
        this._workspacesWorkspaceStream = "T42.Workspaces.Stream.Workspace";
        this._workspacesFrameStream = "T42.Workspaces.Stream.Frame";
        this._workspacesControlMethod = "T42.Workspaces.Control";
        this.handleControl = async (args, caller, successCallback, errorCallback) => {
            try {
                // tslint:disable-next-line: no-console
                console.log("Received control message", args.operation, args.operationArguments);
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
                        await this.handleSaveLayout(args.operationArguments);
                        successCallback(undefined);
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
                        await this.handleEject(args.operationArguments);
                        successCallback(undefined);
                        break;
                    case "createWorkspace":
                        successCallback(await this.handleCreateWorkspace(args.operationArguments));
                        break;
                    case "forceLoadWindow":
                        await this.handleForceLoadWindow(args.operationArguments);
                        successCallback(undefined);
                        break;
                    case "focusItem":
                        this.handleFocusItem(args.operationArguments);
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
                    default:
                        errorCallback(`Invalid operation - ${args.operation}`);
                }
            }
            catch (error) {
                errorCallback(error.message);
            }
        };
        this.handleSubscriptionRequested = (request) => {
            const requestArgs = request.arguments;
            if (requestArgs && requestArgs.branch) {
                if (!this.isBranchKeyValid(requestArgs.branch)) {
                    request.reject("The branch key was not in the expected format");
                }
                request.acceptOnBranch(requestArgs.branch);
            }
            else {
                request.reject("Couldn't find a subscription key");
            }
        };
    }
    async init(frameId) {
        this._frameId = frameId;
        if (window.glue) {
            await this.registerAgmMethods();
        }
    }
    async registerAgmMethods() {
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
    async handleOpenWorkspace(operationArguments) {
        const id = await manager_1.default.openWorkspace(operationArguments.name, operationArguments.options);
        const workspaceConfig = manager_1.default.stateResolver.getWorkspaceConfig(id);
        const workspaceItem = converter_1.default.convertToAPIConfig(workspaceConfig);
        return {
            id: workspaceItem.id,
            children: workspaceItem.children,
            config: workspaceItem.config,
            frameSummary: {
                id: this._frameId
            }
        };
    }
    async handleExportAllLayouts() {
        const layouts = await manager_1.default.exportAllLayouts();
        return {
            layouts
        };
    }
    async handleSaveLayout(operationArguments) {
        await manager_1.default.saveWorkspace(operationArguments.name, operationArguments.workspaceId);
    }
    handleDeleteLayout(operationArguments) {
        manager_1.default.deleteLayout(operationArguments.name);
    }
    handleGetWorkspaceSnapshot(operationArguments) {
        const workspace = store_1.default.getById(operationArguments.itemId);
        const workspaceConfig = manager_1.default.stateResolver.getWorkspaceConfig(workspace.id);
        const workspaceItem = converter_1.default.convertToAPIConfig(workspaceConfig);
        return {
            id: workspaceItem.id,
            children: workspaceItem.children,
            config: workspaceItem.config,
            frameSummary: {
                id: this._frameId
            }
        };
    }
    handleGetAllWorkspaceSummaries() {
        const summaries = store_1.default.layouts.map((w) => {
            const summary = manager_1.default.stateResolver.getWorkspaceSummary(w.id);
            return summary;
        });
        return {
            summaries
        };
    }
    async handleCloseItem(operationArguments) {
        await manager_1.default.closeItem(operationArguments.itemId);
    }
    handleRestoreItem(operationArguments) {
        manager_1.default.restoreItem(operationArguments.itemId);
    }
    handleMaximizeItem(operationArguments) {
        manager_1.default.maximizeItem(operationArguments.itemId);
    }
    async handleAddContainer(operationArguments) {
        const rendererFriendlyConfig = converter_1.default.convertToRendererConfig(operationArguments.definition);
        if (rendererFriendlyConfig.type === "workspace") {
            throw new Error("Unsuccessful conversion");
        }
        const containerDefinition = {
            id: utils_1.idAsString(rendererFriendlyConfig.id),
            content: rendererFriendlyConfig.content,
            type: rendererFriendlyConfig.type,
            workspacesConfig: rendererFriendlyConfig.workspacesConfig
        };
        const itemId = await manager_1.default.addContainer(containerDefinition, operationArguments.parentId);
        return {
            itemId
        };
    }
    async handleAddWindow(operationArguments) {
        const windowConfig = factory_1.default.createGDWindowConfig({
            windowId: operationArguments.definition.windowId,
            id: undefined,
            appName: operationArguments.definition.appName,
            url: operationArguments.definition.url
        });
        if (operationArguments.definition.windowId) {
            const win = window.glue.windows.list().find((w) => w.id === operationArguments.definition.windowId);
            const url = await win.getURL();
            // operationArguments.definition.appName = win.control.interop.instance.applicationName
            windowConfig.componentState.url = url;
        }
        await manager_1.default.addWindow(windowConfig, operationArguments.parentId);
        return {
            itemId: utils_1.idAsString(windowConfig.id),
        };
    }
    handleSetItemTitle(operationArguments) {
        manager_1.default.setItemTitle(operationArguments.itemId, operationArguments.title);
    }
    async handleAddWorkspaceChildren(operationArguments) {
        const hasRows = operationArguments.children.some((c) => c.type === "row");
        const hasColumns = operationArguments.children.some((c) => c.type === "column");
        if (hasColumns && hasRows) {
            throw new Error("Can't add both row and column workspace children");
        }
        let itemConfig = {
            type: "column",
            children: operationArguments.children
        };
        if (hasColumns) {
            itemConfig = {
                type: "row",
                children: operationArguments.children
            };
        }
        const convertedConfig = converter_1.default.convertToRendererConfig(itemConfig);
        await manager_1.default.addContainer(convertedConfig, operationArguments.workspaceId);
    }
    async handleEject(operationArguments) {
        const item = store_1.default.getWindowContentItem(operationArguments.itemId);
        await manager_1.default.eject(item);
    }
    async handleCreateWorkspace(operationArguments) {
        const config = converter_1.default.convertToRendererConfig(operationArguments);
        const workspaceId = await manager_1.default.createWorkspace(config);
        const apiConfig = converter_2.default.convertToAPIConfig(manager_1.default.stateResolver.getWorkspaceConfig(workspaceId));
        return {
            id: apiConfig.id,
            children: apiConfig.children,
            config: apiConfig.config,
            frameSummary: {
                id: this._frameId
            }
        };
    }
    async handleForceLoadWindow(operationArguments) {
        return await manager_1.default.loadWindow(operationArguments.itemId);
    }
    handleFocusItem(operationArguments) {
        return manager_1.default.focusItem(operationArguments.itemId);
    }
    handleBundleWorkspace(operationArguments) {
        return manager_1.default.bundleWorkspace(operationArguments.workspaceId, operationArguments.type);
    }
    handleIsWindowInWorkspace(operationArguments) {
        return {
            inWorkspace: manager_1.default.stateResolver.isWindowInWorkspace(operationArguments.itemId)
        };
    }
    async handleGetFrameSummary(operationArguments) {
        return manager_1.default.getFrameSummary(operationArguments.itemId);
    }
    async handleMoveFrame(operationArguments) {
        await manager_1.default.move(operationArguments.location);
    }
    handleGetFrameSnapshot() {
        return manager_1.default.stateResolver.getFrameSnapshot();
    }
    async handleGetSnapshot(operationArguments) {
        const snapshot = manager_1.default.stateResolver.getSnapshot(operationArguments.itemId);
        return snapshot;
    }
    async handleMoveWindowTo(operationArguments) {
        return manager_1.default.moveWindowTo(operationArguments.itemId, operationArguments.containerId);
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
    getBranchesToStream(stream, branchKeys) {
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
    isBranchKeyValid(branchKey) {
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
exports.default = new GlueFacade();
//# sourceMappingURL=facade.js.map