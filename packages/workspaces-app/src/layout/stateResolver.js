"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutStateResolver = void 0;
const store_1 = require("../store");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
class LayoutStateResolver {
    constructor(_frameId, _layoutEventEmitter) {
        this._frameId = _frameId;
        this._layoutEventEmitter = _layoutEventEmitter;
    }
    async getWindowSummary(windowId) {
        windowId = Array.isArray(windowId) ? windowId[0] : windowId;
        let windowContentItem = store_1.default.getWindowContentItem(windowId);
        if (!windowContentItem) {
            await this.waitForWindowContentItem(windowId);
            windowContentItem = store_1.default.getWindowContentItem(windowId);
        }
        return this.getWindowSummaryCore(windowContentItem, windowId);
    }
    getWindowSummarySync(windowId) {
        windowId = Array.isArray(windowId) ? windowId[0] : windowId;
        const windowContentItem = store_1.default.getWindowContentItem(windowId);
        return this.getWindowSummaryCore(windowContentItem, windowId);
    }
    getWorkspaceConfig(workspaceId) {
        const workspace = store_1.default.getById(workspaceId);
        if (!workspace) {
            throw new Error(`Could find workspace to remove with id ${workspaceId}`);
        }
        const glConfig = workspace.layout ? workspace.layout.toConfig() : { workspacesOptions: {}, content: [], id: workspaceId };
        glConfig.workspacesOptions.frameId = this._frameId;
        glConfig.workspacesOptions.positionIndex = this.getWorkspaceTabIndex(workspaceId);
        if (!glConfig.workspacesOptions.title) {
            glConfig.workspacesOptions.title = store_1.default.getWorkspaceTitle(workspaceId);
        }
        glConfig.workspacesOptions.name = glConfig.workspacesOptions.name || glConfig.workspacesOptions.title;
        this.transformComponentsToWindowSummary(glConfig);
        this.transformParentsToContainerSummary(glConfig);
        return glConfig;
    }
    getWorkspaceSummary(workspaceId) {
        const config = this.getWorkspaceConfig(workspaceId);
        const workspaceIndex = this.getWorkspaceTabIndex(workspaceId);
        return {
            config: {
                frameId: this._frameId,
                positionIndex: workspaceIndex,
                title: store_1.default.getWorkspaceTitle(workspaceId),
                name: config.workspacesOptions.name || store_1.default.getWorkspaceTitle(workspaceId)
            },
            id: workspaceId
        };
    }
    isWindowMaximized(id) {
        const placementId = utils_1.idAsString(id);
        const windowContentItem = store_1.default.getWindowContentItem(placementId);
        return windowContentItem === null || windowContentItem === void 0 ? void 0 : windowContentItem.parent.isMaximized;
    }
    isWindowSelected(id) {
        const placementId = utils_1.idAsString(id);
        const windowContentItem = store_1.default.getWindowContentItem(placementId);
        return (windowContentItem === null || windowContentItem === void 0 ? void 0 : windowContentItem.parent.getActiveContentItem().config.id) === placementId;
    }
    getContainerSummary(containerId) {
        var _a;
        containerId = utils_1.idAsString(containerId);
        const workspace = store_1.default.getByContainerId(containerId);
        const containerContentItem = store_1.default.getContainer(containerId);
        const containerPositionIndex = (_a = containerContentItem.parent) === null || _a === void 0 ? void 0 : _a.contentItems.indexOf(containerContentItem);
        return {
            itemId: containerId,
            config: {
                workspaceId: workspace.id,
                frameId: this._frameId,
                positionIndex: containerPositionIndex || 0
            }
        };
    }
    getContainerSummaryByReference(item, workspaceId) {
        var _a;
        const containerPositionIndex = (_a = item.parent) === null || _a === void 0 ? void 0 : _a.contentItems.indexOf(item);
        return {
            itemId: utils_1.idAsString(item.config.id),
            config: {
                workspaceId,
                frameId: this._frameId,
                positionIndex: containerPositionIndex || 0
            }
        };
    }
    getContainerConfig(containerId) {
        containerId = utils_1.idAsString(containerId);
        const workspace = store_1.default.getByContainerId(containerId) || store_1.default.getByWindowId(containerId);
        const workspaceConfig = workspace.layout.toConfig();
        return this.findElementInConfig(containerId, workspaceConfig);
    }
    isWindowInWorkspace(windowId) {
        return !!store_1.default.getWindowContentItem(windowId);
    }
    getFrameSnapshot() {
        const allWorkspaceSnapshots = store_1.default.workspaceIds.map(wid => this.getWorkspaceSummary(wid));
        return {
            id: this._frameId,
            config: {},
            workspaces: allWorkspaceSnapshots
        };
    }
    getSnapshot(itemId) {
        try {
            return this.getWorkspaceConfig(itemId);
        }
        catch (error) {
            return this.getFrameSnapshot();
        }
    }
    findElementInConfig(elementId, config) {
        const search = (glConfig) => {
            if (glConfig.id === elementId) {
                return [glConfig];
            }
            const contentToTraverse = glConfig.type !== "component" ? glConfig.content : [];
            return contentToTraverse.reduce((acc, ci) => [...acc, ...search(ci)], []);
        };
        const searchResult = search(config);
        return searchResult.find((i) => i.id);
    }
    getWorkspaceTabIndex(workspaceId) {
        const workspaceLayoutStack = store_1.default.workspaceLayout.root.getItemsById(workspaceId)[0].parent;
        const workspaceIndex = (workspaceLayoutStack.header)
            .tabs
            .findIndex((t) => t.contentItem.config.id === workspaceId);
        return workspaceIndex;
    }
    getWindowSummaryCore(windowContentItem, winId) {
        const isFocused = windowContentItem.parent.getActiveContentItem().config.id === windowContentItem.config.id;
        const isLoaded = windowContentItem.config.componentState.windowId !== undefined;
        const positionIndex = windowContentItem.parent.contentItems.indexOf(windowContentItem);
        const workspaceId = store_1.default.getByWindowId(winId).id;
        const { appName, url, windowId } = windowContentItem.config.componentState;
        const userFriendlyParent = this.getUserFriendlyParent(windowContentItem);
        return {
            itemId: windowId,
            parentId: userFriendlyParent.config.id,
            config: {
                frameId: this._frameId,
                isFocused,
                isLoaded,
                positionIndex,
                workspaceId,
                windowId,
                isMaximized: this.isWindowMaximized(windowId),
                appName,
                url,
                title: windowContentItem.config.title
            }
        };
    }
    getUserFriendlyParent(contentItem) {
        if (!contentItem.parent) {
            return contentItem;
        }
        if (contentItem.parent.config.workspacesConfig.wrapper) {
            return this.getUserFriendlyParent(contentItem.parent);
        }
        return contentItem.parent;
    }
    transformComponentsToWindowSummary(glConfig) {
        var _a;
        if (glConfig.type === "component" && glConfig.componentName === constants_1.EmptyVisibleWindowName) {
            return;
        }
        if (glConfig.type === "component") {
            const summary = this.getWindowSummarySync(glConfig.id);
            glConfig.workspacesConfig = glConfig.workspacesConfig || {};
            glConfig.workspacesConfig = { ...glConfig.workspacesConfig, ...summary.config };
            return;
        }
        (_a = glConfig.content) === null || _a === void 0 ? void 0 : _a.map((c) => this.transformComponentsToWindowSummary(c));
    }
    transformParentsToContainerSummary(glConfig) {
        var _a;
        if (glConfig.type === "component") {
            return;
        }
        if (glConfig.type === "stack" || glConfig.type === "row" || glConfig.type === "row") {
            const summary = this.getContainerSummary(glConfig.id);
            glConfig.workspacesConfig = glConfig.workspacesConfig || {};
            glConfig.workspacesConfig = { ...glConfig.workspacesConfig, ...summary.config };
        }
        (_a = glConfig.content) === null || _a === void 0 ? void 0 : _a.map((c) => this.transformParentsToContainerSummary(c));
    }
    waitForWindowContentItem(windowId) {
        return new Promise((res, rej) => {
            const unsub = this._layoutEventEmitter.onContentComponentCreated((component) => {
                if (component.config.id === windowId) {
                    unsub();
                    res();
                }
            });
            const windowContentItem = store_1.default.getWindowContentItem(windowId);
            if (windowContentItem) {
                unsub();
                res();
            }
        });
    }
}
exports.LayoutStateResolver = LayoutStateResolver;
//# sourceMappingURL=stateResolver.js.map