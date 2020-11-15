export interface BasePopupPayload {
    peerId: string;
    frameId: string;
}

export interface SaveWorkspacePopupPayload extends BasePopupPayload {
    workspaceId: string;
    buildMode: boolean;
}

export interface AddApplicationPopupPayload extends BasePopupPayload {
    boxId: string;
    workspaceId: string;
    parentType: string;
}

export interface PopupContentWindow extends Window {
    frameTarget?: string;
    interopId?: string;
}
