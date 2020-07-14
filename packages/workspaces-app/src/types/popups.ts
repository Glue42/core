export interface BasePopupPayload {
    peerId: string;
    frameId: string;
}

export interface SaveWorkspacePopupPayload extends BasePopupPayload {
    workspaceId: string;
}

export interface AddApplicationPopupPayload extends BasePopupPayload {
    laneId: string;
    workspaceId: string;
    parentType: string;
}

export interface PopupContentWindow extends Window {
    frameTarget?: string;
    interopId?: string;
}
