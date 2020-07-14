"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class WorkspaceStore {
    constructor() {
        this._idToLayout = {};
    }
    get layouts() {
        return Object.values(this._idToLayout);
    }
    get workspaceIds() {
        return Object.keys(this._idToLayout);
    }
    get workspaceTitles() {
        return this.workspaceIds.map(wid => this.getWorkspaceTitle(wid));
    }
    set workspaceLayout(layout) {
        this._workspaceLayout = layout;
    }
    get workspaceLayout() {
        return this._workspaceLayout;
    }
    get workspaceLayoutHeader() {
        return this._workspaceLayout.root.contentItems[0].header;
    }
    getWorkspaceLayoutItemById(itemId) {
        return this.workspaceLayout.root.getItemsById(itemId)[0];
    }
    getById(id) {
        id = utils_1.idAsString(id);
        return this._idToLayout[id];
    }
    getByContainerId(id) {
        return this._idToLayout[id] || this.getByContainerIdCore(id);
    }
    getWorkspaceTitle(workspaceId) {
        const workspacesContentItem = this.workspaceLayout.root.getItemsById(workspaceId)[0];
        return workspacesContentItem.tab.titleElement[0].innerText;
    }
    removeById(id) {
        delete this._idToLayout[id];
    }
    removeLayout(id) {
        this._idToLayout[id].layout.destroy();
        this._idToLayout[id].layout = undefined;
    }
    addOrUpdate(id, windows, layout) {
        const workspace = this.getById(id);
        if (workspace) {
            workspace.layout = layout;
            workspace.windows = windows;
            return;
        }
        this._idToLayout[id] = {
            id,
            windows,
            layout
        };
    }
    getWindow(id) {
        const winId = utils_1.idAsString(id);
        return this.layouts.reduce((acc, l) => acc || l.windows.find((w) => w.id === winId), undefined);
    }
    getActiveWorkspace() {
        const activeWorkspaceId = this.workspaceLayout.root.contentItems[0].getActiveContentItem().config.id;
        return this.getById(activeWorkspaceId);
    }
    addWindow(window, workspaceId) {
        const workspace = this.getById(workspaceId);
        workspace.windows = workspace.windows.filter(w => w.id !== window.id);
        workspace.windows.push(window);
    }
    getByWindowId(windowId) {
        windowId = utils_1.idAsString(windowId);
        return this.layouts.find((l) => l.windows.some((w) => w.id === windowId));
    }
    getWindowContentItem(windowId) {
        const placementIdResult = this.layouts.filter((l) => l.layout).reduce((acc, w) => {
            return acc || w.layout.root.getItemsById(windowId)[0];
        }, undefined);
        if (placementIdResult && placementIdResult.isComponent) {
            return placementIdResult;
        }
        const windowIdResult = this.layouts.filter((l) => l.layout).reduce((acc, w) => {
            return acc ||
                w.layout.root.getItemsByFilter((c) => c.isComponent && c.config.componentState.windowId === windowId)[0];
        }, undefined);
        if (!(windowIdResult === null || windowIdResult === void 0 ? void 0 : windowIdResult.isComponent)) {
            return undefined;
        }
        return windowIdResult;
    }
    getContainer(containerId) {
        const workspaces = this.layouts.reduce((acc, w) => {
            if (w.layout) {
                acc.push(w.layout);
            }
            return acc;
        }, []);
        const result = workspaces.reduce((acc, w) => acc ||
            w.root.getItemsById(containerId)[0], undefined);
        return result;
    }
    getWorkspaceContext(workspaceId) {
        const workspace = this.getById(workspaceId);
        return workspace.layout.config.workspacesOptions.context;
    }
    getByContainerIdCore(id) {
        const workspaces = this.layouts.reduce((acc, w) => {
            if (w.layout) {
                acc.push(w);
            }
            return acc;
        }, []);
        const result = workspaces.find((w) => w.layout.root.getItemsById(id)[0]);
        return result;
    }
}
exports.default = new WorkspaceStore();
//# sourceMappingURL=store.js.map