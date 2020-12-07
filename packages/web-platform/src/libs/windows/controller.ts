/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Glue42Web } from "@glue42/web";
import { generate } from "shortid";
import { BridgeOperation, CoreClientData, InternalPlatformConfig, LibController, SessionWindowData } from "../../common/types";
import { GlueController } from "../../controllers/glue";
import { SessionStorageController } from "../../controllers/session";
import { PromiseWrap } from "../../shared/promisePlus";
import { openWindowConfigDecoder, simpleWindowDecoder, windowBoundsResultDecoder, windowMoveResizeConfigDecoder, windowOperationDecoder, windowTitleConfigDecoder, windowUrlResultDecoder } from "./decoders";
import { StateController } from "../../controllers/state";
import { HelloSuccess, OpenWindowConfig, OpenWindowSuccess, SimpleWindowCommand, WindowBoundsResult, WindowMoveResizeConfig, WindowOperationsTypes, WindowTitleConfig, WindowUrlResult } from "./types";
import { getRelativeBounds } from "../../shared/utils";
import logger from "../../shared/logger";
import { SimpleItemConfig, WorkspaceWindowData } from "../workspaces/types";
import { workspaceWindowDataDecoder } from "../workspaces/decoders";
import { IoC } from "../../shared/ioc";

export class WindowsController implements LibController {
    private started = false;
    private clientResponseTimeoutMs!: number;
    private defaultBounds!: Glue42Web.Windows.Bounds;

    private operations: { [key in WindowOperationsTypes]: BridgeOperation } = {
        openWindow: { name: "openWindow", execute: this.openWindow.bind(this), dataDecoder: openWindowConfigDecoder },
        windowHello: { name: "windowHello", execute: this.handleWindowHello.bind(this) },
        getBounds: { name: "getBounds", dataDecoder: simpleWindowDecoder, resultDecoder: windowBoundsResultDecoder, execute: this.handleGetBounds.bind(this) },
        getUrl: { name: "getUrl", dataDecoder: simpleWindowDecoder, resultDecoder: windowUrlResultDecoder, execute: this.handleGetUrl.bind(this) },
        moveResize: { name: "moveResize", dataDecoder: windowMoveResizeConfigDecoder, execute: this.handleMoveResize.bind(this) },
        focus: { name: "focus", dataDecoder: simpleWindowDecoder, execute: this.handleFocus.bind(this) },
        close: { name: "close", dataDecoder: simpleWindowDecoder, execute: this.handleClose.bind(this) },
        getTitle: { name: "getTitle", dataDecoder: simpleWindowDecoder, resultDecoder: windowTitleConfigDecoder, execute: this.handleGetTitle.bind(this) },
        setTitle: { name: "setTitle", dataDecoder: windowTitleConfigDecoder, execute: this.handleSetTitle.bind(this) },
        registerWorkspaceWindow: { name: "registerWorkspaceWindow", dataDecoder: workspaceWindowDataDecoder, execute: this.registerWorkspaceWindow.bind(this) },
        unregisterWorkspaceWindow: { name: "unregisterWorkspaceWindow", dataDecoder: simpleWindowDecoder, execute: this.handleWorkspaceClientRemoval.bind(this) }
    }

    constructor(
        private readonly glueController: GlueController,
        private readonly sessionController: SessionStorageController,
        private readonly stateController: StateController,
        private readonly ioc: IoC
    ) { }

    private get logger(): Glue42Web.Logger.API | undefined {
        return logger.get("windows.controller");
    }

    public get moveResizeOperation(): BridgeOperation {
        return this.operations.moveResize;
    }

    public async start(config: InternalPlatformConfig): Promise<void> {
        this.clientResponseTimeoutMs = config.windows.windowResponseTimeoutMs;
        this.defaultBounds = config.windows.defaultWindowOpenBounds;

        this.started = true;

        this.stateController.onWindowDisappeared(this.cleanUpWindow.bind(this));
    }

