/* eslint-disable @typescript-eslint/no-explicit-any */
import { Workspace } from "../models/workspace";
import { WorkspaceSnapshotResult, WorkspaceCreateConfigProtocol, FrameSummaryResult, AddItemResult, WorkspaceSummariesResult, WorkspaceSummaryResult, SimpleWindowOperationSuccessResult, FrameSnapshotResult, SwimlaneWindowSnapshotConfig, ParentSnapshotConfig } from "../types/protocol";
import { OPERATIONS } from "../communication/constants";
import { FrameCreateConfig, WorkspaceIoCCreateConfig, WindowCreateConfig, ParentCreateConfig } from "../types/ioc";
import { IoC } from "../shared/ioc";
import { Bridge } from "../communication/bridge";
import { Instance, GDWindow, WindowsAPI, ContextsAPI, LayoutsAPI } from "../types/glue";
import { Glue42Workspaces } from "../../workspaces";
import { Frame } from "../models/frame";
import { RefreshChildrenConfig } from "../types/privateData";
import { Child } from "../types/builders";
import { PrivateDataManager } from "../shared/privateDataManager";
import { Window } from "../models/window";
import { UnsubscribeFunction } from "callback-registry";

export class BaseController {

    constructor(
        private readonly ioc: IoC,
        private readonly windows: WindowsAPI,
        private readonly contexts: ContextsAPI,
        private readonly layouts: LayoutsAPI,
    ) { }

    private get bridge(): Bridge {
        return this.ioc.bridge;
    }

    private get privateDataManager(): PrivateDataManager {
        return this.ioc.privateDataManager;
    }

    public checkIsWindowLoaded(windowId: string): boolean {
        return windowId && this.windows.list().some((win) => win.id === windowId);
    }

    public async createWorkspace(createConfig: WorkspaceCreateConfigProtocol, frameInstance?: Instance): Promise<Workspace> {
        const snapshot = await this.bridge.send<WorkspaceSnapshotResult>(OPERATIONS.createWorkspace.name, createConfig, frameInstance);

        const frameConfig: FrameCreateConfig = {
            summary: snapshot.frameSummary
        };
        const frame = this.ioc.getModel<"frame">("frame", frameConfig);

        const workspaceConfig: WorkspaceIoCCreateConfig = { frame, snapshot };

        return this.ioc.getModel<"workspace">("workspace", workspaceConfig);
    }

    public async restoreWorkspace(name: string, options: Glue42Workspaces.RestoreWorkspaceConfig, frameInstance?: Instance): Promise<Workspace> {
        const snapshot = await this.bridge.send<WorkspaceSnapshotResult>(OPERATIONS.openWorkspace.name, { name, restoreOptions: options }, frameInstance);

        const frameSummary = await this.bridge.send<FrameSummaryResult>(OPERATIONS.getFrameSummary.name, { itemId: snapshot.config.frameId }, frameInstance);

        const frameConfig: FrameCreateConfig = {
            summary: frameSummary
        };
        const frame = this.ioc.getModel<"frame">("frame", frameConfig);

        const workspaceConfig: WorkspaceIoCCreateConfig = { frame, snapshot };

        return this.ioc.getModel<"workspace">("workspace", workspaceConfig);
    }

    public async add(type: "container" | "window", parentId: string, parentType: "row" | "column" | "group" | "workspace", definition: Glue42Workspaces.WorkspaceWindowDefinition | Glue42Workspaces.BoxDefinition, frameInstance?: Instance): Promise<AddItemResult> {
        let operationName: string;
        const operationArgs = { definition, parentId, parentType };

        if (type === "window") {
            operationName = OPERATIONS.addWindow.name;
        } else if (type === "container") {
            operationName = OPERATIONS.addContainer.name;
        } else {
            throw new Error(`Unrecognized add type: ${type}`);
        }

        return await this.bridge.send<AddItemResult>(operationName, operationArgs, frameInstance);
    }

    public async getFrame(windowId: string, frameInstance?: Instance): Promise<Frame> {
        const frameSummary = await this.bridge.send<FrameSummaryResult>(OPERATIONS.getFrameSummary.name, { itemId: windowId }, frameInstance);

        const frameConfig: FrameCreateConfig = {
            summary: frameSummary
        };
        return this.ioc.getModel<"frame">("frame", frameConfig);

    }

    public getFrames(allFrameSummaries: FrameSummaryResult[], predicate?: (frame: Frame) => boolean): Frame[] {

        return allFrameSummaries.reduce<Frame[]>((frames, frameSummary) => {

            const frameConfig: FrameCreateConfig = {
                summary: frameSummary
            };
            const frameToCheck = this.ioc.getModel<"frame">("frame", frameConfig);

            if (!predicate || predicate(frameToCheck)) {
                frames.push(frameToCheck);
            }

            return frames;
        }, []);
    }

