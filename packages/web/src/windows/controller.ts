/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { Glue42Web } from "../../web";
import { GlueBridge } from "../communication/bridge";
import { nonEmptyStringDecoder, windowOpenSettingsDecoder, windowOperationTypesDecoder } from "../shared/decoders";
import { LibController } from "../shared/types";
import { HelloSuccess, OpenWindowConfig, CoreWindowData, WindowHello, operations, WindowBoundsResult, WindowTitleConfig, WindowUrlResult, WindowMoveResizeConfig, WindowProjection } from "./protocol";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";
import { IoC } from "../shared/ioc";

export class WindowsController implements LibController {

    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private platformRegistration!: Promise<void>;
    private ioc!: IoC;
    private bridge!: GlueBridge;
    private publicWindowId!: string;
    private actualWindowId: string | undefined;
    private allWindowProjections: WindowProjection[] = [];
    private me!: Glue42Web.Windows.WebWindow;
    private logger!: Glue42Web.Logger.API;

    public async start(coreGlue: Glue42Core.GlueCore, ioc: IoC): Promise<void> {

        this.logger = coreGlue.logger.subLogger("windows.controller.web");

        this.logger.trace("starting the web windows controller");

        this.publicWindowId = (coreGlue as any).connection.transport.publicWindowId;
        this.actualWindowId = coreGlue.interop.instance.windowId;

        this.addWindowOperationExecutors();

        this.ioc = ioc;
        this.bridge = ioc.bridge;

        this.logger.trace(`set the public window id: ${this.publicWindowId} and actual window id: ${this.actualWindowId}, set the bridge operations and ioc, registering with the platform now`);

        this.platformRegistration = this.registerWithPlatform();

        await this.platformRegistration;

        this.logger.trace("registration with the platform successful, attaching the windows property to glue and returning");

        const api = this.toApi();

        (coreGlue as Glue42Web.API).windows = api;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async handleBridgeMessage(args: any): Promise<void> {
        await this.platformRegistration;

        const operationName = windowOperationTypesDecoder.runWithException(args.operation);

        const operation = operations[operationName];

        if (!operation.execute) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let operationData: any = args.data;

        if (operation.dataDecoder) {
            operationData = operation.dataDecoder.runWithException(args.data);
        }

        return await operation.execute(operationData);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async open(name: string, url: string, options?: Glue42Web.Windows.Settings): Promise<Glue42Web.Windows.WebWindow> {
        nonEmptyStringDecoder.runWithException(name);
        nonEmptyStringDecoder.runWithException(url);
        const settings = windowOpenSettingsDecoder.runWithException(options);

        const windowSuccess = await this.bridge.send<OpenWindowConfig, CoreWindowData>("windows", operations.openWindow, { name, url, options: settings });

        const projection = await this.ioc.buildWebWindow(windowSuccess.windowId, windowSuccess.name);

        return projection.api;
    }

    private list(): Glue42Web.Windows.WebWindow[] {
        return this.allWindowProjections.map((projection) => projection.api);
    }

    private findById(id: string): Glue42Web.Windows.WebWindow | undefined {
        nonEmptyStringDecoder.runWithException(id);

        return this.allWindowProjections.find((projection) => projection.id === id)?.api;
    }

    private toApi(): Glue42Web.Windows.API {
        return {
            open: this.open.bind(this),
            my: this.my.bind(this),
            list: this.list.bind(this),
            findById: this.findById.bind(this),
            onWindowAdded: this.onWindowAdded.bind(this),
            onWindowRemoved: this.onWindowRemoved.bind(this)
        };
    }

    private addWindowOperationExecutors(): void {
        operations.windowAdded.execute = this.handleWindowAdded.bind(this);
        operations.windowRemoved.execute = this.handleWindowRemoved.bind(this);
        operations.getBounds.execute = this.handleGetBounds.bind(this);
        operations.getFrameBounds.execute = this.handleGetBounds.bind(this);
        operations.getTitle.execute = this.handleGetTitle.bind(this);
        operations.getUrl.execute = this.handleGetUrl.bind(this);
        operations.moveResize.execute = this.handleMoveResize.bind(this);
        operations.setTitle.execute = this.handleSetTitle.bind(this);
    }

    private my(): Glue42Web.Windows.WebWindow {
        return Object.assign({}, this.me);
    }

    private onWindowAdded(callback: (window: Glue42Web.Windows.WebWindow) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Cannot subscribe to window added, because the provided callback is not a function!");
        }

        return this.registry.add("window-added", callback);
    }

    private onWindowRemoved(callback: (window: Glue42Web.Windows.WebWindow) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Cannot subscribe to window removed, because the provided callback is not a function!");
        }

        return this.registry.add("window-removed", callback);
    }

