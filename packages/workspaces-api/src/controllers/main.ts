/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bridge } from "../communication/bridge";
import { IsWindowInSwimlaneResult, WorkspaceCreateConfigProtocol, WorkspaceSnapshotResult, FrameSummariesResult, WorkspaceSummariesResult, LayoutSummariesResult, ExportedLayoutsResult, FrameSnapshotResult, AddItemResult, WindowStreamData, FrameStateResult, FrameBoundsResult } from "../types/protocol";
import { OPERATIONS } from "../communication/constants";
import { SubscriptionConfig, WorkspaceEventType, WorkspaceEventAction } from "../types/subscription";
import { Workspace } from "../models/workspace";
import { Frame } from "../models/frame";
import { Child, ContainerLockConfig, SubParentTypes } from "../types/builders";
import { RefreshChildrenConfig } from "../types/privateData";
import { Glue42Workspaces } from "../../workspaces";
import { WorkspacesController } from "../types/controller";
import { GDWindow } from "../types/glue";
import { BaseController } from "./base";
import { UnsubscribeFunction } from "callback-registry";
import { Constraints, WorkspaceLockConfig, WorkspaceWindowLockConfig } from "../types/temp";

export class MainController implements WorkspacesController {

    constructor(
        private readonly bridge: Bridge,
        private readonly base: BaseController
    ) { }

    public checkIsWindowLoaded(windowId: string): boolean {
        return this.base.checkIsWindowLoaded(windowId);
    }

    public async checkIsInSwimlane(windowId: string): Promise<boolean> {

        const controlResult = await this.bridge.send<IsWindowInSwimlaneResult>(OPERATIONS.isWindowInWorkspace.name, { itemId: windowId });

        return controlResult.inWorkspace;
    }

    public async createWorkspace(definition: Glue42Workspaces.WorkspaceDefinition, saveConfig?: Glue42Workspaces.WorkspaceCreateConfig): Promise<Workspace> {
        const createConfig: WorkspaceCreateConfigProtocol = Object.assign({}, definition, { saveConfig });

        return await this.base.createWorkspace(createConfig);
    }

    public async restoreWorkspace(name: string, options?: Glue42Workspaces.RestoreWorkspaceConfig): Promise<Workspace> {
        const allLayouts = await this.getLayoutSummaries();

        const layoutExists = allLayouts.some((summary) => summary.name === name);

        if (!layoutExists) {
            throw new Error(`This layout: ${name} cannot be restored, because it doesn't exist.`);
        }

        if (options?.frameId) {
            const allFrameSummaries = await this.bridge.send<FrameSummariesResult>(OPERATIONS.getAllFramesSummaries.name);

            const foundMatchingFrame = allFrameSummaries.summaries.some((summary) => summary.id === options.frameId);

            if (!foundMatchingFrame) {
                throw new Error(`Cannot reuse the frame with id: ${options.frameId}, because there is no frame with that ID found`);
            }
        }

        return await this.base.restoreWorkspace(name, options);
    }

    public async add(type: "container" | "window", parentId: string, parentType: "row" | "column" | "group" | "workspace", definition: Glue42Workspaces.WorkspaceWindowDefinition | Glue42Workspaces.BoxDefinition): Promise<AddItemResult> {
        return await this.base.add(type, parentId, parentType, definition);
    }

    public processLocalSubscription(config: SubscriptionConfig, levelId: string): Promise<Glue42Workspaces.Unsubscribe> {
        return window.glue42gd ?
            this.handleEnterpriseLocalSubscription(config, levelId) :
            this.handleCoreLocalSubscription(config, levelId);
    }

    public processGlobalSubscription(callback: (callbackData: unknown) => void, eventType: WorkspaceEventType, action: WorkspaceEventAction): Promise<Glue42Workspaces.Unsubscribe> {
        return window.glue42gd ?
            this.handleEnterpriseGlobalSubscription(callback, eventType, action) :
            this.handleCoreGlobalSubscription(callback, eventType, action);
    }

    public async getFrame(selector: { windowId?: string; predicate?: (frame: Frame) => boolean }): Promise<Frame> {

        if (selector.windowId) {
            return await this.base.getFrame(selector.windowId);
        }

        if (selector.predicate) {
            return (await this.getFrames(selector.predicate))[0];
        }

        throw new Error(`The provided selector is not valid: ${JSON.stringify(selector)}`);
    }

