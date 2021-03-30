import { Workspace, Window } from "./types/internal";
import GoldenLayout from "@glue42/golden-layout";
import { idAsString } from "./utils";

class WorkspaceStore {
    private readonly _idToLayout: { [k: string]: Workspace } = {};
    private _workspaceLayout: GoldenLayout;

    public get layouts() {
        return Object.values(this._idToLayout);
    }

    public get workspaceIds() {
        return Object.keys(this._idToLayout);
    }

    public get workspaceTitles() {
        return this.workspaceIds.map(wid => this.getWorkspaceTitle(wid));
    }

    public set workspaceLayout(layout) {
        this._workspaceLayout = layout;
    }

    public get workspaceLayout() {
        return this._workspaceLayout;
    }

    public get workspaceLayoutHeader(): GoldenLayout.Header {
        return (this._workspaceLayout.root.contentItems[0] as GoldenLayout.Stack).header;
    }

    public getWorkspaceLayoutItemById(itemId: string) {
        return this.workspaceLayout.root.getItemsById(itemId)[0];
    }

    public getById(id: string | string[]) {
        id = idAsString(id);
        return this._idToLayout[id];
    }

    public getByContainerId(id: string) {
        return this._idToLayout[id] || this.getByContainerIdCore(id);
    }

    public getWorkspaceTitle(workspaceId: string): string {
        const workspacesContentItem = this.workspaceLayout.root.getItemsById(workspaceId)[0] as GoldenLayout.Component;
        return workspacesContentItem?.tab.titleElement[0].innerText || workspacesContentItem?.config.title;
    }

    public removeById(id: string) {
        delete this._idToLayout[id];
    }

    public removeLayout(id: string) {
        this._idToLayout[id].layout?.destroy();
        this._idToLayout[id].layout = undefined;
    }

    public addOrUpdate(id: string, windows: Window[], layout?: GoldenLayout) {
        const workspace = this.getById(id);
        if (workspace) {
            workspace.layout = layout;
            workspace.windows = this.mergeWindows(workspace.windows, windows);
            return;
        }

        this._idToLayout[id] = {
            id,
            windows,
            layout,
            hibernatedWindows: [],
            lastActive: Date.now()
        };
    }

    public getWindow(id: string | string[]) {
        const winId = idAsString(id);
        return this.layouts.reduce((acc, l) => acc || l.windows.find((w) => w.id === winId || w.windowId === winId), undefined);
    }

    public getActiveWorkspace(): Workspace {
        const activeWorkspaceId = this.workspaceLayout.root.contentItems[0].getActiveContentItem().config.id;

        return this.getById(activeWorkspaceId);
    }

    public addWindow(window: Window, workspaceId: string) {
        const workspace = this.getById(workspaceId);

        workspace.windows = workspace.windows.filter(w => w.id !== window.id);
        workspace.windows.push(window);
    }

    public getByWindowId(windowId: string | string[]): Workspace {
        windowId = idAsString(windowId);
        return this.layouts.find((l) => l.windows.some((w) => w.id === windowId || w.windowId === windowId));
    }

    public getWindowContentItem(windowId: string): GoldenLayout.Component {
        const placementIdResult = this.layouts.filter((l) => l.layout).reduce((acc, w) => {
            return acc || w.layout.root.getItemsById(windowId)[0];
        }, undefined as GoldenLayout.ContentItem);

        if (placementIdResult && placementIdResult.isComponent) {
            return placementIdResult;
        }
        const windowIdResult = this.layouts.filter((l) => l.layout).reduce((acc, w) => {
            return acc ||
                w.layout.root.getItemsByFilter((c) => c.isComponent && c.config.componentState.windowId === windowId)[0];
        }, undefined as GoldenLayout.Component);

        if (!windowIdResult?.isComponent) {
            return undefined;
        }

        return windowIdResult;
    }

    public getContainer(containerId: string) {
        const workspaces = this.layouts.reduce<GoldenLayout[]>((acc, w) => {
            if (w.layout) {
                acc.push(w.layout);
            }
            return acc;
        }, [] as GoldenLayout[]);

        const result = workspaces.reduce((acc, w) => acc ||
            w.root.getItemsById(containerId)[0], undefined as GoldenLayout.ContentItem);

        return result;
    }

    public getWorkspaceContext(workspaceId: string) {
        const workspace = this.getById(workspaceId);
        return workspace?.layout?.config?.workspacesOptions?.context;
    }

    public getWorkspaceContentItem(workspaceId: string): GoldenLayout.Component {
        return this.workspaceLayout.root.getItemsById(workspaceId)[0] as GoldenLayout.Component;
    }

    private getByContainerIdCore(id: string): Workspace {
        const workspaces = this.layouts.reduce<Workspace[]>((acc, w) => {
            if (w.layout) {
                acc.push(w);
            }
            return acc;
        }, [] as Workspace[]);

        const result = workspaces.find((w) => w.layout.root.getItemsById(id)[0]);

        return result;
    }

    private mergeWindows(oldWindows: Window[], newWindows: Window[]) {
        return newWindows.map(w => {
            let windowId = w.windowId;
            if (!windowId) {
                const sameWindowInOldWindows = oldWindows.find((oldWin) => oldWin.id === w.id);
                windowId = sameWindowInOldWindows?.windowId;
            }
            return {
                ...w,
                windowId
            }
        });
    }
}

export default new WorkspaceStore();
