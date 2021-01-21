import { Bounds } from "./types/internal";
import callbackRegistry from "callback-registry";
import { generate } from "shortid";
import { Glue42Web } from "@glue42/web";

export class IFrameController {
    private readonly _registry = callbackRegistry();
    private _idToFrame: { [k: string]: HTMLIFrameElement } = {};
    private readonly _glue: Glue42Web.API;
    constructor(glue: Glue42Web.API) {
        this._glue = glue;
    }

    public async startFrame(id: string, url: string, layoutState?: object, windowId?: string): Promise<HTMLIFrameElement> {
        windowId = windowId || generate();
        if (this._idToFrame[id]) {
            return this._idToFrame[id];
        }

        if (!url) {
            throw new Error(`The url of window with itemId ${id} is undefined`);
        }

        const frame: HTMLIFrameElement = document.createElement("iframe");
        frame.name = `${windowId}#wsp`;
        frame.src = url;
        document.body.appendChild(frame);

        // $(frame).on("load", () => {
        //     try {
        //         const frameDocument = frame.contentDocument || frame.contentWindow.document;

        //         frameDocument.onclick = () => {
        //             this._registry.execute("frame-content-clicked", {});
        //         };

        //         if (layoutState) {
        //             // this.sendLayoutState(id, layoutState);
        //         }

        //         const target = frameDocument.querySelector("title");
        //         const observer = new MutationObserver(() => {
        //             this._registry.execute("window-title-changed", id, frameDocument.title);
        //         });

        //         const config = {
        //             childList: true,
        //         };

        //         if (target) {
        //             observer.observe(target, config);
        //         }

        //         if (frameDocument.title) {
        //             this._registry.execute("window-title-changed", id, frameDocument.title);
        //         }

        //     } catch (error) {
        //         // tslint:disable-next-line: no-console
        //         // console.warn(error);
        //     }
        // });

        this._registry.execute("frameLoaded", id);

        frame.setAttribute("id", id);
        $(frame).css("position", "absolute");

        this._idToFrame[id] = frame;
        await this.waitForWindow(windowId);

        // if (context) {
        //     const glueWindow = this._glue.windows.findById(windowId);
        //     glueWindow.setContext(context);
        // }

        return frame;
    }

    public moveFrame(id: string, bounds: Bounds) {
        const frame = this._idToFrame[id];

        const jFrame = $(frame);
        jFrame.css("top", `${bounds.top}px`);
        jFrame.css("left", `${bounds.left}px`);
        jFrame.css("width", `${bounds.width}px`);
        jFrame.css("height", `${bounds.height}px`);
    }

    public selectionChanged(toFront: string[], toBack: string[]) {
        toBack.forEach(id => {
            $(this._idToFrame[id]).css("z-index", "-1");
        });

        toFront.forEach(id => {
            if ($(this._idToFrame[id]).hasClass("maximized-active-tab")) {
                $(this._idToFrame[id]).css("z-index", "42");
            } else {
                $(this._idToFrame[id]).css("z-index", "19");
            }
        });
    }

    public maximizeTab(id: string) {
        $(this._idToFrame[id]).addClass("maximized-active-tab");
    }

    public restoreTab(id: string) {
        $(this._idToFrame[id]).removeClass("maximized-active-tab");
    }

    public selectionChangedDeep(toFront: string[], toBack: string[]) {
        toBack.forEach(id => {
            // The numbers is based on the z index of golden layout elements
            $(this._idToFrame[id]).css("z-index", "-1");
        });

        toFront.forEach(id => {
            if ($(this._idToFrame[id]).hasClass("maximized-active-tab")) {
                // The numbers is based on the z index of golden layout elements
                $(this._idToFrame[id]).css("z-index", "42");
            } else {
                // The numbers is based on the z index of golden layout elements
                $(this._idToFrame[id]).css("z-index", "19");
            }
        });
    }

    public bringToFront(id: string) {
        // Z index is this high to guarantee top most position
        $(this._idToFrame[id]).css("z-index", "999");
    }

    public remove(id: string) {
        const frame = this._idToFrame[id];
        if (frame) {
            delete this._idToFrame[id];
            try {
                frame.contentWindow.dispatchEvent(new Event("beforeunload"));
            } catch (error) {
                // tslint:disable-next-line: no-console
                // console.warn(error);
            }
            frame.remove();
        }

    }

    public onFrameLoaded(callback: (frameId: string) => void) {
        return this._registry.add("frameLoaded", callback);
    }

    public onFrameContentClicked(callback: () => void) {
        return this._registry.add("frame-content-clicked", callback);
    }

    public onWindowTitleChanged(callback: (id: string, newTitle: string) => void) {
        return this._registry.add("window-title-changed", callback);
    }

    private waitForWindow(windowId: string) {
        return new Promise<void>((res, rej) => {
            let unsub = () => {
                // safety
            };
            const timeout = setTimeout(() => {
                rej(`Window with id ${windowId} did not appear in 5000ms`);
                unsub();
            }, 5000);

            unsub = this._glue.windows.onWindowAdded((w) => {
                if (w.id === windowId) {
                    unsub();
                    res();
                    clearTimeout(timeout);
                }
            });

            const glueWindow = this._glue.windows.list().find((w) => w.id === windowId);
            if (glueWindow) {
                res();
                unsub();
                clearTimeout(timeout);
            }
        });

    }
}