    public async getFrames(predicate?: (frame: Frame) => boolean): Promise<Frame[]> {

        const allFrameSummaries = await this.bridge.send<FrameSummariesResult>(OPERATIONS.getAllFramesSummaries.name);

        return this.base.getFrames(allFrameSummaries.summaries, predicate);
    }

    public async getWorkspace(predicate: (workspace: Workspace) => boolean): Promise<Workspace> {
        let foundWorkspace: Workspace;

        await this.iterateWorkspaces((wsp, end) => {
            if (predicate(wsp)) {
                foundWorkspace = wsp;
                end();
            }
        });

        return foundWorkspace;
    }

    public async getWorkspaces(predicate?: (workspace: Workspace) => boolean): Promise<Workspace[]> {
        const matchingWorkspaces: Workspace[] = [] as Workspace[];

        await this.iterateWorkspaces((wsp) => {
            if (!predicate || predicate(wsp)) {
                matchingWorkspaces.push(wsp);
            }
        });

        return matchingWorkspaces;
    }

    public async getAllWorkspaceSummaries(): Promise<Glue42Workspaces.WorkspaceSummary[]> {

        const allSummariesResult = await this.bridge.send<WorkspaceSummariesResult>(OPERATIONS.getAllWorkspacesSummaries.name, {});

        return this.base.getAllWorkspaceSummaries(allSummariesResult);
    }

    public async getWindow(predicate: (swimlaneWindow: Glue42Workspaces.WorkspaceWindow) => boolean): Promise<Glue42Workspaces.WorkspaceWindow> {
        let resultWindow: Glue42Workspaces.WorkspaceWindow;

        await this.iterateWorkspaces((wsp, end) => {
            const foundWindow = wsp.getWindow(predicate);

            if (foundWindow) {
                resultWindow = foundWindow;
                end();
            }
        });

        return resultWindow;
    }

    public async getParent(predicate: (parent: Glue42Workspaces.WorkspaceBox) => boolean): Promise<Glue42Workspaces.WorkspaceBox> {
        let resultParent: Glue42Workspaces.WorkspaceBox;

        await this.iterateWorkspaces((wsp, end) => {

            const foundParent = wsp.getBox(predicate);

            if (foundParent) {
                resultParent = foundParent;
                end();
            }
        });

        return resultParent;
    }

    public async getLayoutSummaries(): Promise<Glue42Workspaces.WorkspaceLayoutSummary[]> {
        const allLayouts = await this.bridge.send<LayoutSummariesResult>(OPERATIONS.getAllLayoutsSummaries.name);
        return allLayouts.summaries;
    }

    public async deleteLayout(name: string): Promise<void> {
        await this.bridge.send(OPERATIONS.deleteLayout.name, { name });
    }

    public async exportLayout(predicate?: (layout: Glue42Workspaces.WorkspaceLayout) => boolean): Promise<Glue42Workspaces.WorkspaceLayout[]> {
        const allLayoutsResult = await this.bridge.send<ExportedLayoutsResult>(OPERATIONS.exportAllLayouts.name);
        return allLayoutsResult.layouts.reduce<Glue42Workspaces.WorkspaceLayout[]>((matchingLayouts, layout) => {

            if (!predicate || predicate(layout)) {
                matchingLayouts.push(layout);
            }

            return matchingLayouts;
        }, []);
    }

    public async saveLayout(config: Glue42Workspaces.WorkspaceLayoutSaveConfig): Promise<Glue42Workspaces.WorkspaceLayout> {
        return await this.bridge.send(OPERATIONS.saveLayout.name, config);
    }

    public async importLayout(layouts: Glue42Workspaces.WorkspaceLayout[], mode: "replace" | "merge"): Promise<void> {

        await Promise.all(layouts.map((layout) => this.bridge.send(OPERATIONS.importLayout.name, { layout, mode })));
    }

    public handleOnSaved(callback: (layout: Glue42Workspaces.WorkspaceLayout) => void): UnsubscribeFunction {
        return this.base.handleOnSaved(callback);
    }

    public handleOnRemoved(callback: (layout: Glue42Workspaces.WorkspaceLayout) => void): UnsubscribeFunction {
        return this.base.handleOnRemoved(callback);
    }

