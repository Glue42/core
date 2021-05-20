/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkspaceSnapshotResult, WindowStreamData } from "../types/protocol";
import { checkThrowCallback, nonEmptyStringDecoder, workspaceLockConfigDecoder } from "../shared/decoders";
import { PrivateDataManager } from "../shared/privateDataManager";
import { FrameCreateConfig } from "../types/ioc";
import { Frame } from "./frame";
import { SubscriptionConfig } from "../types/subscription";
import { WorkspacePrivateData } from "../types/privateData";
import { Glue42Workspaces } from "../../workspaces";
import { WorkspaceLockConfig } from "../types/temp";

interface PrivateData {
    manager: PrivateDataManager;
}

const data = new WeakMap<Workspace, PrivateData>();

const getData = (model: Workspace): WorkspacePrivateData => {
    return data.get(model).manager.getWorkspaceData(model);
};

const getDataManager = (model: Workspace): PrivateDataManager => {
    return data.get(model).manager;
};

export class Workspace implements Glue42Workspaces.Workspace {

    constructor(dataManager: PrivateDataManager) {
        data.set(this, { manager: dataManager });
    }

    public get id(): string {
        return getData(this).id;
    }

    public get frameId(): string {
        return getData(this).config.frameId;
    }

    public get positionIndex(): number {
        return getData(this).config.positionIndex;
    }

    public get title(): string {
        return getData(this).config.title;
    }

    public get layoutName(): string | undefined {
        return getData(this).config.layoutName;
    }

    public get isHibernated(): boolean {
        return getData(this).config.isHibernated;
    }

    public get children(): Glue42Workspaces.WorkspaceElement[] {
        return getData(this).children;
    }

    public get frame(): Frame {
        return getData(this).frame;
    }

    public get allowSplitters(): boolean {
        return getData(this).config.allowSplitters;
    }

    public get allowDrop(): boolean {
        return getData(this).config.allowDrop;
    }

    public get allowDropLeft(): boolean {
        return getData(this).config.allowDropLeft;
    }

    public get allowDropTop(): boolean {
        return getData(this).config.allowDropTop;
    }

    public get allowDropRight(): boolean {
        return getData(this).config.allowDropRight;
    }

    public get allowDropBottom(): boolean {
        return getData(this).config.allowDropBottom;
    }

    public get allowExtract(): boolean {
        return getData(this).config.allowExtract;
    }

    public get showCloseButton(): boolean {
        return getData(this).config.showCloseButton;
    }

    public get showSaveButton(): boolean {
        return getData(this).config.showSaveButton;
    }

    public get minWidth(): number {
        return getData(this).config.minWidth;
    }

    public get minHeight(): number {
        return getData(this).config.minHeight;
    }

    public get maxWidth(): number {
        return getData(this).config.maxWidth;
    }

    public get maxHeight(): number {
        return getData(this).config.maxHeight;
    }

    public get width(): number {
        return getData(this).config.widthInPx;
    }

    public get height(): number {
        return getData(this).config.heightInPx;
    }

    public get showWindowCloseButtons(): boolean {
        return getData(this).config.showWindowCloseButtons;
    }

    public get showEjectButtons(): boolean {
        return getData(this).config.showEjectButtons;
    }

    public get showAddWindowButtons(): boolean {
        return getData(this).config.showAddWindowButtons;
    }

    public async removeChild(predicate: (child: Glue42Workspaces.WorkspaceElement) => boolean): Promise<void> {
        checkThrowCallback(predicate);
        const child = this.children.find(predicate);
        if (!child) {
            return;
        }
        await child.close();
        await this.refreshReference();
    }

    public async remove(predicate: (child: Glue42Workspaces.WorkspaceElement) => boolean): Promise<void> {
        checkThrowCallback(predicate);
        const controller = getData(this).controller;

        const child = controller.iterateFindChild(this.children, predicate);

        await child.close();

        await this.refreshReference();
    }

    public async focus(): Promise<void> {
        await getData(this).controller.focusItem(this.id);
        await this.refreshReference();
    }

    public async close(): Promise<void> {
        const controller = getData(this).controller;

        const workspaces = await getData(this).frame.workspaces();

        const shouldCloseFrame = workspaces.length === 1 && workspaces.every((wsp) => wsp.id === this.id);

        if (shouldCloseFrame) {
            return this.frame.close();
        }

        await controller.closeItem(this.id);
    }

    public snapshot(): Promise<Glue42Workspaces.WorkspaceSnapshot> {
        return getData(this).controller.getSnapshot(this.id, "workspace");
    }

    public async saveLayout(name: string, config?: { saveContext?: boolean }): Promise<void> {
        nonEmptyStringDecoder.runWithException(name);
        await getData(this).controller.saveLayout({ name, workspaceId: this.id, saveContext: config?.saveContext });
    }

    public async setTitle(title: string): Promise<void> {
        nonEmptyStringDecoder.runWithException(title);
        const controller = getData(this).controller;

        await controller.setItemTitle(this.id, title);
        await this.refreshReference();
    }

