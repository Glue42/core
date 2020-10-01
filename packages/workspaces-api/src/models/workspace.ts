import { WorkspaceSnapshotResult, WindowStreamData, ContainerStreamData } from "../types/protocol";
import { checkThrowCallback, nonEmptyStringDecoder } from "../shared/decoders";
import { PrivateDataManager } from "../shared/privateDataManager";
import { FrameCreateConfig } from "../types/ioc";
import { Window } from "./window";
import { Frame } from "./frame";
import { Row } from "./row";
import { Column } from "./column";
import { Group } from "./group";
import { SubscriptionConfig } from "../types/subscription";
import { WorkspacePrivateData } from "../types/privateData";
import { Glue42Workspaces } from "../../workspaces";

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

    public get children(): Glue42Workspaces.WorkspaceElement[] {
        return getData(this).children;
    }

    public get frame(): Frame {
        return getData(this).frame;
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

        const shouldCloseFrame = (await getData(this).frame.workspaces()).length === 1;

        const frameToClose = shouldCloseFrame ? getData(this).frame : null;

        await controller.closeItem(this.id, frameToClose);
    }

    public snapshot(): Promise<Glue42Workspaces.WorkspaceSnapshot> {
        return getData(this).controller.getSnapshot(this.id, "workspace");
    }

    public async saveLayout(name: string, config?: { saveContext?: boolean }): Promise<void> {
        nonEmptyStringDecoder.runWithException(name);
        await getData(this).controller.saveLayout({name, workspaceId: this.id, saveContext: config?.saveContext});
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

        const existingChildren = newSnapshot.children.reduce<Glue42Workspaces.WorkspaceElement[]>((foundChildren, child) => {
            let foundChild: Glue42Workspaces.WorkspaceElement;
            if (child.type === "window") {
                foundChild = this.getWindow((swimlaneWindow) => swimlaneWindow.id === child.id);
            } else {
                foundChild = this.getBox((parent) => parent.id === child.id);
            }

            if (foundChild) {
                foundChildren.push(foundChild);
            }

            return foundChildren;
        }, []);

        const newChildren = getData(this).controller.refreshChildren({
            existingChildren,
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

    public getRow(predicate: (row: Row) => boolean): Row {
        checkThrowCallback(predicate);
        return this.getBox((parent) => parent.type === "row" && predicate(parent)) as Row;
    }

    public getAllRows(predicate?: (row: Row) => boolean): Row[] {
        checkThrowCallback(predicate, true);
        if (predicate) {
            return this.getAllBoxes((parent) => parent.type === "row" && predicate(parent)) as Row[];
        }
        return this.getAllBoxes((parent) => parent.type === "row") as Row[];
    }

    public getColumn(predicate: (column: Column) => boolean): Column {
        checkThrowCallback(predicate);
        return this.getBox((parent) => parent.type === "column" && predicate(parent)) as Column;
    }

    public getAllColumns(predicate?: (columns: Column) => boolean): Column[] {
        checkThrowCallback(predicate, true);
        if (predicate) {
            return this.getAllBoxes((parent) => parent.type === "column" && predicate(parent)) as Column[];
        }
        return this.getAllBoxes((parent) => parent.type === "column") as Column[];
    }

    public getGroup(predicate: (group: Group) => boolean): Group {
        checkThrowCallback(predicate);
        return this.getBox((parent) => parent.type === "group" && predicate(parent)) as Group;
    }

    public getAllGroups(predicate?: (group: Group) => boolean): Group[] {
        checkThrowCallback(predicate, true);
        if (predicate) {
            return this.getAllBoxes((parent) => parent.type === "group" && predicate(parent)) as Group[];
        }
        return this.getAllBoxes((parent) => parent.type === "group") as Group[];
    }

    public getWindow(predicate: (window: Glue42Workspaces.WorkspaceWindow) => boolean): Glue42Workspaces.WorkspaceWindow {
        checkThrowCallback(predicate);
        const children = getData(this).children;
        const controller = getData(this).controller;

        return controller.iterateFindChild(children, (child) => child.type === "window" && predicate(child)) as Window;
    }

    public getAllWindows(predicate?: (window: Glue42Workspaces.WorkspaceWindow) => boolean): Glue42Workspaces.WorkspaceWindow[] {
        checkThrowCallback(predicate, true);
        const children = getData(this).children;
        const controller = getData(this).controller;

        const allWindows = controller.iterateFilterChildren(children, (child) => child.type === "window") as Window[];

        if (!predicate) {
            return allWindows;
        }

        return allWindows.filter(predicate);
    }

    public addRow(definition?: Glue42Workspaces.BoxDefinition): Promise<Row> {
        return getData(this).base.addParent<Row>(this, "row", "workspace", definition);
    }

    public addColumn(definition?: Glue42Workspaces.BoxDefinition): Promise<Column> {
        return getData(this).base.addParent<Column>(this, "column", "workspace", definition);
    }

    public addGroup(definition?: Glue42Workspaces.BoxDefinition): Promise<Group> {
        return getData(this).base.addParent<Group>(this, "group", "workspace", definition);
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

    public async onClosing(callback: () => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;

        const wrappedCallback = async (): Promise<void> => {
            await this.refreshReference();
            callback();
        };

        const config: SubscriptionConfig = {
            action: "closing",
            streamType: "workspace",
            level: "workspace",
            levelId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
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
            streamType: "workspace",
            level: "workspace",
            levelId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }

    public async onFocusChange(callback: () => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;
        const wrappedCallback = async (): Promise<void> => {
            await this.refreshReference();
            callback();
        };
        const config: SubscriptionConfig = {
            action: "focus",
            streamType: "workspace",
            level: "workspace",
            levelId: id,
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
            callback(foundWindow as Window);
        };

        const config: SubscriptionConfig = {
            action: "added",
            streamType: "window",
            level: "workspace",
            levelId: id,
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
            streamType: "window",
            level: "workspace",
            levelId: id,
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
            streamType: "window",
            level: "workspace",
            levelId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }

    public async onWindowFocusChange(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;

        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            this.refreshReference();

            const foundWindow = this.getWindow((win) => win.id && win.id === payload.windowSummary.config.windowId);

            callback(foundWindow);
        };

        const config: SubscriptionConfig = {
            action: "focus",
            streamType: "window",
            level: "workspace",
            levelId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }

    public async onBoxAdded(callback: (parent: Glue42Workspaces.WorkspaceBox) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;

        const wrappedCallback = async (payload: ContainerStreamData): Promise<void> => {
            await this.refreshReference();
            const foundParent = this.getBox((parent) => parent.id === payload.containerSummary.itemId);
            callback(foundParent);
        };

        const config: SubscriptionConfig = {
            action: "added",
            streamType: "container",
            level: "workspace",
            levelId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }

    public async onBoxRemoved(callback: (removed: { id: string; workspaceId: string; frameId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;

        const wrappedCallback = async (payload: ContainerStreamData): Promise<void> => {
            await this.refreshReference();
            const { workspaceId, frameId } = payload.containerSummary.config;
            callback({ id: payload.containerSummary.itemId, workspaceId, frameId });
        };

        const config: SubscriptionConfig = {
            action: "removed",
            streamType: "container",
            level: "workspace",
            levelId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }

    public async onBoxUpdated(callback: (parent: Glue42Workspaces.WorkspaceBox) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;

        const wrappedCallback = async (payload: ContainerStreamData): Promise<void> => {
            await this.refreshReference();
            const foundParent = this.getBox((parent) => parent.id === payload.containerSummary.itemId);
            callback(foundParent);
        };

        const config: SubscriptionConfig = {
            action: "childrenUpdate",
            streamType: "container",
            level: "workspace",
            levelId: id,
            callback: wrappedCallback
        };

        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }
}
