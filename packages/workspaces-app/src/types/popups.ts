interface BasePopupPayload {
    peerId: string;
    frameId: string;
}

export interface SaveWorkspacePopupPayload extends BasePopupPayload {
    workspaceId: string
}

export interface OpenWorkspacePopupPayload extends BasePopupPayload {
}

export interface AddApplicationPopupPayload extends BasePopupPayload {
    laneId: string;
    workspaceId: string;
    parentType: string;
}