    public getContext(): Promise<any> {
        const controller = getData(this).controller;
        return controller.getWorkspaceContext(this.id);
    }

    public setContext(data: any): Promise<void> {
        const controller = getData(this).controller;
        return controller.setWorkspaceContext(this.id, data);
    }

    public updateContext(data: any): Promise<void> {
        const controller = getData(this).controller;
        return controller.updateWorkspaceContext(this.id, data);
    }

    public onContextUpdated(callback: (data: any) => void): Promise<Glue42Workspaces.Unsubscribe> {
        const controller = getData(this).controller;
        return controller.subscribeWorkspaceContextUpdated(this.id, callback);
    }

    public async refreshReference(): Promise<void> {
        const newSnapshot = (await getData(this).controller.getSnapshot(this.id, "workspace")) as WorkspaceSnapshotResult;

        const currentChildrenFlat = getData(this).controller.flatChildren(getData(this).children);

        const newChildren = getData(this).controller.refreshChildren({
            existingChildren: currentChildrenFlat,
            workspace: this,
            parent: this,
            children: newSnapshot.children
        });

        const currentFrame = this.frame;
        let actualFrame: Frame;

        if (currentFrame.id === newSnapshot.config.frameId) {
            getDataManager(this).remapFrame(currentFrame, newSnapshot.frameSummary);
            actualFrame = currentFrame;
        } else {
            const frameCreateConfig: FrameCreateConfig = {
                summary: newSnapshot.frameSummary
            };
            const newFrame = getData(this).ioc.getModel<"frame">("frame", frameCreateConfig);
            actualFrame = newFrame;
        }

        getDataManager(this).remapWorkspace(this, {
            config: newSnapshot.config,
            children: newChildren,
            frame: actualFrame
        });
    }

    public getBox(predicate: (box: Glue42Workspaces.WorkspaceBox) => boolean): Glue42Workspaces.WorkspaceBox {
        checkThrowCallback(predicate);
        const children = getData(this).children;
        const controller = getData(this).controller;

        return controller.iterateFindChild(children, (child) => child.type !== "window" && predicate(child)) as Glue42Workspaces.WorkspaceBox;
    }

    public getAllBoxes(predicate?: (parent: Glue42Workspaces.WorkspaceBox) => boolean): Glue42Workspaces.WorkspaceBox[] {
        checkThrowCallback(predicate, true);
        const children = getData(this).children;
        const controller = getData(this).controller;

        const allParents = controller.iterateFilterChildren(children, (child) => child.type !== "window") as Glue42Workspaces.WorkspaceBox[];

        if (!predicate) {
            return allParents;
        }

        return allParents.filter(predicate);
    }

    public getRow(predicate: (row: Glue42Workspaces.Row) => boolean): Glue42Workspaces.Row {
        checkThrowCallback(predicate);
        return this.getBox((parent) => parent.type === "row" && predicate(parent)) as Glue42Workspaces.Row;
    }

    public getAllRows(predicate?: (row: Glue42Workspaces.Row) => boolean): Glue42Workspaces.Row[] {
        checkThrowCallback(predicate, true);
        if (predicate) {
            return this.getAllBoxes((parent) => parent.type === "row" && predicate(parent)) as Glue42Workspaces.Row[];
        }
        return this.getAllBoxes((parent) => parent.type === "row") as Glue42Workspaces.Row[];
    }

    public getColumn(predicate: (column: Glue42Workspaces.Column) => boolean): Glue42Workspaces.Column {
        checkThrowCallback(predicate);
        return this.getBox((parent) => parent.type === "column" && predicate(parent)) as Glue42Workspaces.Column;
    }

    public getAllColumns(predicate?: (columns: Glue42Workspaces.Column) => boolean): Glue42Workspaces.Column[] {
        checkThrowCallback(predicate, true);
        if (predicate) {
            return this.getAllBoxes((parent) => parent.type === "column" && predicate(parent)) as Glue42Workspaces.Column[];
        }
        return this.getAllBoxes((parent) => parent.type === "column") as Glue42Workspaces.Column[];
    }

    public getGroup(predicate: (group: Glue42Workspaces.Group) => boolean): Glue42Workspaces.Group {
        checkThrowCallback(predicate);
        return this.getBox((parent) => parent.type === "group" && predicate(parent)) as Glue42Workspaces.Group;
    }

    public getAllGroups(predicate?: (group: Glue42Workspaces.Group) => boolean): Glue42Workspaces.Group[] {
        checkThrowCallback(predicate, true);
        if (predicate) {
            return this.getAllBoxes((parent) => parent.type === "group" && predicate(parent)) as Glue42Workspaces.Group[];
        }
        return this.getAllBoxes((parent) => parent.type === "group") as Glue42Workspaces.Group[];
    }