    public async bundleTo(type: "row" | "column", workspaceId: string): Promise<void> {
        return await this.base.bundleTo(type, workspaceId);
    }

    public getWorkspaceContext(workspaceId: string): Promise<any> {
        return this.base.getWorkspaceContext(workspaceId);
    }

    public setWorkspaceContext(workspaceId: string, data: any): Promise<void> {
        return this.base.setWorkspaceContext(workspaceId, data);
    }

    public updateWorkspaceContext(workspaceId: string, data: any): Promise<void> {
        return this.base.updateWorkspaceContext(workspaceId, data);
    }

    public subscribeWorkspaceContextUpdated(workspaceId: string, callback: (data: any) => void): Promise<import("callback-registry").UnsubscribeFunction> {
        return this.base.subscribeWorkspaceContextUpdated(workspaceId, callback);
    }

    public async restoreItem(itemId: string): Promise<void> {
        return await this.base.restoreItem(itemId);
    }

    public async maximizeItem(itemId: string): Promise<void> {
        return await this.base.maximizeItem(itemId);
    }

    public async focusItem(itemId: string): Promise<void> {
        return await this.base.focusItem(itemId);
    }

    public async changeFrameState(frameId: string, state: Glue42Workspaces.FrameState): Promise<void> {
        await this.bridge.send<void>(OPERATIONS.changeFrameState.name, { frameId, requestedState: state });
    }

    public async getFrameBounds(frameId: string): Promise<Glue42Workspaces.FrameBounds> {
        const frameResult = await this.bridge.send<FrameBoundsResult>(OPERATIONS.getFrameBounds.name, { itemId: frameId });
        return frameResult.bounds;
    }

    public async getFrameState(frameId: string): Promise<Glue42Workspaces.FrameState> {
        const frameResult = await this.bridge.send<FrameStateResult>(OPERATIONS.getFrameState.name, { itemId: frameId });
        return frameResult.state;
    }

    public async closeItem(itemId: string): Promise<void> {
        return await this.base.closeItem(itemId);
    }

    public async resizeItem(itemId: string, config: Glue42Workspaces.ResizeConfig): Promise<void> {
        return await this.base.resizeItem(itemId, config);
    }

    public async moveFrame(itemId: string, config: Glue42Workspaces.MoveConfig): Promise<void> {
        return await this.base.moveFrame(itemId, config);
    }

    public getGDWindow(itemId: string): GDWindow {
        return this.base.getGDWindow(itemId);
    }

    public async forceLoadWindow(itemId: string): Promise<string> {
        const windowId = await this.base.forceLoadWindow(itemId);

        await this.base.notifyWindowAdded(windowId);

        return windowId;
    }

    public async ejectWindow(itemId: string): Promise<string> {
        const windowId: string = (await this.base.ejectWindow(itemId)).windowId;

        await this.base.notifyWindowAdded(windowId);

        return windowId;
    }

    public async moveWindowTo(itemId: string, newParentId: string): Promise<void> {
        return await this.base.moveWindowTo(itemId, newParentId);
    }

    public async getSnapshot(itemId: string, type: "workspace"): Promise<WorkspaceSnapshotResult>
    public async getSnapshot(itemId: string, type: "frame"): Promise<FrameSnapshotResult>
    public async getSnapshot(itemId: string, type: "workspace" | "frame"): Promise<WorkspaceSnapshotResult | FrameSnapshotResult> {
        return await this.base.getSnapshot(itemId, type);
    }

    public async setItemTitle(itemId: string, title: string): Promise<void> {
        return await this.base.setItemTitle(itemId, title);
    }

    public flatChildren(children: Child[]): Child[] {
        return children.reduce<Child[]>((soFar, child) => {

            soFar.push(child);

            if (child.type !== "window") {
                soFar.push(...this.flatChildren(child.children));
            }

            return soFar;
        }, []);
    }

    public refreshChildren(config: RefreshChildrenConfig): Child[] {
        return this.base.refreshChildren(config);
    }

    public iterateFindChild(children: Child[], predicate: (child: Child) => boolean): Child {
        return this.base.iterateFindChild(children, predicate);
    }

    public iterateFilterChildren(children: Child[], predicate: (child: Child) => boolean): Child[] {
        return this.base.iterateFilterChildren(children, predicate);
    }

