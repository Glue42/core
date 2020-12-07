import { Bounds, Size } from "../types/internal";
import { AddApplicationPopupPayload, BasePopupPayload, SaveWorkspacePopupPayload, PopupContentWindow } from "../types/popups";
import { Glue42Web } from "@glue42/web";

declare const window: Window & { glue: Glue42Web.API };

export class PopupManager {
    private _popup: HTMLIFrameElement;
    private readonly _addApplicationType = "addApplication";
    private readonly _openWorkspaceType = "openWorkspace";
    private readonly _saveWorkspaceType = "saveWorkspace";
    private readonly _showPopupMethod = "T42.Workspaces.ShowPopup";
    private readonly _glue: Glue42Web.API;

    constructor(glue: Glue42Web.API) {
        this._glue = glue;

        this.initPopup();
        this.registerHideMethod();
        this.registerResizeMethod();
    }

    public async showAddWindowPopup(targetBounds: Bounds, payload: AddApplicationPopupPayload) {
        this.hidePopup();

        const popupSize: Size = await this.getPopupSize(this._addApplicationType, payload);

        this.showElement(this._popup, targetBounds, popupSize);
    }

    public async showOpenWorkspacePopup(targetBounds: Bounds, payload: BasePopupPayload) {
        this.hidePopup();

        const popupSize: Size = await this.getPopupSize(this._openWorkspaceType, payload);

        this.showElement(this._popup, targetBounds, popupSize);
    }

    public async showSaveWorkspacePopup(targetBounds: Bounds, payload: SaveWorkspacePopupPayload) {
        this.hidePopup();

        const popupSize: Size = await this.getPopupSize(this._saveWorkspaceType, payload);

        this.showElement(this._popup, targetBounds, popupSize);
    }

    public hidePopup() {
        $(this._popup).css("visibility", "hidden");
    }

    private initPopup() {  
        // const base = location.origin;
        // const workspacesIndexInPath = location.pathname.lastIndexOf("/workspaces/");
        // const workspacesPath = location.pathname.substr(0, workspacesIndexInPath);

        // const path = `${base}${workspacesPath}/workspaces/popups/index.html`;

        // const nodes = $.parseHTML(this.getPopupWindowTemplate(path), document, false);
        // document.body.append(...nodes);

        // this._popup = document.getElementById("popup") as HTMLIFrameElement;
        // (this._popup.contentWindow as PopupContentWindow).frameTarget = this._glue.agm.instance.instance;
    }

    private showElement(element: Element, targetBounds: Bounds, elementSize: Size) {
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

    private resizePopup(size: Size) {
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

    private async getPopupSize(type: string, payload: object) {
        const windowId = this.getPopupInteropId();
        const instance = this._glue.agm.servers().find((i) => i.windowId === windowId);

        return (await this._glue.agm.invoke(this._showPopupMethod, { type, payload }, instance)).returned;
    }

    private registerHideMethod() {
        // To enable application popups uncomment this
        // this._glue.agm.register("T42.Workspaces.HidePopup", () => {
        //     this.hidePopup();
        // });
    }

    private registerResizeMethod() {
        // To enable application popups uncomment this
        // this._glue.agm.register("T42.Workspaces.ResizePopup", (args: { size: Size }) => {
        //     this.resizePopup(args.size);
        // });
    }

    private getPopupInteropId() {
        try {
            return (this._popup.contentWindow as PopupContentWindow).interopId || "best";
        } catch (error) {
            // tslint:disable-next-line: no-console
            console.warn("Could not get the popup interop id using best");
        }
        return "best";
    }

    private getPopupWindowTemplate(path: string) {
        return `<iframe id="popup" src="${path}" class="popup"></iframe>`;
    }
}