    public getWindow(predicate: (window: Glue42Workspaces.WorkspaceWindow) => boolean): Glue42Workspaces.WorkspaceWindow {
        checkThrowCallback(predicate);
        const children = getData(this).children;
        const controller = getData(this).controller;

        return controller.iterateFindChild(children, (child) => child.type === "window" && predicate(child)) as Glue42Workspaces.WorkspaceWindow;
    }

    public getAllWindows(predicate?: (window: Glue42Workspaces.WorkspaceWindow) => boolean): Glue42Workspaces.WorkspaceWindow[] {
        checkThrowCallback(predicate, true);
        const children = getData(this).children;
        const controller = getData(this).controller;

        const allWindows = controller.iterateFilterChildren(children, (child) => child.type === "window") as Glue42Workspaces.WorkspaceWindow[];

        if (!predicate) {
            return allWindows;
        }

        return allWindows.filter(predicate);
    }

    public addRow(definition?: Glue42Workspaces.BoxDefinition): Promise<Glue42Workspaces.Row> {
        return getData(this).base.addParent<Glue42Workspaces.Row>(this, "row", "workspace", definition);
    }

    public addColumn(definition?: Glue42Workspaces.BoxDefinition): Promise<Glue42Workspaces.Column> {
        return getData(this).base.addParent<Glue42Workspaces.Column>(this, "column", "workspace", definition);
    }

    public addGroup(definition?: Glue42Workspaces.BoxDefinition): Promise<Glue42Workspaces.Group> {
        return getData(this).base.addParent<Glue42Workspaces.Group>(this, "group", "workspace", definition);
    }

    public addWindow(definition: Glue42Workspaces.WorkspaceWindowDefinition): Promise<Glue42Workspaces.WorkspaceWindow> {
        return getData(this).base.addWindow(this, definition, "workspace");
    }

    public async bundleToRow(): Promise<void> {
        await getData(this).controller.bundleTo("row", this.id);
        await this.refreshReference();
    }

    public async bundleToColumn(): Promise<void> {
        await getData(this).controller.bundleTo("column", this.id);
        await this.refreshReference();
    }

    public async hibernate(): Promise<void> {
        await getData(this).controller.hibernateWorkspace(this.id);
        await this.refreshReference();
    }

    public async resume(): Promise<void> {
        await getData(this).controller.resumeWorkspace(this.id);
        await this.refreshReference();
    }

    public async lock(config?: WorkspaceLockConfig | ((config: WorkspaceLockConfig) => WorkspaceLockConfig)): Promise<void> {
        let lockConfigResult = undefined;

        if (typeof config === "function") {
            const currentLockConfig = {
                allowDrop: this.allowDrop,
                allowDropLeft: this.allowDropLeft,
                allowDropTop: this.allowDropTop,
                allowDropRight: this.allowDropRight,
                allowDropBottom: this.allowDropBottom,
                allowExtract: this.allowExtract,
                allowSplitters: this.allowSplitters,
                showCloseButton: this.showCloseButton,
                showSaveButton: this.showSaveButton,
                showAddWindowButtons: this.showAddWindowButtons,
                showEjectButtons: this.showEjectButtons,
                showWindowCloseButtons: this.showWindowCloseButtons
            };

            lockConfigResult = config(currentLockConfig);
        } else {
            lockConfigResult = config;
        }

        const verifiedConfig = lockConfigResult === undefined ? undefined : workspaceLockConfigDecoder.runWithException(lockConfigResult);

        await getData(this).controller.lockWorkspace(this.id, verifiedConfig);
        await this.refreshReference();
    }


    public async onClosed(callback: () => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;

        const wrappedCallback = async (): Promise<void> => {
            // await this.refreshReference();
            callback();
        };
        const config: SubscriptionConfig = {
            action: "closed",
            eventType: "workspace",
            scope: "workspace",
            scopeId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }

    public async onWindowAdded(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;
        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            await this.refreshReference();
            const windowParent = this.getBox((parent) => parent.id === payload.windowSummary.parentId);

            const foundWindow = windowParent.children.find((child) => {

                return child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex;
            });
            callback(foundWindow as Glue42Workspaces.WorkspaceWindow);
        };

        const config: SubscriptionConfig = {
            action: "added",
            eventType: "window",
            scope: "workspace",
            scopeId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }

    public async onWindowRemoved(callback: (removed: { windowId?: string; workspaceId: string; frameId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;

        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            await this.refreshReference();
            const { windowId, workspaceId, frameId } = payload.windowSummary.config;
            callback({ windowId, workspaceId, frameId });
        };

        const config: SubscriptionConfig = {
            action: "removed",
            eventType: "window",
            scope: "workspace",
            scopeId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }

    public async onWindowLoaded(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;

        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            await this.refreshReference();
            const foundWindow = this.getWindow((win) => {
                return win.id && win.id === payload.windowSummary.config.windowId;
            });
            callback(foundWindow);
        };

        const config: SubscriptionConfig = {
            action: "loaded",
            eventType: "window",
            scope: "workspace",
            scopeId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }
}