    private async sayHello(): Promise<HelloSuccess> {
        const helloSuccess = await this.bridge.send<WindowHello, HelloSuccess>("windows", operations.windowHello, { windowId: this.actualWindowId });

        return helloSuccess;
    }

    private async registerWithPlatform(): Promise<void> {

        const { windows, isWorkspaceFrame } = await this.sayHello();

        this.logger.trace("the platform responded to the hello message");

        if (!isWorkspaceFrame) {
            this.logger.trace("i am not treated as a workspace frame, setting my window");

            const myWindow = windows.find((w) => w.windowId === this.publicWindowId);

            if (!myWindow) {
                throw new Error("Cannot initialize the window library, because I received no information about me from the platform");
            }

            this.me = (await this.ioc.buildWebWindow(this.publicWindowId, myWindow.name)).api;
        }

        const currentWindows = await Promise.all(windows.map((w) => this.ioc.buildWebWindow(w.windowId, w.name)));

        this.logger.trace("all windows projections are completed, building the list collection");

        this.allWindowProjections.push(...currentWindows);
    }

    private async handleWindowAdded(data: CoreWindowData): Promise<void> {
        if (this.allWindowProjections.some((projection) => projection.id === data.windowId)) {
            return;
        }

        const webWindowProjection = await this.ioc.buildWebWindow(data.windowId, data.name);
        this.allWindowProjections.push(webWindowProjection);

        this.registry.execute("window-added", webWindowProjection.api);
    }

    private async handleWindowRemoved(data: CoreWindowData): Promise<void> {
        const removed = this.allWindowProjections.find((w) => w.id === data.windowId);

        if (!removed) {
            return;
        }

        this.allWindowProjections = this.allWindowProjections.filter((w) => w.id !== data.windowId);

        removed.model.clean();

        this.registry.execute("window-removed", removed.api);
    }

    private async handleGetBounds(): Promise<WindowBoundsResult> {
        // this.me is optional, because this handler responds to a workspace frame bounds request and the frame is not a regular GD window
        return {
            windowId: this.me?.id,
            bounds: {
                top: window.screenTop,
                left: window.screenLeft,
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }

    private async handleGetTitle(): Promise<WindowTitleConfig> {
        return {
            windowId: this.me.id,
            title: document.title
        };
    }

    private async handleGetUrl(): Promise<WindowUrlResult> {
        return {
            windowId: this.me.id,
            url: window.location.href
        };
    }

    private async handleMoveResize(config: WindowMoveResizeConfig): Promise<void> {

        const targetTop = typeof config.top === "number" ? config.top :
            config.relative ? 0 : window.screenTop;

        const targetLeft = typeof config.left === "number" ? config.left :
            config.relative ? 0 : window.screenLeft;

        const targetHeight = typeof config.height === "number" ? config.height :
            config.relative ? 0 : window.innerHeight;

        const targetWidth = typeof config.width === "number" ? config.width :
            config.relative ? 0 : window.innerWidth;

        const moveMethod = config.relative ? window.moveBy : window.moveTo;
        const resizeMethod = config.relative ? window.resizeBy : window.resizeTo;

        moveMethod(targetLeft, targetTop);
        resizeMethod(targetWidth, targetHeight);
    }

    private async handleSetTitle(config: WindowTitleConfig): Promise<void> {
        document.title = config.title;
    }
}
