import { AddApplicationPopupOptions, Bounds, ComponentFactory, SaveWorkspacePopupOptions, Size } from "../types/internal";

export class ComponentPopupManager {
    private _popup: HTMLElement;
    private readonly _frameId: string;
    private readonly _addApplicationType = "addApplication";
    private readonly _openWorkspaceType = "openWorkspace";
    private readonly _saveWorkspaceType = "saveWorkspace";
    private readonly _componentFactory: ComponentFactory | undefined;
    private readonly _popupSizes: { [k: string]: Size } = {
        [this._addApplicationType]: { height: 200, width: 200 },
        [this._openWorkspaceType]: { height: 200, width: 200 },
        [this._saveWorkspaceType]: { height: 200, width: 200 },
    };

    constructor(componentFactory: ComponentFactory, frameId: string) {
        this._componentFactory = componentFactory;
        this._frameId = frameId;
        this.initPopup();
    }

    public async showAddWindowPopup(targetBounds: Bounds, { workspaceId, parentType, boxId }: AddApplicationPopupOptions) {
        await this.showInternalAddAppPopup(targetBounds, boxId, workspaceId, parentType);
    }

    public async showOpenWorkspacePopup(targetBounds: Bounds) {
        await this.showInternalOpenWorkspacePopup(targetBounds);
    }

    public async showSaveWorkspacePopup(targetBounds: Bounds, payload: SaveWorkspacePopupOptions) {
        await this.showInternalSaveWorkspacePopup(targetBounds, payload);
    }

    public hidePopup = () => {
        document.body.onclick = undefined;

        $(this._popup).css("visibility", "hidden");

        return new Promise((res) => {
            if (this._componentFactory?.hideSystemPopups) {
                this._componentFactory.hideSystemPopups(res);
            } else {
                res();
            }
        });
    }

    private async showInternalSaveWorkspacePopup(targetBounds: Bounds, payload: SaveWorkspacePopupOptions) {
        await this.hidePopup();
        const popupSize = this.getPopupSize(this._saveWorkspaceType);

        this.showElement(this._popup, targetBounds, popupSize);

        this._componentFactory.createSaveWorkspacePopup({
            domNode: this._popup,
            resizePopup: (s: any) => this.resizePopup(s, this._saveWorkspaceType, $(this._popup)),
            hidePopup: this.hidePopup,
            workspaceId: payload.workspaceId,
            buildMode: payload.buildMode
        } as any);
    }

    private async showInternalOpenWorkspacePopup(targetBounds: Bounds) {
        await this.hidePopup();
        const popupSize = this.getPopupSize(this._openWorkspaceType);

        this.showElement(this._popup, targetBounds, popupSize);

        this._componentFactory.createAddWorkspacePopup({
            domNode: this._popup,
            frameId: this._frameId,
            hidePopup: this.hidePopup,
            resizePopup: (s) => this.resizePopup(s, this._openWorkspaceType, $(this._popup))
        });
    }

    private async showInternalAddAppPopup(targetBounds: Bounds, boxId: string, workspaceId: string, parentType: string) {
        await this.hidePopup();
        const popupSize = this.getPopupSize(this._addApplicationType);

        this.showElement(this._popup, targetBounds, popupSize);

        this._componentFactory.createAddApplicationPopup({
            domNode: this._popup,
            boxId,
            resizePopup: (s) => this.resizePopup(s, this._addApplicationType, $(this._popup)),
            hidePopup: this.hidePopup,
            workspaceId,
            frameId: this._frameId
        });
    }

    private initPopup() {
        this._popup = document.createElement("div") as HTMLElement;

        this._popup.classList.add("workspaces-system-popup");

        document.body.appendChild(this._popup);
    }

    private showElement(element: HTMLElement, targetBounds: Bounds, elementSize: any) {
        document.body.onclick = (e) => {
            const path = e.composedPath();

            if (path.indexOf(this._popup) === -1) {
                this.hidePopup();
            }
        };

        document.body.onblur = (e) => {
            if (document.activeElement.tagName.toLowerCase() === "iframe") {
                this.hidePopup();
            }
        }

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

    private resizePopup(size: Size, type: string, popup: JQuery<HTMLElement>) {
        if (size.height) {
            popup.css("height", `${size.height}px`);
            this._popupSizes[type].height = size.height;
        }

        if (size.width) {
            popup.css("width", `${size.width}px`);
            this._popupSizes[type].width = size.width;
        }

        const elementBounds = popup[0].getBoundingClientRect();
        const bodyBounds = document.body.getBoundingClientRect();
        const leftCorrection = bodyBounds.width - elementBounds.right - 10;
        const topCorrection = bodyBounds.height - elementBounds.bottom - 10;

        if (leftCorrection < 0) {
            const leftCss = popup.css("left");
            const currentLeft = parseInt(leftCss.substring(0, leftCss.length - 2), 10);
            popup.css("left", currentLeft + leftCorrection);
        }

        if (topCorrection < 0) {
            const topCss = popup.css("top");
            const currentTop = parseInt(topCss.substring(0, topCss.length - 2), 10);
            popup.css("top", currentTop + topCorrection);
        }
    }

    private getPopupSize(type: string) {
        return this._popupSizes[type];
    }
}
