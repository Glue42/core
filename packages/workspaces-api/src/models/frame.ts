import { checkThrowCallback, nonEmptyStringDecoder, restoreWorkspaceConfigDecoder, workspaceDefinitionDecoder, workspaceBuilderCreateConfigDecoder, resizeConfigDecoder, moveConfigDecoder } from "../shared/decoders";
import { SubscriptionConfig } from "../types/subscription";
import { PrivateDataManager } from "../shared/privateDataManager";
import { FrameStreamData, WorkspaceStreamData, WindowStreamData } from "../types/protocol";
import { Glue42Workspaces } from "../../workspaces.d";
import { FramePrivateData } from "../types/privateData";
import { Constraints } from "../types/temp";

interface PrivateData {
    manager: PrivateDataManager;
}

const data = new WeakMap<Frame, PrivateData>();

const getData = (model: Frame): FramePrivateData => {
    return data.get(model).manager.getFrameData(model);
};

export class Frame implements Glue42Workspaces.Frame {

    constructor(dataManager: PrivateDataManager) {
        data.set(this, { manager: dataManager });
    }

    public get id(): string {
        return getData(this).summary.id;
    }

    public getBounds(): Promise<Glue42Workspaces.FrameBounds> {
        const myId = getData(this).summary.id;

        return getData(this).controller.getFrameBounds(myId);
    }

    public async resize(config: Glue42Workspaces.ResizeConfig): Promise<void> {
        const validatedConfig = resizeConfigDecoder.runWithException(config);
        const myId = getData(this).summary.id;

        return getData(this).controller.resizeItem(myId, validatedConfig);
    }

    public async move(config: Glue42Workspaces.MoveConfig): Promise<void> {
        const validatedConfig = moveConfigDecoder.runWithException(config);

        const myId = getData(this).summary.id;
        return getData(this).controller.moveFrame(myId, validatedConfig);
    }

    public focus(): Promise<void> {
        const myId = getData(this).summary.id;
        return getData(this).controller.focusItem(myId);
    }

    public async state(): Promise<Glue42Workspaces.FrameState> {
        if (!window.glue42gd) {
            throw new Error("State operations are not supported in Glue42 Core");
        }
        const myId = getData(this).summary.id;
        return getData(this).controller.getFrameState(myId);
    }

    public async minimize(): Promise<void> {
        if (!window.glue42gd) {
            throw new Error("State operations are not supported in Glue42 Core");
        }
        const myId = getData(this).summary.id;
        return getData(this).controller.changeFrameState(myId, "minimized");
    }

    public async maximize(): Promise<void> {
        if (!window.glue42gd) {
            throw new Error("State operations are not supported in Glue42 Core");
        }
        const myId = getData(this).summary.id;
        return getData(this).controller.changeFrameState(myId, "maximized");
    }

    public async restore(): Promise<void> {
        if (!window.glue42gd) {
            throw new Error("State operations are not supported in Glue42 Core");
        }
        const myId = getData(this).summary.id;
        return getData(this).controller.changeFrameState(myId, "normal");
    }

    public close(): Promise<void> {
        const myId = getData(this).summary.id;
        return getData(this).controller.closeItem(myId);
    }

    public snapshot(): Promise<Glue42Workspaces.FrameSnapshot> {
        const myId = getData(this).summary.id;
        return getData(this).controller.getSnapshot(myId, "frame");
    }

    public async workspaces(): Promise<Glue42Workspaces.Workspace[]> {
        const controller = getData(this).controller;
        return controller.getWorkspaces((wsp) => wsp.frameId === this.id);
    }

    public async constraints(): Promise<Constraints> {
        const controller = getData(this).controller;
        const myId = getData(this).summary.id;

        return controller.getFrameConstraints(myId);
    }
    public async restoreWorkspace(name: string, options?: Glue42Workspaces.RestoreWorkspaceConfig): Promise<Glue42Workspaces.Workspace> {
        nonEmptyStringDecoder.runWithException(name);
        const validatedOptions = restoreWorkspaceConfigDecoder.runWithException(options);

        return getData(this).controller.restoreWorkspace(name, validatedOptions);
    }

    public createWorkspace(definition: Glue42Workspaces.WorkspaceDefinition, config?: Glue42Workspaces.WorkspaceCreateConfig): Promise<Glue42Workspaces.Workspace> {
        const validatedDefinition = workspaceDefinitionDecoder.runWithException(definition);
        const validatedConfig = workspaceBuilderCreateConfigDecoder.runWithException(config);

        return getData(this).controller.createWorkspace(validatedDefinition, validatedConfig);
    }

    public async onClosed(callback: (closed: { frameId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (payload: FrameStreamData): void => {
            callback({ frameId: payload.frameSummary.id });
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "closed",
            eventType: "frame",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onMaximized(callback: () => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (): void => {
            callback();
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "maximized",
            eventType: "frame",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onMinimized(callback: () => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (): void => {
            callback();
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "minimized",
            eventType: "frame",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onNormal(callback: () => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (): void => {
            callback();
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "normal",
            eventType: "frame",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWorkspaceOpened(callback: (workspace: Glue42Workspaces.Workspace) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WorkspaceStreamData): Promise<void> => {
            const workspace = await getData(this).controller.getWorkspace((wsp) => wsp.id === payload.workspaceSummary.id);
            callback(workspace);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "opened",
            eventType: "workspace",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWorkspaceSelected(callback: (workspace: Glue42Workspaces.Workspace) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WorkspaceStreamData): Promise<void> => {
            const workspace = await getData(this).controller.getWorkspace((wsp) => wsp.id === payload.workspaceSummary.id);
            callback(workspace);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "selected",
            eventType: "workspace",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWorkspaceClosed(callback: (closed: { frameId: string; workspaceId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (payload: WorkspaceStreamData): void => {
            callback({ frameId: payload.frameSummary.id, workspaceId: payload.workspaceSummary.id });
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "closed",
            eventType: "workspace",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWindowAdded(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            const foundParent = await getData(this).controller.getParent((parent) => parent.id === payload.windowSummary.parentId);
            const foundWindow = foundParent.children.find((child) => child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex);
            callback(foundWindow as Glue42Workspaces.WorkspaceWindow);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "added",
            eventType: "window",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWindowRemoved(callback: (removed: { windowId?: string; workspaceId: string; frameId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (payload: WindowStreamData): void => {
            const { windowId, workspaceId, frameId } = payload.windowSummary.config;
            callback({ windowId, workspaceId, frameId });
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "removed",
            eventType: "window",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWindowLoaded(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            const foundParent = await getData(this).controller.getParent((parent) => {
                return parent.id === payload.windowSummary.parentId;
            });
            const foundWindow = foundParent.children.find((child) => child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex);
            callback(foundWindow as Glue42Workspaces.WorkspaceWindow);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "loaded",
            eventType: "window",
            scope: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }
}