    public async handleControl(args: any): Promise<void> {
        if (!this.started) {
            new Error("Cannot handle this windows control message, because the controller has not been started");
        }

        const windowsData = args.data;

        const commandId = args.commandId;

        const operationValidation = windowOperationDecoder.run(args.operation);

        if (!operationValidation.ok) {
            throw new Error(`This window request cannot be completed, because the operation name did not pass validation: ${JSON.stringify(operationValidation.error)}`);
        }

        const operationName: WindowOperationsTypes = operationValidation.result;

        const incomingValidation = this.operations[operationName].dataDecoder?.run(windowsData);

        if (incomingValidation && !incomingValidation.ok) {
            throw new Error(`Windows request for ${operationName} rejected, because the provided arguments did not pass the validation: ${JSON.stringify(incomingValidation.error)}`);
        }

        this.logger?.debug(`[${commandId}] ${operationName} command is valid with data: ${JSON.stringify(windowsData)}`);

        const result = await this.operations[operationName].execute(windowsData, commandId);

        const resultValidation = this.operations[operationName].resultDecoder?.run(result);

        if (resultValidation && !resultValidation.ok) {
            throw new Error(`Windows request for ${operationName} could not be completed, because the operation result did not pass the validation: ${JSON.stringify(resultValidation.error)}`);
        }

        this.logger?.trace(`[${commandId}] ${operationName} command was executed successfully`);

        return result;
    }

    public async getWindowBounds(windowId: string, commandId: string): Promise<Glue42Web.Windows.Bounds> {
        const boundsResult = await this.handleGetBounds({ windowId }, commandId);
        return boundsResult.bounds;
    }

    public async processNewWindow(windowData: SessionWindowData, context?: any, childWindow?: Window): Promise<void> {
        this.logger?.trace(`processing a new window with id: ${windowData.windowId} and name: ${windowData.name}`);
        this.sessionController.saveWindowData(windowData);

        if (childWindow) {
            this.stateController.add(childWindow, windowData.windowId);
        }

        if (context) {
            this.logger?.trace(`setting the context for window ${windowData.windowId}`);
            await this.glueController.setWindowStartContext(windowData.windowId, context);
        }

        this.emitStreamData("windowAdded", windowData);
    }

    public async handleWorkspaceClientRemoval(client: SimpleWindowCommand): Promise<void> {
        return this.cleanUpWindow(client.windowId);
    }

    public handleClientUnloaded(windowId: string, win: Window): void {
        this.logger?.trace(`handling unloading of ${windowId}`);
        if (!windowId) {
            return;
        }

        if (win.closed) {
            this.logger?.trace(`${windowId} detected as closed, processing window cleanup`);
            return this.cleanUpWindow(windowId);
        }

        this.logger?.trace(`${windowId} detected as not closed, adding to state controller`);
        this.stateController.add(win, windowId);
    }

    public cleanUpWindow(windowId: string): void {

        this.stateController.remove(windowId);

        const somethingRemoved = this.sessionController.fullWindowClean(windowId);

        if (somethingRemoved) {
            this.emitStreamData("windowRemoved", { windowId });
        }

    }