    public hibernateWorkspace(workspaceId: string): Promise<void> {
        return this.base.hibernateWorkspace(workspaceId);
    }

    public resumeWorkspace(workspaceId: string): Promise<void> {
        return this.base.resumeWorkspace(workspaceId);
    }

    public lockWorkspace(workspaceId: string, config?: WorkspaceLockConfig): Promise<void> {
        return this.base.lockWorkspace(workspaceId, config);
    }

    public lockWindow(windowPlacementId: string, config?: WorkspaceWindowLockConfig): Promise<void> {
        return this.base.lockWindow(windowPlacementId, config);
    }

    public lockContainer(itemId: string, type: SubParentTypes["type"], config?: ContainerLockConfig): Promise<void> {
        return this.base.lockContainer(itemId, type, config);
    }

    public async getFrameConstraints(frameId: string): Promise<Constraints> {
        const frameSnapshot = await this.getSnapshot(frameId, "frame");

        return {
            minWidth: frameSnapshot.config.minWidth,
            maxWidth: frameSnapshot.config.maxWidth,
            minHeight: frameSnapshot.config.minHeight,
            maxHeight: frameSnapshot.config.maxHeight,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private async handleCoreLocalSubscription(config: SubscriptionConfig, levelId: string): Promise<Glue42Workspaces.Unsubscribe> {
        await this.bridge.createCoreEventSubscription();

        config.scopeId = config.scopeId || levelId;

        if (config.eventType === "window" && config.action === "loaded") {
            const originalCB = config.callback;

            const wrappedCB = async (callbackData: WindowStreamData): Promise<void> => {

                await this.base.notifyWindowAdded(callbackData.windowSummary.config.windowId);

                originalCB(callbackData);
            };

            config.callback = wrappedCB;
        }

        return this.bridge.handleCoreSubscription(config);
    }

    private handleEnterpriseLocalSubscription(config: SubscriptionConfig, levelId: string): Promise<Glue42Workspaces.Unsubscribe> {
        config.scopeId = config.scopeId || levelId;

        if (config.eventType === "window" && config.action === "loaded") {
            const originalCB = config.callback;

            const wrappedCB = async (callbackData: WindowStreamData): Promise<void> => {
                await this.base.notifyWindowAdded(callbackData.windowSummary.config.windowId);
                originalCB(callbackData);
            };

            config.callback = wrappedCB;
        }

        return this.bridge.subscribe(config);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private async handleCoreGlobalSubscription(callback: (callbackData: unknown) => void, eventType: WorkspaceEventType, action: WorkspaceEventAction): Promise<Glue42Workspaces.Unsubscribe> {
        await this.bridge.createCoreEventSubscription();

        const config: SubscriptionConfig = {
            eventType, callback, action,
            scope: "global",
        };

        if (eventType === "window" && action === "loaded") {
            const wrappedCB = async (callbackData: WindowStreamData): Promise<void> => {

                await this.base.notifyWindowAdded(callbackData.windowSummary.config.windowId);

                callback(callbackData);
            };

            config.callback = wrappedCB;
        }

        return this.bridge.handleCoreSubscription(config);
    }

    private handleEnterpriseGlobalSubscription(callback: (callbackData: unknown) => void, eventType: WorkspaceEventType, action: WorkspaceEventAction): Promise<Glue42Workspaces.Unsubscribe> {
        const config: SubscriptionConfig = {
            eventType, callback, action,
            scope: "global",
        };

        if (eventType === "window" && action === "loaded") {
            const wrappedCB = async (callbackData: WindowStreamData): Promise<void> => {

                await this.base.notifyWindowAdded(callbackData.windowSummary.config.windowId);

                callback(callbackData);
            };

            config.callback = wrappedCB;
        }

        return this.bridge.subscribe(config);
    }

    private async iterateWorkspaces(callback: (workspace: Workspace, end: () => void) => void): Promise<void> {
        let ended = false;

        const end = (): void => { ended = true; };

        const workspaceSummaries = await this.getAllWorkspaceSummaries();

        for (const summary of workspaceSummaries) {
            if (ended) {
                return;
            }

            const wsp = await this.base.fetchWorkspace(summary.id);

            callback(wsp, end);
        }
    }
}
