"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupManager = void 0;
class PopupManager {
    constructor() {
        this._addApplicationType = "addApplication";
        this._openWorkspaceType = "openWorkspace";
        this._saveWorkspaceType = "saveWorkspace";
        this._showPopupMethod = "T42.Workspaces.ShowPopup";
        this.initPopup();
        this.registerHideMethod();
        this.registerResizeMethod();
    }
    async showAddWindowPopup(targetBounds, payload) {
        this.hidePopup();
        const popupSize = await this.getPopupSize(this._addApplicationType, payload);
        this.showElement(this._popup, targetBounds, popupSize);
    }
    async showOpenWorkspacePopup(targetBounds, payload) {
        this.hidePopup();
        const popupSize = await this.getPopupSize(this._openWorkspaceType, payload);
        this.showElement(this._popup, targetBounds, popupSize);
    }
    async showSaveWorkspacePopup(targetBounds, payload) {
        this.hidePopup();
        const popupSize = await this.getPopupSize(this._saveWorkspaceType, payload);
        this.showElement(this._popup, targetBounds, popupSize);
    }
    hidePopup() {
        $(this._popup).css("visibility", "hidden");
    }
    initPopup() {
        const base = location.origin;
        const workspacesIndexInPath = location.pathname.lastIndexOf("/workspaces/");
        const workspacesPath = location.pathname.substr(0, workspacesIndexInPath);
        const path = `${base}${workspacesPath}/workspaces/popups/index.html`;
        const nodes = $.parseHTML(this.getPopupWindowTemplate(path), document, false);
        document.body.append(...nodes);
        this._popup = document.getElementById("popup");
        this._popup.contentWindow.frameTarget = window.glue.agm.instance.instance;
        $(document).click(() => {
            this.hidePopup();
        });
    }
    showElement(element, targetBounds, elementSize) {
        $(element)
            .css("visibility", "visible")
            .css("top", `${targetBounds.top}px`)
            .css("left", `${targetBounds.left}px`);
        if (elementSize.height) {
            $(element).css("height", `${elementSize.height}px`);
        }
        if (elementSize.width) {
            $(element).css("width", `${elementSize.width}px`);
        }
        const elementBounds = element.getBoundingClientRect();
        const bodyBounds = document.body.getBoundingClientRect();
        const leftCorrection = bodyBounds.width - elementBounds.right - 10;
        const topCorrection = bodyBounds.height - elementBounds.bottom - 10;
        if (leftCorrection < 0) {
            $(element).css("left", targetBounds.left + leftCorrection);
        }
        if (topCorrection < 0) {
            $(element).css("top", targetBounds.top + topCorrection);
        }
    }
    resizePopup(size) {
        const popup = $(this._popup);
        if (size.height) {
            popup.css("height", `${size.height}px`);
        }
        if (size.width) {
            popup.css("width", `${size.width}px`);
        }
        const elementBounds = this._popup.getBoundingClientRect();
        const bodyBounds = document.body.getBoundingClientRect();
        const leftCorrection = bodyBounds.width - elementBounds.right - 10;
        const topCorrection = bodyBounds.height - elementBounds.bottom - 10;
        if (leftCorrection < 0) {
            const leftCss = popup.css("left");
            const currentLeft = parseInt(leftCss.substring(0, leftCss.length - 2));
            popup.css("left", currentLeft + leftCorrection);
        }
        if (topCorrection < 0) {
            const topCss = popup.css("top");
            const currentTop = parseInt(topCss.substring(0, topCss.length - 2));
            popup.css("top", currentTop + topCorrection);
        }
    }
    async getPopupSize(type, payload) {
        const peerId = this.getPopupInteropId();
        const instance = window.glue.agm.servers().find((i) => i.peerId === peerId);
        return (await window.glue.agm.invoke(this._showPopupMethod, { type, payload }, instance)).returned;
    }
    registerHideMethod() {
        window.glue.agm.register("T42.Workspaces.HidePopup", () => {
            this.hidePopup();
        });
    }
    registerResizeMethod() {
        window.glue.agm.register("T42.Workspaces.ResizePopup", (args) => {
            this.resizePopup(args.size);
        });
    }
    getPopupInteropId() {
        try {
            return this._popup.contentWindow.interopId || "best";
        }
        catch (error) {
            // tslint:disable-next-line: no-console
            console.warn("Could not get the popup interop id using best");
        }
        return "best";
    }
    getPopupWindowTemplate(path) {
        return `<iframe id="popup" src="${path}" class="popup"></iframe>`;
    }
}
exports.PopupManager = PopupManager;
//# sourceMappingURL=popupManager.js.map