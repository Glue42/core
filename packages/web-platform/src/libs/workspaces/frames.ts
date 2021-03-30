import { Glue42Web } from "@glue42/web";
import { Glue42Workspaces } from "@glue42/workspaces-api";
import { generate } from "shortid";
import { Glue42WebPlatform } from "../../../platform";
import { BridgeOperation } from "../../common/types";
import { GlueController } from "../../controllers/glue";
import { SessionStorageController } from "../../controllers/session";
import { IoC } from "../../shared/ioc";
import { PromisePlus } from "../../shared/promisePlus";
import { FrameInstance, FrameLock, FrameQueryConfig, FrameSessionData, FrameSummaryResult, GetFrameSummaryConfig } from "./types";

export class FramesController {
    private config!: Glue42WebPlatform.Workspaces.Config;
    private defaultBounds!: Glue42Web.Windows.Bounds;
    private frameSummaryOperation!: BridgeOperation;
    private locks: { [key: string]: FrameLock } = {};
    private defaultFrameHelloTimeoutMs = 15000;
    private myFrameId: string | undefined;

    constructor(
        private readonly sessionController: SessionStorageController,
        private readonly glueController: GlueController,
        private readonly ioc: IoC
    ) { }

    public async start(config: Glue42WebPlatform.Workspaces.Config, defaultBounds: Glue42Web.Windows.Bounds, frameSummaryOperation: BridgeOperation): Promise<void> {
        this.config = config;
        this.defaultBounds = defaultBounds;
        this.frameSummaryOperation = frameSummaryOperation;

        if (config.isFrame) {
            this.myFrameId = this.sessionController.getAllFrames().find((frame) => frame.isPlatform)?.windowId;
            window.addEventListener("beforeunload", () => {
                if (this.myFrameId) {
                    this.clearAllWorkspaceWindows(this.myFrameId);
                }
            });
        }
    }

    public async openFrame(newFrameConfig?: Glue42Workspaces.NewFrameConfig | boolean): Promise<FrameInstance> {

        const providedBounds = typeof newFrameConfig === "object" ? newFrameConfig.bounds ?? {} : {};

        const openBounds: Glue42Web.Windows.Bounds = {
            top: providedBounds.top ?? this.defaultBounds.top,
            left: providedBounds.left ?? this.defaultBounds.left,
            width: providedBounds.width ?? this.defaultBounds.width,
            height: providedBounds.height ?? this.defaultBounds.height
        };

        const frameWindowId = generate();

        const frameData: FrameSessionData = {
            windowId: frameWindowId,
            active: false,
            isPlatform: false
        };

        const options = `left=${openBounds.left},top=${openBounds.top},width=${openBounds.width},height=${openBounds.height}`;

        const frameUrl = `${this.config.src}?emptyFrame=true`;

        const childWindow = window.open(frameUrl, frameData.windowId, options);

        if (!childWindow) {
            throw new Error("Cannot open a new workspace frame, because the user has not allowed popups or uses a blocker");
        }

        this.sessionController.saveFrameData(frameData);

        try {
            await this.waitHello(frameData.windowId);
            return { windowId: frameData.windowId };
        } catch (error) {
            delete this.locks[frameData.windowId];
            throw new Error("Cannot open a new frame, because the workspace frame app did not send a hello in time");
        }
    }

    public async closeFrame(windowId: string): Promise<void> {
        const frameData = this.sessionController.getFrameData(windowId);

        if (!frameData) {
            throw new Error(`Cannot close a frame with id: ${windowId}, because it is not known by the platform`);
        }

        this.handleFrameDisappeared(windowId);

        window.open(undefined, windowId)?.close();
    }

    public processNewHello(windowId: string): void {
        const frameData = this.sessionController.getFrameData(windowId);

        if (!frameData) {
            return;
        }

        this.sessionController.setFrameActive(windowId);

        this.locks[windowId]?.lift();
    }

    public handleFrameDisappeared(frameId: string): void {
        const foundFrame = this.sessionController.getFrameData(frameId);

        if (!foundFrame) {
            return;
        }

        this.sessionController.removeFrameData(frameId);

        this.clearAllWorkspaceWindows(frameId);
    }

    public getAll(): FrameInstance[] {
        const allFrames = this.sessionController.getAllFrames();

        return allFrames.filter((frame) => frame.active).map((frame) => ({ windowId: frame.windowId }));
    }

    public async getFrameInstance(config?: FrameQueryConfig): Promise<FrameInstance> {
        const props: Array<"frameId" | "itemId" | "newFrame"> = ["frameId", "itemId", "newFrame"];

        if (config) {
            const definedKeys = props.reduce<string[]>((soFar, prop) => {
                if (config[prop]) {
                    soFar.push(prop);
                }
                return soFar;
            }, []);

            if (definedKeys.length > 1) {
                throw new Error(`Cannot retrieve the frame, because of over-specification: the provided selection object must have either 1 or none of the possible properties: ${JSON.stringify(config)}`);
            }
        }

        const allFrames = this.getAll();

        if (config?.frameId) {
            const foundFrame = allFrames.find((frame) => frame.windowId === config.frameId);

            if (!foundFrame) {
                throw new Error(`Cannot retrieve a frame with Id: ${config.frameId}, because it is not known by the platform`);
            }

            return foundFrame;
        }

        if (config?.itemId) {
            return this.getFrameByItemId(config.itemId, allFrames);
        }

        if (config?.newFrame) {
            return this.openFrame(config.newFrame);
        }

        return allFrames.length ? this.getLastOpenedFrame() : this.openFrame();
    }

    private clearAllWorkspaceWindows(frameId: string): void {
        const workspaceWindows = this.sessionController.pickWorkspaceClients((client) => client.frameId === frameId);

        workspaceWindows.forEach((workspaceWindow) => this.ioc.applicationsController.unregisterWorkspaceApp({windowId: workspaceWindow.windowId}));
    }

    private async waitHello(windowId: string): Promise<void> {
        return PromisePlus((resolve) => {
            this.locks[windowId] = { lift: resolve };
        }, this.defaultFrameHelloTimeoutMs, "Frame hello timed out");
    }

    private getLastOpenedFrame(): FrameInstance {
        const allData = this.sessionController.getAllFrames().filter((frame) => frame.active);

        return allData[allData.length - 1];
    }

    private async getFrameByItemId(itemId: string, frames: FrameInstance[]): Promise<FrameInstance> {
        if (!frames.length) {
            throw new Error(`Cannot get frame by item id for: ${itemId}, because not frames were found`);
        }

        for (const frame of frames) {
            const queryResult = await this.glueController.callFrame<GetFrameSummaryConfig, FrameSummaryResult>(this.frameSummaryOperation, { itemId }, frame.windowId);

            if (queryResult.id !== "none") {
                return frame;
            }
        }

        throw new Error(`Cannot find frame for item: ${itemId}`);
    }

}