    public getAllWorkspaceSummaries(...bridgeResults: WorkspaceSummariesResult[]): Glue42Workspaces.WorkspaceSummary[] {

        const allSummaries = bridgeResults.reduce<WorkspaceSummaryResult[]>((summaries, summaryResult) => {
            summaries.push(...summaryResult.summaries);
            return summaries;
        }, []);

        return allSummaries.map<Glue42Workspaces.WorkspaceSummary>((summary) => {
            return {
                id: summary.id,
                frameId: summary.config.frameId,
                positionIndex: summary.config.positionIndex,
                title: summary.config.title,
                layoutName: summary.config.layoutName
            };
        });
    }

    public handleOnSaved(callback: (layout: Glue42Workspaces.WorkspaceLayout) => void): UnsubscribeFunction {
        const wrappedCallback = (layout: Glue42Workspaces.WorkspaceLayout): void => {
            if (layout.type !== "Workspace") {
                return;
            }

            callback(layout);
        };

        const addedUnSub: UnsubscribeFunction = this.layouts.onAdded(wrappedCallback);
        const changedUnSub: UnsubscribeFunction = this.layouts.onChanged(wrappedCallback);

        return (): void => {
            addedUnSub();
            changedUnSub();
        };
    }

    public handleOnRemoved(callback: (layout: Glue42Workspaces.WorkspaceLayout) => void): UnsubscribeFunction {
        const wrappedCallback = (layout: Glue42Workspaces.WorkspaceLayout): void => {
            if (layout.type !== "Workspace") {
                return;
            }

            callback(layout);
        };

        return this.layouts.onRemoved(wrappedCallback);
    }

    public async fetchWorkspace(workspaceId: string, frameInstance?: Instance): Promise<Workspace> {

        const snapshot = await this.bridge.send<WorkspaceSnapshotResult>(OPERATIONS.getWorkspaceSnapshot.name, { itemId: workspaceId }, frameInstance);

        const frameConfig: FrameCreateConfig = {
            summary: snapshot.frameSummary
        };

        const frame = this.ioc.getModel<"frame">("frame", frameConfig);

        const workspaceConfig: WorkspaceIoCCreateConfig = { frame, snapshot };

        return this.ioc.getModel<"workspace">("workspace", workspaceConfig);

    }

    public async bundleTo(type: "row" | "column", workspaceId: string, frameInstance?: Instance): Promise<void> {
        await this.bridge.send(OPERATIONS.bundleWorkspace.name, { type, workspaceId }, frameInstance);
    }

    public getWorkspaceContext(workspaceId: string): Promise<any> {
        const contextName = `___workspace___${workspaceId}`;
        return this.contexts.get(contextName);
    }

    public setWorkspaceContext(workspaceId: string, data: any): Promise<void> {
        const contextName = `___workspace___${workspaceId}`;
        return this.contexts.set(contextName, data);
    }

    public updateWorkspaceContext(workspaceId: string, data: any): Promise<void> {
        const contextName = `___workspace___${workspaceId}`;
        return this.contexts.update(contextName, data);
    }

    public subscribeWorkspaceContextUpdated(workspaceId: string, callback: (data: any) => void): Promise<UnsubscribeFunction> {
        const contextName = `___workspace___${workspaceId}`;
        return this.contexts.subscribe(contextName, callback);
    }

    public async restoreItem(itemId: string, frameInstance?: Instance): Promise<void> {
        await this.bridge.send(OPERATIONS.restoreItem.name, { itemId }, frameInstance);
    }

    public async maximizeItem(itemId: string, frameInstance?: Instance): Promise<void> {
        await this.bridge.send(OPERATIONS.maximizeItem.name, { itemId }, frameInstance);
    }

    public async focusItem(itemId: string, frameInstance?: Instance): Promise<void> {
        await this.bridge.send(OPERATIONS.focusItem.name, { itemId }, frameInstance);
    }

    public async closeItem(itemId: string, frameInstance?: Instance): Promise<void> {
        await this.bridge.send(OPERATIONS.closeItem.name, { itemId }, frameInstance);
    }

    public async resizeItem(itemId: string, config: Glue42Workspaces.ResizeConfig, frameInstance?: Instance): Promise<void> {
        await this.bridge.send(OPERATIONS.resizeItem.name, Object.assign({}, { itemId }, config), frameInstance);
    }

    public async moveFrame(itemId: string, config: Glue42Workspaces.MoveConfig, frameInstance?: Instance): Promise<void> {
        await this.bridge.send(OPERATIONS.moveFrame.name, Object.assign({}, { itemId }, config), frameInstance);
    }

    public getGDWindow(itemId: string): GDWindow {
        return this.windows.list().find((gdWindow) => gdWindow.id === itemId);
    }

