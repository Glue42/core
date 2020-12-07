import { SessionStorageController } from "./session";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";
import { Glue42Core } from "@glue42/core";
import logger from "../shared/logger";

export class StateController {
    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private readonly checkIntervalMs = 500;
    private childrenToCheck: Array<{ window: Window; windowId: string }> = [];
    private checkerCancelled = false;
    private currentTimeout: NodeJS.Timeout | undefined;

    constructor(private readonly sessionStorage: SessionStorageController) { }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("state.controller");
    }

    public start(): void {
        const nonGlueWindows = this.sessionStorage.getAllNonGlue();

        nonGlueWindows.forEach((w) => {
            this.logger?.trace(`detected non glue window with id ${w.windowId} from previous session, attempting reference refresh`);
            const nativeWindow = window.open(undefined, w.windowId);
            if (nativeWindow) {
                this.childrenToCheck.push({ window: nativeWindow, windowId: w.windowId });
            }
        });

        this.checkWindows();
    }

    public add(child: Window, windowId: string): void {
        this.logger?.trace(`adding window id: ${windowId} to non glue state checking`);
        const saved = this.sessionStorage.saveNonGlue({ windowId });

        if (saved) {
            this.childrenToCheck.push({ window: child, windowId });
        }

    }

    public remove(windowId: string): void {
        this.logger?.trace(`removing window id: ${windowId} from non glue state checking`);
        this.sessionStorage.removeNonGlue({ windowId });
        this.childrenToCheck = this.childrenToCheck.filter((w) => w.windowId !== windowId);
    }

    public cancel(): void {
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }
        this.checkerCancelled = true;
    }

    public onWindowDisappeared(cb: (windowId: string) => void | Promise<void>): UnsubscribeFunction {
        return this.registry.add("window-disappear", cb);
    }

    private checkWindows(): void {
        if (this.checkerCancelled) {
            return;
        }

        this.childrenToCheck.forEach((child) => {
            if (!child.window || child.window.closed) {
                this.logger?.trace(`non glue window ${child.windowId} has disappeared, removing from collections and announcing.`);
                this.remove(child.windowId);
                this.registry.execute("window-disappear", child.windowId);
                return;
            }
        });

        this.currentTimeout = setTimeout(this.checkWindows.bind(this), this.checkIntervalMs);
    }
}