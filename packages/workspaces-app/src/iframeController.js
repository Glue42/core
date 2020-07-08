"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IFrameController = void 0;
const callback_registry_1 = require("callback-registry");
const shortid_1 = require("shortid");
class IFrameController {
    constructor() {
        this._registry = callback_registry_1.default();
        this._idToFrame = {};
    }
    async startFrame(id, url, layoutState, context, windowId) {
        windowId = windowId || shortid_1.generate();
        if (this._idToFrame[id]) {
            return this._idToFrame[id];
        }
        if (!url) {
            throw new Error(`The url of window with itemId ${id} is undefined`);
        }
        const frame = document.createElement("iframe");
        frame.name = windowId;
        frame.src = url;
        document.body.appendChild(frame);
        $(frame).on("load", () => {
            try {
                const frameDocument = frame.contentDocument || frame.contentWindow.document;
                frameDocument.onclick = () => {
                    this._registry.execute("frame-content-clicked", {});
                };
                if (layoutState) {
                    this.sendLayoutState(id, layoutState);
                }
                const target = frameDocument.querySelector('title');
                const observer = new MutationObserver((_) => {
                    this._registry.execute("window-title-changed", id, frameDocument.title);
                });
                const config = {
                    childList: true,
                };
                observer.observe(target, config);
                this._registry.execute("window-title-changed", id, frameDocument.title);
            }
            catch (error) {
                // tslint:disable-next-line: no-console
                console.warn(error);
            }
        });
        this._registry.execute("frameLoaded", id);
        frame.setAttribute("id", id);
        $(frame).css("position", "absolute");
        this.initGlue0Window(frame, context);
        this._idToFrame[id] = frame;
        await this.waitForWindow(windowId);
        return frame;
    }
    moveFrame(id, bounds) {
        const frame = this._idToFrame[id];
        const jFrame = $(frame);
        jFrame.css("top", `${bounds.top}px`);
        jFrame.css("left", `${bounds.left}px`);
        jFrame.css("width", `${bounds.width}px`);
        jFrame.css("height", `${bounds.height}px`);
    }
    selectionChanged(toFront, toBack) {
        toBack.forEach(id => {
            $(this._idToFrame[id]).css("z-index", "-1");
        });
        toFront.forEach(id => {
            if ($(this._idToFrame[id]).hasClass("maximized-active-tab")) {
                $(this._idToFrame[id]).css("z-index", "42");
            }
            else {
                $(this._idToFrame[id]).css("z-index", "19");
            }
        });
    }
    maximizeTab(id) {
        $(this._idToFrame[id]).addClass("maximized-active-tab");
    }
    restoreTab(id) {
        $(this._idToFrame[id]).removeClass("maximized-active-tab");
    }
    selectionChangedDeep(toFront, toBack) {
        toBack.forEach(id => {
            // The numbers is based on the z index of golden layout elements
            $(this._idToFrame[id]).css("z-index", "-1");
        });
        toFront.forEach(id => {
            if ($(this._idToFrame[id]).hasClass("maximized-active-tab")) {
                // The numbers is based on the z index of golden layout elements
                $(this._idToFrame[id]).css("z-index", "42");
            }
            else {
                // The numbers is based on the z index of golden layout elements
                $(this._idToFrame[id]).css("z-index", "19");
            }
        });
    }
    bringToFront(id) {
        // Z index is this high to guarantee top most position
        $(this._idToFrame[id]).css("z-index", "999");
    }
    remove(id) {
        const frame = this._idToFrame[id];
        if (frame) {
            delete this._idToFrame[id];
            frame.remove();
        }
    }
    onFrameLoaded(callback) {
        return this._registry.add("frameLoaded", callback);
    }
    onFrameContentClicked(callback) {
        return this._registry.add("frame-content-clicked", callback);
    }
    onWindowTitleChanged(callback) {
        return this._registry.add("window-title-changed", callback);
    }
    ;
    sendLayoutState(id, layoutState) {
        // to be implemented
        return Promise.resolve();
    }
    waitForWindow(windowId) {
        return new Promise((res, rej) => {
            let unsub = () => { };
            const timeout = setTimeout(() => {
                rej(`Window with id ${windowId} did not appear in 5000ms`);
                unsub();
            }, 5000);
            unsub = window.glue.windows.onWindowAdded((w) => {
                if (w.id === windowId) {
                    unsub();
                    res();
                    clearTimeout(timeout);
                }
            });
            const glueWindow = window.glue.windows.list().find((w) => w.id === windowId);
            if (glueWindow) {
                res();
                unsub();
                clearTimeout(timeout);
            }
        });
    }
    initGlue0Window(frame, context) {
        const contentWindow = frame.contentWindow;
        // contentWindow.glue0 = {
        //     ...contentWindow.glue0,
        //     context,
        // }
    }
}
exports.IFrameController = IFrameController;
//# sourceMappingURL=iframeController.js.map