    public async forceLoadWindow(itemId: string, frameInstance?: Instance): Promise<string> {
        const controlResult = await this.bridge.send<SimpleWindowOperationSuccessResult>(OPERATIONS.forceLoadWindow.name, { itemId }, frameInstance);

        return controlResult.windowId;
    }

    public async ejectWindow(itemId: string, frameInstance?: Instance): Promise<SimpleWindowOperationSuccessResult> {
        return await this.bridge.send<SimpleWindowOperationSuccessResult>(OPERATIONS.ejectWindow.name, { itemId }, frameInstance);
    }

    public async moveWindowTo(itemId: string, newParentId: string, frameInstance?: Instance): Promise<void> {
        await this.bridge.send(OPERATIONS.moveWindowTo.name, { itemId, containerId: newParentId }, frameInstance);
    }

    public async getSnapshot(itemId: string, type: "workspace" | "frame", frameInstance?: Instance): Promise<WorkspaceSnapshotResult | FrameSnapshotResult> {
        let result: WorkspaceSnapshotResult | FrameSnapshotResult;

        if (type === "workspace") {
            result = await this.bridge.send<WorkspaceSnapshotResult>(OPERATIONS.getWorkspaceSnapshot.name, { itemId }, frameInstance);
        } else if (type === "frame") {
            result = await this.bridge.send<FrameSnapshotResult>(OPERATIONS.getFrameSnapshot.name, { itemId }, frameInstance);
        }

        return result;
    }

    public async setItemTitle(itemId: string, title: string, frameInstance?: Instance): Promise<void> {
        await this.bridge.send(OPERATIONS.setItemTitle.name, { itemId, title }, frameInstance);
    }

    public refreshChildren(config: RefreshChildrenConfig): Child[] {
        const { parent, children, existingChildren, workspace } = config;
        if (parent instanceof Window) {
            return;
        }

        const newChildren = children.map((newChildSnapshot) => {
            let childToAdd = existingChildren.find((c) => c.id === newChildSnapshot.id);
            const childType = newChildSnapshot.type;

            if (childToAdd) {
                this.privateDataManager.remapChild(childToAdd, {
                    parent,
                    children: [],
                    config: newChildSnapshot.config
                });
            } else {
                if (childType === "window") {
                    const createConfig: WindowCreateConfig = {
                        id: newChildSnapshot.id,
                        parent,
                        frame: workspace.frame,
                        workspace,
                        config: newChildSnapshot.config as SwimlaneWindowSnapshotConfig
                    };
                    childToAdd = this.ioc.getModel<"child">(childType, createConfig);
                } else {
                    const createConfig: ParentCreateConfig = {
                        id: newChildSnapshot.id,
                        children: [],
                        parent,
                        frame: workspace.frame,
                        workspace,
                        config: newChildSnapshot.config as ParentSnapshotConfig
                    };
                    childToAdd = this.ioc.getModel<"child">(childType, createConfig);
                }

            }

            if (childType !== "window") {
                this.refreshChildren({
                    workspace, existingChildren,
                    children: newChildSnapshot.children,
                    parent: childToAdd
                });
            }

            return childToAdd;
        });

        if (parent instanceof Workspace) {
            return newChildren;
        } else {
            this.privateDataManager.remapChild(parent, { children: newChildren });
            return newChildren;
        }
    }

    public iterateFindChild(children: Child[], predicate: (child: Child) => boolean): Child {
        let foundChild = children.find((child) => predicate(child));

        if (foundChild) {
            return foundChild;
        }

        children.some((child) => {
            if (child instanceof Window) {
                return false;
            }

            foundChild = this.iterateFindChild(child.children, predicate);

            if (foundChild) {
                return true;
            }
        });

        return foundChild;
    }

    public iterateFilterChildren(children: Child[], predicate: (child: Child) => boolean): Child[] {
        const foundChildren = children.filter((child) => predicate(child));

        const grandChildren = children.reduce<Child[]>((innerFound, child) => {
            if (child instanceof Window) {
                return innerFound;
            }

            innerFound.push(...this.iterateFilterChildren(child.children, predicate));

            return innerFound;
        }, []);

        foundChildren.push(...grandChildren);

        return foundChildren;
    }

    public notifyWindowAdded(windowId: string): Promise<void> {
        return new Promise((resolve) => {

            const alreadyPresent: boolean = this.windows.list().some((win) => win.id === windowId);

            if (alreadyPresent) {
                return resolve();
            }

            const unsubscribe: UnsubscribeFunction = this.windows.onWindowAdded((win) => {

                if (win.id !== windowId) {
                    return;
                }

                if (unsubscribe) {
                    unsubscribe();
                }

                resolve();
            });
        });
    }
}
