/* eslint-disable @typescript-eslint/no-explicit-any */
import { IoC } from "./shared/ioc";
import { checkThrowCallback, nonEmptyStringDecoder, workspaceLayoutDecoder, workspaceDefinitionDecoder, workspaceBuilderCreateConfigDecoder, builderConfigDecoder, restoreWorkspaceConfigDecoder, workspaceLayoutSaveConfigDecoder } from "./shared/decoders";
import { FrameStreamData, WorkspaceStreamData, WorkspaceSnapshotResult, WindowStreamData } from "./types/protocol";
import { FrameCreateConfig, WorkspaceIoCCreateConfig } from "./types/ioc";
import { Glue42Workspaces } from "./../workspaces";
import { WorkspacesController } from "./types/controller";

export const composeAPI = (glue: any, ioc: IoC): Glue42Workspaces.API => {

    const controller: WorkspacesController = ioc.controller;

    const inWorkspace = (): Promise<boolean> => {
        const myId: string = glue.windows.my().id;

        if (!myId) {
            throw new Error("Cannot get my frame, because my id is undefined.");
        }

        return controller.checkIsInSwimlane(myId);
    };

    const getBuilder = (config: Glue42Workspaces.BuilderConfig): Glue42Workspaces.WorkspaceBuilder | Glue42Workspaces.BoxBuilder => {
        const validatedConfig = builderConfigDecoder.runWithException(config);

        return ioc.getBuilder(validatedConfig);
    };

    const getMyFrame = async (): Promise<Glue42Workspaces.Frame> => {
        const windowId: string = glue.windows.my().id;

        if (!windowId) {
            throw new Error("Cannot get my frame, because my id is undefined.");
        }

        const isInSwimlane = await controller.checkIsInSwimlane(windowId);

        if (!isInSwimlane) {
            throw new Error("Cannot fetch your frame, because this window is not in a workspace");
        }

        return controller.getFrame({ windowId });
    };

    const getFrame = async (predicate: (frame: Glue42Workspaces.Frame) => boolean): Promise<Glue42Workspaces.Frame> => {
        checkThrowCallback(predicate);

        return controller.getFrame({ predicate });
    };

    const getAllFrames = async (predicate?: (frame: Glue42Workspaces.Frame) => boolean): Promise<Glue42Workspaces.Frame[]> => {
        checkThrowCallback(predicate, true);

        return controller.getFrames(predicate);
    };

    const getAllWorkspacesSummaries = (): Promise<Glue42Workspaces.WorkspaceSummary[]> => {
        return controller.getAllWorkspaceSummaries();
    };

    const getMyWorkspace = async (): Promise<Glue42Workspaces.Workspace> => {
        const myId: string = glue.windows.my().id;

        if (!myId) {
            throw new Error("Cannot get my workspace, because my id is undefined.");
        }

        const isInSwimlane = await controller.checkIsInSwimlane(myId);

        if (!isInSwimlane) {
            throw new Error("Cannot fetch your workspace, because this window is not in a workspace");
        }

        return (await controller.getWorkspaces((wsp) => !!wsp.getWindow((w) => w.id === myId)))[0];
    };

    const getWorkspace = async (predicate: (workspace: Glue42Workspaces.Workspace) => boolean): Promise<Glue42Workspaces.Workspace> => {
        checkThrowCallback(predicate);
        return (await controller.getWorkspaces(predicate))[0];
    };

    const getAllWorkspaces = (predicate?: (workspace: Glue42Workspaces.Workspace) => boolean): Promise<Glue42Workspaces.Workspace[]> => {
        checkThrowCallback(predicate, true);
        return controller.getWorkspaces(predicate);
    };

    const getWindow = async (predicate: (swimlaneWindow: Glue42Workspaces.WorkspaceWindow) => boolean): Promise<Glue42Workspaces.WorkspaceWindow> => {
        checkThrowCallback(predicate);
        return controller.getWindow(predicate);
    };

    const getParent = async (predicate: (parent: Glue42Workspaces.WorkspaceBox) => boolean): Promise<Glue42Workspaces.WorkspaceBox> => {
        checkThrowCallback(predicate);
        return controller.getParent(predicate);
    };

    const restoreWorkspace = async (name: string, options?: Glue42Workspaces.RestoreWorkspaceConfig): Promise<Glue42Workspaces.Workspace> => {
        nonEmptyStringDecoder.runWithException(name);
        const validatedOptions = restoreWorkspaceConfigDecoder.runWithException(options);
        return controller.restoreWorkspace(name, validatedOptions);
    };

    const createWorkspace = async (definition: Glue42Workspaces.WorkspaceDefinition, saveConfig?: Glue42Workspaces.WorkspaceCreateConfig): Promise<Glue42Workspaces.Workspace> => {
        const validatedDefinition = workspaceDefinitionDecoder.runWithException(definition);
        const validatedConfig = workspaceBuilderCreateConfigDecoder.runWithException(saveConfig);

        return controller.createWorkspace(validatedDefinition, validatedConfig);
    };

    const layouts = {
        getSummaries: (): Promise<Glue42Workspaces.WorkspaceLayoutSummary[]> => {
            return controller.getLayoutSummaries();
        },
        delete: async (name: string): Promise<void> => {
            nonEmptyStringDecoder.runWithException(name);
            return controller.deleteLayout(name);
        },
        export: async (predicate?: (layout: Glue42Workspaces.WorkspaceLayout) => boolean): Promise<Glue42Workspaces.WorkspaceLayout[]> => {
            checkThrowCallback(predicate, true);
            return controller.exportLayout(predicate);
        },
        import: async (layouts: Glue42Workspaces.WorkspaceLayout[], mode: "replace" | "merge" = "replace"): Promise<void> => {

            if (!Array.isArray(layouts)) {
                throw new Error(`The provided layouts argument is not an array: ${JSON.stringify(layouts)}`);
            }

            layouts.forEach((layout) => workspaceLayoutDecoder.runWithException(layout));
            return controller.importLayout(layouts, mode);
        },
        save: async (config: Glue42Workspaces.WorkspaceLayoutSaveConfig): Promise<Glue42Workspaces.WorkspaceLayout> => {
            const verifiedConfig = workspaceLayoutSaveConfigDecoder.runWithException(config);
            return controller.saveLayout(verifiedConfig);
        },
        onSaved: async (callback: (layout: Glue42Workspaces.WorkspaceLayout) => void): Promise<Glue42Workspaces.Unsubscribe> => {
            checkThrowCallback(callback);

            return controller.handleOnSaved(callback);
        },
        onRemoved: async (callback: (layout: Glue42Workspaces.WorkspaceLayout) => void): Promise<Glue42Workspaces.Unsubscribe> => {
            checkThrowCallback(callback);

            return controller.handleOnRemoved(callback);
        }
    };

    const onFrameOpened = async (callback: (frame: Glue42Workspaces.Frame) => void): Promise<Glue42Workspaces.Unsubscribe> => {
        checkThrowCallback(callback);

        const wrappedCallback = (payload: FrameStreamData): void => {
            const frameConfig: FrameCreateConfig = {
                summary: payload.frameSummary
            };
            const frame = ioc.getModel<"frame">("frame", frameConfig);
            callback(frame);
        };

        const unsubscribe = await controller.processGlobalSubscription(wrappedCallback, "frame", "opened");
        return unsubscribe;
    };

    const onFrameClosed = async (callback: (closed: { frameId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> => {
        checkThrowCallback(callback);
        const wrappedCallback = (payload: FrameStreamData): void => {
            callback({ frameId: payload.frameSummary.id });
        };
        const unsubscribe = await controller.processGlobalSubscription(wrappedCallback, "frame", "closed");
        return unsubscribe;
    };

    const onWorkspaceOpened = async (callback: (workspace: Glue42Workspaces.Workspace) => void): Promise<Glue42Workspaces.Unsubscribe> => {

        checkThrowCallback(callback);
        const wrappedCallback = async (payload: WorkspaceStreamData): Promise<void> => {
            const frameConfig: FrameCreateConfig = {
                summary: payload.frameSummary
            };
            const frame = ioc.getModel<"frame">("frame", frameConfig);

            const snapshot = (await controller.getSnapshot(payload.workspaceSummary.id, "workspace")) as WorkspaceSnapshotResult;

            const workspaceConfig: WorkspaceIoCCreateConfig = { frame, snapshot };

            const workspace = ioc.getModel<"workspace">("workspace", workspaceConfig);

            callback(workspace);
        };
        const unsubscribe = await controller.processGlobalSubscription(wrappedCallback, "workspace", "opened");
        return unsubscribe;
    };

    const onWorkspaceClosed = async (callback: (closed: { frameId: string; workspaceId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> => {
        checkThrowCallback(callback);

        const wrappedCallback = (payload: WorkspaceStreamData): void => {
            callback({ frameId: payload.frameSummary.id, workspaceId: payload.workspaceSummary.id });
        };

        const unsubscribe = await controller.processGlobalSubscription(wrappedCallback, "workspace", "closed");
        return unsubscribe;
    };

    const onWindowAdded = async (callback: (swimlaneWindow: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> => {
        checkThrowCallback(callback);
        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            const snapshot = (await controller.getSnapshot(payload.windowSummary.config.workspaceId, "workspace")) as WorkspaceSnapshotResult;

            const frameConfig: FrameCreateConfig = {
                summary: snapshot.frameSummary
            };
            const frame = ioc.getModel<"frame">("frame", frameConfig);

            const workspaceConfig: WorkspaceIoCCreateConfig = { frame, snapshot };

            const workspace = ioc.getModel<"workspace">("workspace", workspaceConfig);

            const windowParent = workspace.getBox((parent) => parent.id === payload.windowSummary.parentId);
            const foundWindow = windowParent.children.find((child) => child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex);

            callback(foundWindow as Glue42Workspaces.WorkspaceWindow);
        };
        const unsubscribe = await controller.processGlobalSubscription(wrappedCallback, "window", "added");
        return unsubscribe;
    };

    const onWindowLoaded = async (callback: (swimlaneWindow: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> => {
        checkThrowCallback(callback);
        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            const snapshot = (await controller.getSnapshot(payload.windowSummary.config.workspaceId, "workspace")) as WorkspaceSnapshotResult;

            const frameConfig: FrameCreateConfig = {
                summary: snapshot.frameSummary
            };
            const frame = ioc.getModel<"frame">("frame", frameConfig);

            const workspaceConfig: WorkspaceIoCCreateConfig = { frame, snapshot };

            const workspace = ioc.getModel<"workspace">("workspace", workspaceConfig);

            const foundWindow = workspace.getWindow((win) => win.id && win.id === payload.windowSummary.config.windowId);

            callback(foundWindow);
        };
        const unsubscribe = await controller.processGlobalSubscription(wrappedCallback, "window", "loaded");
        return unsubscribe;
    };

    const onWindowRemoved = async (callback: (removed: { windowId: string; workspaceId: string; frameId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> => {
        checkThrowCallback(callback);
        const wrappedCallback = (payload: WindowStreamData): void => {
            const { windowId, workspaceId, frameId } = payload.windowSummary.config;
            callback({ windowId, workspaceId, frameId });
        };
        const unsubscribe = await controller.processGlobalSubscription(wrappedCallback, "window", "removed");
        return unsubscribe;
    };

    return {
        inWorkspace,
        getBuilder,
        getMyFrame,
        getFrame,
        getAllFrames,
        getAllWorkspacesSummaries,
        getMyWorkspace,
        getWorkspace,
        getAllWorkspaces,
        getWindow,
        getBox: getParent,
        restoreWorkspace,
        createWorkspace,
        layouts,
        onFrameOpened,
        onFrameClosed,
        onWorkspaceOpened,
        onWorkspaceClosed,
        onWindowAdded,
        onWindowLoaded,
        onWindowRemoved,
    };
};
