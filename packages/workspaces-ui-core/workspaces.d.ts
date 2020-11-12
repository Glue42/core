import { Bounds, ComponentFactory } from "./src/types/internal";
import { Glue42Web } from "@glue42/web";

export interface WorkspacesManager {
    init: (glue: Glue42Web.API, componentFactory?: any) => void;
    notifyMoveAreaChanged: () => void;
    getComponentBounds: () => Bounds;
    registerPopup: (element: HTMLElement) => string;
    removePopup: (element: HTMLElement) => void;
    removePopupById: (id: string) => void;
    unmount: () => void;
    subscribeForWindowFocused: (callback: () => void) => void;
    notifyWorkspacePopupChanged: (element: HTMLElement) => void;
}

declare const WorkspacesManagerAPI: WorkspacesManager;
export default WorkspacesManagerAPI;