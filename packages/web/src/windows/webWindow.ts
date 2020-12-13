/* eslint-disable @typescript-eslint/no-explicit-any */
import { number } from "decoder-validate";
import { Glue42Web } from "../../web";
import { GlueBridge } from "../communication/bridge";
import { anyDecoder, boundsDecoder, nonEmptyStringDecoder, nonNegativeNumberDecoder } from "../shared/decoders";
import { operations, SimpleWindowCommand, WindowBoundsResult, WindowMoveResizeConfig, WindowTitleConfig, WindowUrlResult } from "./protocol";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";

export class WebWindowModel {
    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private readonly myCtxKey: string;
    private ctxUnsubscribe: UnsubscribeFunction | undefined;
    private me!: Glue42Web.Windows.WebWindow;

    constructor(private readonly _id: string, private readonly _name: string, private readonly _bridge: GlueBridge) {
        this.myCtxKey = `___window___${this.id}`;
    }

    public get id(): string {
        return this._id.slice();
    }

    public get name(): string {
        return this._name.slice();
    }

    public clean(): void {
        if (this.ctxUnsubscribe) {
            this.ctxUnsubscribe();
        }
    }

    public async toApi(): Promise<Glue42Web.Windows.WebWindow> {

        this.ctxUnsubscribe = await this._bridge.contextLib.subscribe(this.myCtxKey, (data) => this.registry.execute("context-updated", data));

        const api = {
            id: this.id,
            name: this.name,
            getURL: this.getURL.bind(this),
            moveResize: this.moveResize.bind(this),
            resizeTo: this.resizeTo.bind(this),
            moveTo: this.moveTo.bind(this),
            focus: this.focus.bind(this),
            close: this.close.bind(this),
            getTitle: this.getTitle.bind(this),
            setTitle: this.setTitle.bind(this),
            getBounds: this.getBounds.bind(this),
            getContext: this.getContext.bind(this),
            updateContext: this.updateContext.bind(this),
            setContext: this.setContext.bind(this),
            onContextUpdated: this.onContextUpdated.bind(this)
        };

        this.me = Object.freeze(api);

        return this.me;
    }

    private async getURL(): Promise<string> {
        const result = await this._bridge.send<SimpleWindowCommand, WindowUrlResult>("windows", operations.getUrl, { windowId: this.id });

        return result.url;
    }

    private async moveResize(dimension: Partial<Glue42Web.Windows.Bounds>): Promise<Glue42Web.Windows.WebWindow> {
        const targetBounds = boundsDecoder.runWithException(dimension);

        const commandArgs = Object.assign({}, targetBounds, { windowId: this.id, relative: false });

        await this._bridge.send<WindowMoveResizeConfig, void>("windows", operations.moveResize, commandArgs);

        return this.me;
    }

    private async resizeTo(width?: number, height?: number): Promise<Glue42Web.Windows.WebWindow> {
        if (typeof width === "undefined" && typeof height === "undefined") {
            return this.me;
        }

        if (typeof width !== "undefined") {
            nonNegativeNumberDecoder.runWithException(width);
        }

        if (typeof height !== "undefined") {
            nonNegativeNumberDecoder.runWithException(height);
        }

        const commandArgs = Object.assign({}, { width, height }, { windowId: this.id, relative: true });

        await this._bridge.send<WindowMoveResizeConfig, void>("windows", operations.moveResize, commandArgs);

        return this.me;
    }

    private async moveTo(top?: number, left?: number): Promise<Glue42Web.Windows.WebWindow> {
        if (typeof top === "undefined" && typeof left === "undefined") {
            return this.me;
        }

        if (typeof top !== "undefined") {
            number().runWithException(top);
        }

        if (typeof left !== "undefined") {
            number().runWithException(left);
        }

        const commandArgs = Object.assign({}, { top, left }, { windowId: this.id, relative: true });

        await this._bridge.send<WindowMoveResizeConfig, void>("windows", operations.moveResize, commandArgs);

        return this.me;
    }

    private async focus(): Promise<Glue42Web.Windows.WebWindow> {
        await this._bridge.send<SimpleWindowCommand, void>("windows", operations.focus, { windowId: this.id });

        return this.me;
    }

    private async close(): Promise<Glue42Web.Windows.WebWindow> {
        await this._bridge.send<SimpleWindowCommand, void>("windows", operations.close, { windowId: this.id });

        return this.me;
    }

    private async getTitle(): Promise<string> {
        const result = await this._bridge.send<SimpleWindowCommand, WindowTitleConfig>("windows", operations.getTitle, { windowId: this.id });

        return result.title;
    }

    private async setTitle(title: string): Promise<Glue42Web.Windows.WebWindow> {
        const ttl = nonEmptyStringDecoder.runWithException(title);

        await this._bridge.send<WindowTitleConfig, void>("windows", operations.setTitle, { windowId: this.id, title: ttl });

        return this.me;
    }

    private async getBounds(): Promise<Glue42Web.Windows.Bounds> {
        const result = await this._bridge.send<SimpleWindowCommand, WindowBoundsResult>("windows", operations.getBounds, { windowId: this.id });

        return result.bounds;
    }

    private async getContext(): Promise<any> {
        const ctx = await this._bridge.contextLib.get(this.myCtxKey);
        return ctx;
    }

    private async updateContext(context: any): Promise<Glue42Web.Windows.WebWindow> {
        const ctx = anyDecoder.runWithException(context);

        await this._bridge.contextLib.update(this.myCtxKey, ctx);

        return this.me;
    }

    private async setContext(context: any): Promise<Glue42Web.Windows.WebWindow> {
        const ctx = anyDecoder.runWithException(context);

        await this._bridge.contextLib.set(this.myCtxKey, ctx);

        return this.me;
    }

    private onContextUpdated(callback: (context: any, window: Glue42Web.Windows.WebWindow) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Cannot subscribe to context changes, because the provided callback is not a function!");
        }

        const wrappedCallback = (data: any): void => {
            callback(data, this.me);
        };

        return this.registry.add("context-updated", wrappedCallback);
    }

}
