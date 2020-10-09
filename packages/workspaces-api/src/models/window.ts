import { checkThrowCallback, nonEmptyStringDecoder } from "../shared//decoders";
import { SubscriptionConfig } from "../types/subscription";
import { PrivateDataManager } from "../shared/privateDataManager";
import { Row } from "./row";
import { Column } from "./column";
import { Group } from "./group";
import { WindowPrivateData } from "../types/privateData";
import { Glue42Workspaces } from "../../workspaces";
import { GDWindow } from "../types/glue";

interface PrivateData {
    manager: PrivateDataManager;
}

const data = new WeakMap<Window, PrivateData>();

const getData = (model: Window): WindowPrivateData => {
    return data.get(model).manager.getWindowData(model);
};

export class Window implements Glue42Workspaces.WorkspaceWindow {

    constructor(dataManager: PrivateDataManager) {
        data.set(this, { manager: dataManager });
    }

    public get id(): string {
        return getData(this).config.windowId;
    }

    public get type(): "window" {
        return "window";
    }

    public get frameId(): string {
        return getData(this).frame.id;
    }

    public get workspaceId(): string {
        return getData(this).workspace.id;
    }

    public get positionIndex(): number {
        return getData(this).config.positionIndex;
    }

    public get isMaximized(): boolean {
        return getData(this).config.isMaximized;
    }

    public get isLoaded(): boolean {
        return getData(this).controller.checkIsWindowLoaded(this.id);
    }

    public get focused(): boolean {
        return getData(this).config.isFocused;
    }

    public get title(): string {
        return getData(this).config.title;
    }

    public get workspace(): Glue42Workspaces.Workspace {
        return getData(this).workspace;
    }

    public get frame(): Glue42Workspaces.Frame {
        return getData(this).frame;
    }

    public get parent(): Glue42Workspaces.Workspace | Glue42Workspaces.Workspace | Row | Column | Group {
        return getData(this).parent;
    }

    public get appName(): string {
        return getData(this).config.appName;
    }

    public async forceLoad(): Promise<void> {
        if (this.isLoaded) {
            return;
        }
        const controller = getData(this).controller;
        const itemId = getData(this).id;

        const windowId = await controller.forceLoadWindow(itemId);

        getData(this).config.windowId = windowId;
    }

    public async focus(): Promise<void> {
        const id = getData(this).id;
        const controller = getData(this).controller;

        await controller.focusItem(id);
    }

    public async close(): Promise<void> {

        const id = getData(this).id;
        const controller = getData(this).controller;

        await controller.closeItem(id);

        await getData(this)
            .parent
            .removeChild((child) => child.id === id);
    }

    public async setTitle(title: string): Promise<void> {
        nonEmptyStringDecoder.runWithException(title);

        const itemId = getData(this).id;
        const controller = getData(this).controller;

        await controller.setItemTitle(itemId, title);
    }

    public async maximize(): Promise<void> {
        const id = getData(this).id;
        const controller = getData(this).controller;

        await controller.maximizeItem(id);
    }

    public async restore(): Promise<void> {
        const id = getData(this).id;
        const controller = getData(this).controller;

        await controller.restoreItem(id);
    }

    public async eject(): Promise<GDWindow> {
        if (!this.isLoaded) {
            throw new Error("Cannot eject this window, because it is not loaded yet");
        }
        const itemId: string = getData(this).id;

        const newWindowId: string = await getData(this).controller.ejectWindow(itemId);

        getData(this).config.windowId = newWindowId;

        return this.getGdWindow();
    }

    public getGdWindow(): GDWindow {

        if (!this.isLoaded) {
            throw new Error("Cannot fetch this GD window, because the window is not yet loaded");
        }

        const myId = getData(this).config.windowId;
        const controller = getData(this).controller;

        return controller.getGDWindow(myId);
    }

    public async moveTo(parent: Row | Column | Group): Promise<void> {
        if (!(parent instanceof Row || parent instanceof Column || parent instanceof Group)) {
            throw new Error("Cannot add to the provided parent, because the provided parent is not an instance of Row, Column or Group");
        }

        const myId = getData(this).id;
        const controller = getData(this).controller;

        const foundParent = await controller.getParent((p) => p.id === parent.id);

        if (!foundParent) {
            throw new Error("Cannot move the window to the selected parent, because this parent does not exist.");
        }

        return controller.moveWindowTo(myId, parent.id);
    }

    public async onRemoved(callback: () => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const id = getData(this).id;
        const wrappedCallback = async (): Promise<void> => {
            await this.workspace.refreshReference();
            callback();
        };
        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "removed",
            eventType: "window",
            scope: "window"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, id);
        return unsubscribe;
    }
}
