import { Glue42Web } from "../../web";
import shortid from "shortid";
import { RemoteWebWindow } from "./remote";
import { Control } from "../control/control";
import { LocalWebWindow } from "./my";
import { default as CallbackFactory, UnsubscribeFunction } from "callback-registry";
import { ChildWebWindow } from "./child";
import { registerChildStartupContext } from "./startup";

export class Windows implements Glue42Web.Windows.API {
    private registry = CallbackFactory();
    private childWindows: ChildWebWindow[] = [];
    private myWindow: LocalWebWindow;

    constructor(private interop: Glue42Web.Interop.API, private control: Control) {
        const id = interop.instance.windowId as string;
        const name = `document.title (${shortid()})`;
        this.myWindow = new LocalWebWindow(id, name, window, this.control, this.interop);

        this.trackWindowsLifetime();
    }

    public list(): Glue42Web.Windows.WebWindow[] {
        const method = this.interop.methods({ name: Control.CONTROL_METHOD })[0];
        if (!method) {
            return [];
        }

        const servers = method.getServers ? method.getServers() : [];

        return servers.reduce<RemoteWebWindow[]>((prev: RemoteWebWindow[], current) => {
            const remoteWindow = this.remoteFromServer(current);
            if (remoteWindow) {
                prev.push(remoteWindow);
            }
            return prev;
        }, []);
    }

    public findById(id: string): Glue42Web.Windows.WebWindow | undefined {
        return this.list().find((w) => w.id === id);
    }

    public my(): Glue42Web.Windows.WebWindow {
        return this.myWindow;
    }

    public async open(name: string, url: string, options?: Glue42Web.Windows.CreateOptions | undefined): Promise<Glue42Web.Windows.WebWindow> {
        let width = options?.width ?? 400;
        let height = options?.height ?? 400;
        let left = options?.left ?? window.screen.availWidth - window.screenLeft;
        let top = options?.top ?? 0;
        const id = shortid();

        await registerChildStartupContext(this.interop, this.my().id, id, name, options);

        if (options?.relativeTo) {
            const relativeWindowId = options.relativeTo;
            const relativeWindow = this.list().find((w) => w.id === relativeWindowId);
            if (relativeWindow) {
                const relativeWindowBounds = await relativeWindow.getBounds();
                const relativeDir = options.relativeDirection ?? "right";
                const newBounds = this.getRelativeBounds({ width, height, left, top }, relativeWindowBounds, relativeDir);
                width = newBounds.width;
                height = newBounds.height;
                left = newBounds.left;
                top = newBounds.top;
            }
        }

        const optionsString = `width=${width},height=${height},left=${left},top=${top},scrollbars=none,location=no,status=no,menubar=no`;
        const newWindow = window.open(url, id, optionsString);
        if (!newWindow) {
            throw new Error(`failed to open a window with url=${url} and options=${optionsString}`);
        }
        // adjust bounds
        newWindow.focus();
        newWindow.moveTo(left, top);
        newWindow.resizeTo(width, height);
        const remoteWindow = new ChildWebWindow(newWindow, id, name, this.control, this);
        this.childWindows.push(remoteWindow);
        return remoteWindow;
    }

    public onWindowAdded(callback: (window: Glue42Web.Windows.WebWindow) => void): UnsubscribeFunction {
        return this.registry.add("window-added", callback);
    }

    public onWindowRemoved(callback: (window: Glue42Web.Windows.WebWindow) => void): UnsubscribeFunction {
        return this.registry.add("window-removed", callback);
    }

    public getChildWindows(): RemoteWebWindow[] {
        // remove the closed windows
        this.childWindows = this.childWindows.filter((cw) => !cw.window.closed);
        return this.childWindows;
    }

    private remoteFromServer(server: Glue42Web.Interop.Instance): RemoteWebWindow | undefined {
        if (!server.windowId) {
            return undefined;
        }
        return new RemoteWebWindow(server.windowId, server.application ?? "", this.control, this);
    }

    private getRelativeBounds(rect: Glue42Web.Windows.Bounds, relativeTo: Glue42Web.Windows.Bounds, relativeDirection: Glue42Web.Windows.RelativeDirection): Glue42Web.Windows.Bounds {
        const edgeDistance = 0;
        switch (relativeDirection) {
            case "bottom":
                return {
                    left: relativeTo.left,
                    top: relativeTo.top + relativeTo.height + edgeDistance,
                    width: relativeTo.width,
                    height: rect.height
                };
            case "top":
                return {
                    left: relativeTo.left,
                    top: relativeTo.top - rect.height - edgeDistance,
                    width: relativeTo.width,
                    height: rect.height
                };
            case "right":
                return {
                    left: relativeTo.left + relativeTo.width + edgeDistance,
                    top: relativeTo.top,
                    width: rect.width,
                    height: relativeTo.height
                };
            case "left":
                return {
                    left: relativeTo.left - rect.width - edgeDistance,
                    top: relativeTo.top,
                    width: rect.width,
                    height: relativeTo.height
                };
            default:
                throw new Error("invalid relativeDirection");
        }
    }

    private trackWindowsLifetime() {
        // when a new control method appears we have a new Glue42 Core window in our environment
        this.interop.serverMethodAdded(({ server, method }) => {
            if (method.name !== Control.CONTROL_METHOD) {
                return;
            }
            const remoteWindow = this.remoteFromServer(server);
            if (remoteWindow) {
                this.registry.execute("window-added", remoteWindow);
            }
        });

        // when a server is removed we lost a Glue42 Core window from our environment
        this.interop.serverRemoved((server) => {
            const remoteWindow = this.remoteFromServer(server);
            if (remoteWindow) {
                this.registry.execute("window-removed", remoteWindow);
            }
        });
    }

}