    public async registerWorkspaceWindow(data: WorkspaceWindowData, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling workspace window registration with id: ${data.windowId} and name: ${data.name}`);

        this.sessionController.saveWindowData({ windowId: data.windowId, name: data.name });

        this.sessionController.saveWorkspaceClient({ windowId: data.windowId, frameId: data.frameId });

        if (data.context) {
            await this.glueController.setWindowStartContext(data.windowId, data.context);
        }

        this.emitStreamData("windowAdded", { windowId: data.windowId, name: data.name });

        this.logger?.trace(`[${commandId}] workspace window registered successfully with id ${data.windowId} and name ${data.name}`);
    }

    private emitStreamData(operation: string, data: any): void {
        this.logger?.trace(`sending notification of event: ${operation} with data: ${JSON.stringify(data)}`);
        this.glueController.pushSystemMessage("windows", operation, data);
    }

    private async openWindow(config: OpenWindowConfig, commandId: string): Promise<OpenWindowSuccess> {

        const nameExists = this.sessionController.getWindowDataByName(config.name);

        if (nameExists) {
            throw new Error(`Cannot open a window with name: ${config.name}, because a window with that name already exists.`);
        }

        this.logger?.trace(`[${commandId}] handling open command with a valid name: ${config.name}, url: ${config.url} and options: ${JSON.stringify(config.options)}`);

        const windowData: SessionWindowData = {
            name: config.name,
            windowId: generate()
        };

        const openBounds = await this.getStartingBounds(config, commandId);

        const options = `left=${openBounds.left},top=${openBounds.top},width=${openBounds.width},height=${openBounds.height}`;

        this.logger?.trace(`[${commandId}] calling native window open with bounds: ${options}`);

        const childWindow = window.open(config.url, windowData.windowId, options);

        if (!childWindow) {
            throw new Error(`Cannot open window with url: ${config.url} and name: ${config.name}. The most likely reason is that the user has not approved popups or has a blocker.`);
        }

        await this.processNewWindow(windowData, config.options?.context, childWindow);

        this.logger?.trace(`[${commandId}] the new window is opened, saved in session, state and announced, responding to the caller`);

        return windowData;
    }

    private async handleWindowHello(client: { windowId?: string }, commandId: string): Promise<HelloSuccess> {
        this.logger?.trace(`[${commandId}] handling a hello message from a real windowId: ${client.windowId}`);

        if (client.windowId) {
            this.stateController.remove(client.windowId);
        }

        const isWorkspaceFrame = !!(client.windowId && this.sessionController.getFrameData(client.windowId));

        const allWindows = this.sessionController.getAllWindowsData().map<OpenWindowSuccess>((w) => ({ windowId: w.windowId, name: w.name }));

        this.logger?.trace(`[${commandId}] a full list of all current windows has been compiled, sending it to the caller`);

        return { windows: allWindows, isWorkspaceFrame };
    }

    private handleGetUrl(data: SimpleWindowCommand, commandId: string): Promise<WindowUrlResult> {

        const windowData = this.sessionController.getWindowDataById(data.windowId);

        if (!windowData) {
            throw new Error(`Cannot get the url of window: ${data.windowId}, because it is does not exist for the platform`);
        }

        this.logger?.trace(`[${commandId}] handling a get url request for window ${data.windowId}`);

        const timeoutMessage = `Cannot get the url of window: ${data.windowId}, because it is either a non-glue window or it hasn't initiated it's glue yet`;

        return PromiseWrap<WindowUrlResult>(() => this.glueController.callWindow<SimpleWindowCommand, WindowUrlResult>(this.operations.getUrl, data, data.windowId), this.clientResponseTimeoutMs, timeoutMessage);
    }

    private handleGetTitle(data: SimpleWindowCommand, commandId: string): Promise<WindowTitleConfig> {
        const windowData = this.sessionController.getWindowDataById(data.windowId);

        if (!windowData) {
            throw new Error(`Cannot get the title of window: ${data.windowId}, because it is does not exist for the platform`);
        }

        this.logger?.trace(`[${commandId}] handling a get title request for window ${data.windowId}`);

        const timeoutMessage = `Cannot get the title of window: ${data.windowId}, because it is either a non-glue window or it hasn't initiated it's glue yet`;

        return PromiseWrap<WindowTitleConfig>(() => this.glueController.callWindow<SimpleWindowCommand, WindowTitleConfig>(this.operations.getTitle, data, data.windowId), this.clientResponseTimeoutMs, timeoutMessage);
    }

    private handleSetTitle(data: WindowTitleConfig, commandId: string): Promise<void> {
        const windowData = this.sessionController.getWindowDataById(data.windowId);

        if (!windowData) {
            throw new Error(`Cannot set the title of window: ${data.windowId}, because it is does not exist for the platform`);
        }

        this.logger?.trace(`[${commandId}] handling a set title request for window ${data.windowId} and title: ${data.title}`);

        const timeoutMessage = `Cannot set the title of window: ${data.windowId}, because it is either a non-glue window or it hasn't initiated it's glue yet`;

        return PromiseWrap<void>(() => this.glueController.callWindow<WindowTitleConfig, void>(this.operations.setTitle, data, data.windowId), this.clientResponseTimeoutMs, timeoutMessage);
    }

    private handleMoveResize(data: WindowMoveResizeConfig, commandId: string): Promise<void> {
        const workspaceClient = this.sessionController.getWorkspaceClientById(data.windowId);

        if (workspaceClient) {
            throw new Error(`Cannot move resize window id ${data.windowId}, because it is in a workspace. Consider using the workspaces API to get more control`);
        }

        const windowData = this.sessionController.getWindowDataById(data.windowId);

        if (!windowData) {
            throw new Error(`Cannot move resize window: ${data.windowId}, because it is does not exist for the platform`);
        }

        if (windowData.name === "Platform") {
            throw new Error("Move-resizing the main application is not allowed");
        }

        this.logger?.trace(`[${commandId}] handling a move resize request for window ${data.windowId} and data: ${JSON.stringify(data)}`);

        const timeoutMessage = `Cannot move resize window: ${data.windowId}, because it is either a non-glue window or it hasn't initiated it's glue yet`;

        return PromiseWrap<void>(() => this.glueController.callWindow<WindowMoveResizeConfig, void>(this.operations.moveResize, data, data.windowId), this.clientResponseTimeoutMs, timeoutMessage);
    }

    private handleGetBounds(data: SimpleWindowCommand, commandId: string): Promise<WindowBoundsResult> {
        const workspaceClient = this.sessionController.getWorkspaceClientById(data.windowId);

        if (workspaceClient) {
            throw new Error(`Cannot get bounds of window id ${data.windowId}, because it is in a workspace. Consider using the workspaces API to get more info`);
        }

        const windowData = this.sessionController.getWindowDataById(data.windowId);

        if (!windowData) {
            throw new Error(`Cannot get the bounds of window: ${data.windowId}, because it is does not exist for the platform`);
        }

        this.logger?.trace(`[${commandId}] handling a get bounds request for window ${data.windowId}`);

        const timeoutMessage = `Cannot get the bounds of window: ${data.windowId}, because it is either a non-glue window or it hasn't initiated it's glue yet`;

        return PromiseWrap<WindowBoundsResult>(() => this.glueController.callWindow<SimpleWindowCommand, WindowBoundsResult>(this.operations.getBounds, data, data.windowId), this.clientResponseTimeoutMs, timeoutMessage);
    }

    private async handleFocus(data: SimpleWindowCommand, commandId: string): Promise<void> {
        const workspaceClient = this.sessionController.getWorkspaceClientById(data.windowId);

        if (workspaceClient) {
            throw new Error(`Cannot focus window id ${data.windowId}, because it is in a workspace. Consider using the workspaces API to get more control`);
        }

        const windowData = this.sessionController.getWindowDataById(data.windowId);

        if (!windowData) {
            throw new Error(`Cannot focus window: ${data.windowId}, because it is not known by the platform`);
        }

        if (windowData.name === "Platform") {
            throw new Error("Focusing the main application is not allowed");
        }

        this.logger?.trace(`[${commandId}] handling a focus request for window ${data.windowId}`);

        window.open(undefined, windowData.windowId);
    }

    private async handleClose(data: SimpleWindowCommand, commandId: string): Promise<void> {
        const workspaceClient = this.sessionController.getWorkspaceClientById(data.windowId);

        if (workspaceClient) {
            this.logger?.trace(`[${commandId}] this window is detected as a workspace window, closing via the workspaces controller`);

            await this.ioc.workspacesController.closeItem({ itemId: data.windowId }, commandId);

            return;
        }

        const windowData = this.sessionController.getWindowDataById(data.windowId);

        if (!windowData) {
            throw new Error(`Cannot close window: ${data.windowId}, because it is not known by the platform`);
        }

        if (windowData.name === "Platform") {
            throw new Error("Closing the main application is not allowed");
        }

        this.logger?.trace(`[${commandId}] handling a close request for window ${data.windowId}`);

        window.open(undefined, windowData.windowId)?.close();

        this.cleanUpWindow(windowData.windowId);

        this.logger?.trace(`[${commandId}] window ${data.windowId} has been closed, removed from session, state and announced`);
    }

    private async getStartingBounds(config: OpenWindowConfig, commandId: string): Promise<Glue42Web.Windows.Bounds> {
        const openBounds = {
            top: config.options?.top ?? this.defaultBounds.top,
            left: config.options?.left ?? this.defaultBounds.left,
            height: config.options?.height ?? this.defaultBounds.height,
            width: config.options?.width ?? this.defaultBounds.width
        };

        if (!config.options?.relativeTo) {
            return openBounds;
        }

        const relativeWindowId = config.options.relativeTo;

        const windowData = this.sessionController.getWindowDataById(relativeWindowId);

        if (!windowData) {
            return openBounds;
        }

        try {
            const boundsResult = await this.handleGetBounds({ windowId: windowData.windowId }, commandId);

            const relativeWindowBounds = boundsResult.bounds;

            const relativeDir = config.options.relativeDirection ?? "right";

            const newBounds = getRelativeBounds(openBounds, relativeWindowBounds, relativeDir);

            return newBounds;
        } catch (error) {
            return openBounds;
        }
    }

}
