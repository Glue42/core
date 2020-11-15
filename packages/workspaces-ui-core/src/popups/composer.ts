import { Bounds, Size } from "../types/internal";
import { AddApplicationPopupPayload, BasePopupPayload, SaveWorkspacePopupPayload, PopupContentWindow } from "../types/popups";
import { Glue42Web } from "@glue42/web";
import { ComponentPopupManager } from "./component";
import { PopupManager } from "./external";
import { ComponentFactory } from "../types/internal";

declare const window: Window & { glue: Glue42Web.API };

export class PopupManagerComposer {
    constructor(private readonly _externalPopupManager: PopupManager,
        private readonly _componentPopupManager: ComponentPopupManager,
        private readonly _componentFactory: ComponentFactory) { }

    public async showAddWindowPopup(targetBounds: Bounds, payload: AddApplicationPopupPayload) {
        if (this._componentFactory?.createAddApplicationPopup) {
            return this._componentPopupManager.showAddWindowPopup(targetBounds, payload as any);
        }

        return this._externalPopupManager.showAddWindowPopup(targetBounds, payload);
    }

    public async showOpenWorkspacePopup(targetBounds: Bounds, payload: BasePopupPayload) {
        if (this._componentFactory?.createAddWorkspacePopup) {
            return this._componentPopupManager.showOpenWorkspacePopup(targetBounds);
        }

        return this._externalPopupManager.showOpenWorkspacePopup(targetBounds, payload);
    }

    public async showSaveWorkspacePopup(targetBounds: Bounds, payload: SaveWorkspacePopupPayload) {
        if (this._componentFactory?.createSaveWorkspacePopup) {
            return this._componentPopupManager.showSaveWorkspacePopup(targetBounds, payload as any);
        }

        return this._externalPopupManager.showSaveWorkspacePopup(targetBounds, payload);
    }

    public hidePopup() {
        this._externalPopupManager.hidePopup();
        if (this._componentFactory) {
            this._componentPopupManager.hidePopup();
        }
    }
}
