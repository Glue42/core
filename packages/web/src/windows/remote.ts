import { Glue42Web } from "../../web";
import { Control } from "../control/control";
import { UnsubscribeFunction } from "callback-registry";
import { Windows } from "./main";

/**
 * A remote Glue42 enabled browser window
 * Implements Glue42Web.Windows.WebWindow by calling interop methods of the remote window
 */
export class RemoteWebWindow implements Glue42Web.Windows.WebWindow {

    constructor(public id: string, public name: string, private control: Control, private windows: Windows) {
    }

    public async getURL(): Promise<string> {
        const result = await this.callControl("getURL", {});
        return result?.returned?._value;
    }

    public async moveResize(bounds: Glue42Web.Windows.Bounds): Promise<Glue42Web.Windows.WebWindow> {
        await this.callControl("moveResize", bounds, true);
        return this;
    }

    public async close(): Promise<Glue42Web.Windows.WebWindow> {
        return new Promise<Glue42Web.Windows.WebWindow>((resolve, reject) => {

            const done = () => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (un) {
                    un();
                }
            };

            const un = this.windows.onWindowRemoved((w) => {
                if (w.id === this.id) {
                    resolve(this);
                    done();
                }
            });

            const timeout = setTimeout(() => {
                reject(`can not close window - probably not opened by your window`);
                done();
            }, 5000);

            this.callControl("close", {}, true)
                .catch(() => {
                    // do nothing, we can get "Peer has left while waiting for result"
                    // if the window did not have time to respond
                });
        });
    }

    public async setTitle(title: string | { title: string }): Promise<Glue42Web.Windows.WebWindow> {
        if (typeof title === "string") {
            title = { title };
        }
        await this.callControl("setTitle", title, true);
        return this;
    }

    public async resizeTo(width?: number | undefined, height?: number | undefined): Promise<Glue42Web.Windows.WebWindow> {
        await this.callControl("moveResize", { width, height }, true);
        return this;
    }

    public async moveTo(top?: number | undefined, left?: number | undefined): Promise<Glue42Web.Windows.WebWindow> {
        await this.callControl("moveResize", { top, left }, true);
        return this;
    }

    public async focus(): Promise<Glue42Web.Windows.WebWindow> {
        await this.callControl("focus", {}, true);
        return this;
    }

    public async getBounds(): Promise<Glue42Web.Windows.Bounds> {
        const result = await this.callControl("getBounds", {});
        return result.returned;
    }

    public async getContext(): Promise<any> {
        const result = await this.callControl("getContext", {});
        return result.returned;
    }

    public async getTitle(): Promise<string> {
        const result = await this.callControl("getTitle", {});
        return result.returned._value;
    }

    public onContextUpdated(callback: (context: any, oldContext: any) => void): UnsubscribeFunction {
        throw new Error("Method not implemented.");
    }

    public async updateContext(context: any): Promise<Glue42Web.Windows.WebWindow> {
        await this.callControl("updateContext", context, true);
        return this;
    }

    public async setContext(context: any): Promise<Glue42Web.Windows.WebWindow> {
        await this.callControl("setContext", context, true);
        return this;
    }

    private async callControl(command: string, args: object, skipResult: boolean = false) {
        return await this.control.send(
            { command, domain: "windows", args, skipResult },
            { windowId: this.id });
    }
}
