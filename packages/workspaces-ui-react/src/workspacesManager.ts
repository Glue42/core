import workspacesManager from "@glue42/workspaces-ui-core";
import { Bounds, WorkspacesManager } from "./types/internal";

declare const window: Window & { workspacesManager: WorkspacesManager };

class WorkspacesManagerDecorator {
    public init(glue: any, componentFactory: any) {
        if (window.workspacesManager) {
            window.workspacesManager.init(componentFactory);
        } else {
            workspacesManager.init(glue, componentFactory);
        }
    }

    public getFrameId() {
        return (window.workspacesManager || workspacesManager).getFrameId();
    }

    public notifyMoveAreaChanged() {
        (window.workspacesManager || workspacesManager).notifyMoveAreaChanged();
    }

    public notifyWorkspacePopupChanged(element: HTMLElement): string {
        return (window.workspacesManager || workspacesManager).notifyWorkspacePopupChanged(element);
    }

    public getComponentBounds(): Bounds {
        return (window.workspacesManager || workspacesManager).getComponentBounds();
    }

    public registerPopup(element: HTMLElement): string {
        return (window.workspacesManager || workspacesManager).registerPopup(element);
    }

    public removePopup(element: HTMLElement): void {
        return (window.workspacesManager || workspacesManager).removePopup(element);
    }

    public removePopupById(elementId: string): void {
        return (window.workspacesManager || workspacesManager).removePopupById(elementId);
    }

    public subscribeForWindowFocused(cb: () => any): () => void {
        return (window.workspacesManager || workspacesManager).subscribeForWindowFocused(cb);
    }

    public unmount(): void {
        return (window.workspacesManager || workspacesManager).unmount();
    }

    public requestFocus(): void {
        return (window.workspacesManager || workspacesManager).requestFocus();
    }
}

export default new WorkspacesManagerDecorator();