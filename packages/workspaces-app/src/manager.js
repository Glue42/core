"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./layout/controller");
const eventEmitter_1 = require("./layout/eventEmitter");
const iframeController_1 = require("./iframeController");
const popupManager_1 = require("./popupManager");
const store_1 = require("./store");
const callback_registry_1 = require("callback-registry");
const factory_1 = require("./config/factory");
const layouts_1 = require("./layouts");
const stateResolver_1 = require("./layout/stateResolver");
const startupReader_1 = require("./config/startupReader");
const utils_1 = require("./utils");
const factory_2 = require("./config/factory");
const eventEmitter_2 = require("./eventEmitter");
class WorkspacesManager {
    constructor() {
        this._appNameToURL = {};
        this._isLayoutInitialized = false;
    }
    get stateResolver() {
        return this._stateResolver;
    }
    get workspacesEventEmitter() {
        return this._workspacesEventEmitter;
    }
    async init(frameId) {
        const startupConfig = startupReader_1.default.loadConfig();
        window.glue.appManager.applications().forEach((a) => {
            var _a, _b;
            const url = (_b = (_a = a.userProperties) === null || _a === void 0 ? void 0 : _a.details) === null || _b === void 0 ? void 0 : _b.url;
            if (url) {
                this._appNameToURL[a.name] = url;
            }
        });
        this._frameId = frameId;
        const eventEmitter = new eventEmitter_1.LayoutEventEmitter(callback_registry_1.default());
        this._stateResolver = new stateResolver_1.LayoutStateResolver(this._frameId, eventEmitter);
        this._controller = new controller_1.LayoutController(eventEmitter, this._stateResolver, startupConfig);
        this._frameController = new iframeController_1.IFrameController();
        this._layoutsManager = new layouts_1.LayoutsManager();
        this._popupManager = new popupManager_1.PopupManager();
        this._workspacesEventEmitter = new eventEmitter_2.WorkspacesEventEmitter();
        if (!startupConfig.emptyFrame) {
            await this.initLayout();
            this._workspacesEventEmitter.raiseFrameEvent({ action: "opened", payload: { frameSummary: { id: this._frameId } } });
        }
    }
    async saveWorkspace(name, id) {
        const workspace = store_1.default.getById(id) || store_1.default.getActiveWorkspace();
        await this._layoutsManager.save(name, workspace);
        store_1.default.getWorkspaceLayoutItemById(id).setTitle(name);
    }
    async openWorkspace(name, options) {
        if (!this._isLayoutInitialized) {
            const savedConfig = await this._layoutsManager.getWorkspaceByName(name);
            if (options === null || options === void 0 ? void 0 : options.context) {
                savedConfig.workspacesOptions.context = options === null || options === void 0 ? void 0 : options.context;
            }
            if (options === null || options === void 0 ? void 0 : options.title) {
                savedConfig.workspacesOptions.title = options === null || options === void 0 ? void 0 : options.title;
            }
            this._layoutsManager.setInitialWorkspaceConfig(savedConfig);
            await this.initLayout();
            return utils_1.idAsString(savedConfig.id);
        }
        else if (name === "new") {
            const id = factory_2.default.getId();
            const defaultWorkspaceConfig = factory_1.default.getDefaultWorkspaceConfig(id);
            await this._controller.addWorkspace(id, defaultWorkspaceConfig);
            return id;
        }
        else if (name) {
            const savedWorkspace = await this._layoutsManager.getWorkspaceByName(name);
            if (options === null || options === void 0 ? void 0 : options.context) {
                savedWorkspace.workspacesOptions.context = options === null || options === void 0 ? void 0 : options.context;
            }
            if (options === null || options === void 0 ? void 0 : options.title) {
                savedWorkspace.workspacesOptions.title = options === null || options === void 0 ? void 0 : options.title;
            }
            savedWorkspace.id = factory_2.default.getId();
            await this._controller.addWorkspace(savedWorkspace.id, savedWorkspace);
            return savedWorkspace.id;
        }
    }
    exportAllLayouts() {
        return this._layoutsManager.export();
    }
    deleteLayout(name) {
        this._layoutsManager.delete(name);
    }
    maximizeItem(itemId) {
        this._controller.maximizeWindow(itemId);
    }
    restoreItem(itemId) {
        this._controller.restoreWindow(itemId);
    }
    async closeItem(itemId) {
        const win = store_1.default.getWindow(itemId);
        if (this._frameId === itemId) {
            store_1.default.workspaceIds.forEach((wid) => this.closeWorkspace(store_1.default.getById(wid)));
            // await window.glue.windows.my().close();
        }
        else if (win) {
            const windowContentItem = store_1.default.getWindowContentItem(itemId);
            this.closeTab(windowContentItem);
        }
        else {
            const workspace = store_1.default.getById(itemId);
            this.closeWorkspace(workspace);
        }
    }
    addContainer(config, parentId) {
        return this._controller.addContainer(config, parentId);
    }
    addWindow(itemConfig, parentId) {
        return this._controller.addWindow(itemConfig, parentId);
    }
    setItemTitle(itemId, title) {
        if (store_1.default.getById(itemId)) {
            this._controller.setWorkspaceTitle(itemId, title);
        }
        else {
            this._controller.setWindowTitle(itemId, title);
        }
    }
    async eject(item) {
        const { appName, url } = item.config.componentState;
        const workspaceContext = store_1.default.getWorkspaceContext(store_1.default.getByWindowId(item.config.id).id);
        await this.closeItem(utils_1.idAsString(item.config.id));
        const ejectedWindowUrl = this._appNameToURL[appName] || url;
        await window.glue.windows.open(appName, ejectedWindowUrl, { context: workspaceContext });
    }
    async createWorkspace(config) {
        if (!this._isLayoutInitialized) {
            config.id = factory_2.default.getId();
            this._layoutsManager.setInitialWorkspaceConfig(config);
            await this.initLayout();
            return utils_1.idAsString(config.id);
        }
        const id = factory_2.default.getId();
        await this._controller.addWorkspace(id, config);
        return id;
    }
    loadWindow(itemId) {
        const contentItem = store_1.default.getWindowContentItem(itemId);
        const { windowId } = contentItem.config.componentState.windowId;
        return new Promise((res, rej) => {
            if (!windowId) {
                rej(`The window id of ${itemId} is missing`);
            }
            let unsub = () => { };
            const timeout = setTimeout(() => {
                rej(`Could not load window ${windowId} for 5000ms`);
                unsub();
            }, 5000);
            unsub = window.glue.windows.onWindowAdded((w) => {
                if (w.id === windowId) {
                    res({ windowId });
                    unsub();
                    clearTimeout(timeout);
                }
            });
            const win = window.glue.windows.list().find((w) => w.id === windowId);
            if (win) {
                res({ windowId });
                unsub();
                clearTimeout(timeout);
            }
        });
    }
    focusItem(itemId) {
        const workspace = store_1.default.getById(itemId);
        if (workspace) {
            this._controller.focusWorkspace(workspace.id);
        }
        else {
            this._controller.focusWindow(itemId);
        }
    }
    bundleWorkspace(workspaceId, type) {
        this._controller.bundleWorkspace(workspaceId, type);
    }
    move(location) {
        return window.glue.windows.my().moveTo(location.y, location.x);
    }
    getFrameSummary(itemId) {
        const workspace = store_1.default.getByContainerId(itemId) || store_1.default.getByWindowId(itemId) || store_1.default.getById(itemId);
        const isFrameId = this._frameId === itemId;
        return {
            id: (workspace || isFrameId) ? this._frameId : "none"
        };
    }
    moveWindowTo(itemId, containerId) {
        const targetWorkspace = store_1.default.getByContainerId(containerId) || store_1.default.getById(containerId);
        if (!targetWorkspace) {
            throw new Error(`Could not find container ${containerId} in frame ${this._frameId}`);
        }
        const targetWindow = store_1.default.getWindowContentItem(itemId);
        if (!targetWindow) {
            throw new Error(`Could not find window ${itemId} in frame ${this._frameId}`);
        }
        this.closeTab(targetWindow);
        return this._controller.addWindow(targetWindow.config, containerId);
    }
    async initLayout() {
        const config = await this._layoutsManager.getInitialConfig();
        this.subscribeForPopups();
        this.subscribeForLayout();
        this.subscribeForEvents();
        await this._controller.init({
            frameId: this._frameId,
            workspaceLayout: config.workspaceLayout,
            workspaceConfigs: config.workspaceConfigs
        });
        store_1.default.layouts.map((l) => l.layout).filter((l) => l).forEach((l) => this.reportLayoutStructure(l));
        this._isLayoutInitialized = true;
    }
    subscribeForLayout() {
        this._controller.emitter.onContentComponentCreated(async (component, workspaceId) => {
            const workspace = store_1.default.getById(workspaceId);
            const newWindowBounds = utils_1.getElementBounds(component.element);
            const { componentState } = component.config;
            const { windowId } = componentState;
            const componentId = utils_1.idAsString(component.config.id);
            store_1.default.addWindow({ id: componentId, bounds: newWindowBounds, windowId }, workspace.id);
            const workspaceContext = component.layoutManager.config.workspacesOptions.context;
            let url = this._appNameToURL[componentState.appName] || componentState.url;
            if (!url && windowId) {
                const win = window.glue.windows.list().find((w) => w.id === windowId);
                url = await win.getURL();
            }
            try {
                const frame = await this._frameController.startFrame(componentId, url, undefined, workspaceContext, windowId);
                component.config.componentState.windowId = frame.name;
                this._frameController.moveFrame(componentId, utils_1.getElementBounds(component.element));
                this._workspacesEventEmitter.raiseWindowEvent({
                    action: "added",
                    payload: {
                        windowSummary: await this.stateResolver.getWindowSummary(componentId)
                    }
                });
                this._workspacesEventEmitter.raiseWindowEvent({
                    action: "loaded",
                    payload: {
                        windowSummary: await this.stateResolver.getWindowSummary(componentId)
                    }
                });
            }
            catch (error) {
                // If a frame doesn't initialize properly close it
                this.closeTab(component);
                const wsp = store_1.default.getById(workspaceId);
                if (!wsp) {
                    throw new Error(`Workspace ${workspaceId} failed ot initialize because none of the specified windows were able to load
                    Internal error: ${error}`);
                }
            }
        });
        this._controller.emitter.onContentItemResized((target, id) => {
            this._frameController.moveFrame(id, utils_1.getElementBounds(target));
        });
        this._controller.emitter.onTabCloseRequested(async (item) => {
            const workspace = store_1.default.getByWindowId(utils_1.idAsString(item.config.id));
            const windowSummary = await this.stateResolver.getWindowSummary(item.config.id);
            this.closeTab(item);
            this._controller.removeLayoutElement(utils_1.idAsString(item.config.id));
            this._frameController.remove(utils_1.idAsString(item.config.id));
            if (!workspace.windows.length) {
                this.checkForEmptyWorkspace(workspace);
            }
            this._workspacesEventEmitter.raiseWindowEvent({ action: "removed", payload: { windowSummary } });
        });
        this._controller.emitter.onWorkspaceTabCloseRequested((workspace) => {
            const summary = this.stateResolver.getWorkspaceSummary(workspace.id);
            this.closeWorkspace(workspace);
            this._workspacesEventEmitter.raiseWorkspaceEvent({
                action: "closed",
                payload: {
                    frameSummary: { id: this._frameId },
                    workspaceSummary: summary
                }
            });
        });
        this._controller.emitter.onTabElementMouseDown((tab) => {
            const tabContentSize = utils_1.getElementBounds(tab.contentItem.element);
            const contentWidth = Math.min(tabContentSize.width, 800);
            const contentHeight = Math.min(tabContentSize.height, 600);
            this._controller.setDragElementSize(contentWidth, contentHeight);
        });
        this._controller.emitter.onTabDragStart((tab) => {
            const dragElement = this._controller.getDragElement();
            const mutationObserver = new MutationObserver((mutations) => {
                Array.from(mutations).forEach((m) => {
                    if (m.type === "attributes") {
                        const proxyContent = $(this._controller.getDragElement())
                            .children(".lm_content")
                            .children(".lm_item_container");
                        const proxyContentBounds = utils_1.getElementBounds(proxyContent[0]);
                        const id = utils_1.idAsString(tab.contentItem.config.id);
                        this._frameController.moveFrame(id, proxyContentBounds);
                        this._frameController.bringToFront(id);
                    }
                });
            });
            mutationObserver.observe(dragElement, {
                attributes: true
            });
        });
        this._controller.emitter.onTabDragEnd((tab) => {
            const toBack = tab.header.tabs.filter((t) => t.contentItem.config.id !== tab.contentItem.config.id);
            this._frameController.selectionChanged([utils_1.idAsString(tab.contentItem.id)], toBack.map((t) => utils_1.idAsString(t.contentItem.id)));
        });
        this._controller.emitter.onSelectionChanged(async (toBack, toFront) => {
            this._frameController.selectionChanged(toFront.map((tf) => tf.id), toBack.map((t) => t.id));
            this._workspacesEventEmitter.raiseWindowEvent({
                action: "focus",
                payload: {
                    windowSummary: await this.stateResolver.getWindowSummary(toFront[0].id)
                }
            });
        });
        this._controller.emitter.onWorkspaceAdded((workspace) => {
            const allOtherWindows = store_1.default.workspaceIds.filter((wId) => wId !== workspace.id).reduce((acc, w) => {
                return [...acc, ...store_1.default.getById(w).windows];
            }, []);
            this._workspacesEventEmitter.raiseWorkspaceEvent({
                action: "opened",
                payload: {
                    frameSummary: { id: this._frameId },
                    workspaceSummary: this.stateResolver.getWorkspaceSummary(workspace.id)
                }
            });
            if (store_1.default.getActiveWorkspace().id === workspace.id) {
                if (!workspace.layout) {
                    this._frameController.selectionChangedDeep([], allOtherWindows.map((w) => w.id));
                    return;
                }
                const allWinsInLayout = utils_1.getAllWindowsFromConfig(workspace.layout.toConfig().content);
                this._frameController.selectionChangedDeep(allWinsInLayout.map((w) => utils_1.idAsString(w.id)), allOtherWindows.map((w) => w.id));
            }
            if (!workspace.layout) {
                return;
            }
            const workspaceOptions = workspace.layout.config.workspacesOptions;
            const title = workspaceOptions.title || workspaceOptions.name;
            if (title) {
                store_1.default.getWorkspaceLayoutItemById(workspace.id).setTitle(title);
            }
        });
        this._controller.emitter.onWorkspaceSelectionChanged((workspace, toBack) => {
            if (!workspace.layout) {
                this._frameController.selectionChangedDeep([], toBack.map((w) => w.id));
                this._workspacesEventEmitter.raiseWorkspaceEvent({
                    action: "focused", payload: {
                        frameSummary: { id: this._frameId },
                        workspaceSummary: this.stateResolver.getWorkspaceSummary(workspace.id)
                    }
                });
                return;
            }
            const allWinsInLayout = utils_1.getAllWindowsFromConfig(workspace.layout.toConfig().content)
                .filter((w) => this._controller.isWindowVisible(w.id));
            this._frameController.selectionChangedDeep(allWinsInLayout.map((w) => utils_1.idAsString(w.id)), toBack.map((w) => w.id));
            this._workspacesEventEmitter.raiseWorkspaceEvent({
                action: "focused", payload: {
                    frameSummary: { id: this._frameId },
                    workspaceSummary: this.stateResolver.getWorkspaceSummary(workspace.id)
                }
            });
        });
        this._controller.emitter.onAddButtonClicked(async ({ laneId, workspaceId, bounds, parentType }) => {
            const payload = {
                laneId,
                workspaceId,
                parentType,
                frameId: this._frameId,
                peerId: window.glue.agm.instance.peerId
            };
            await this._popupManager.showAddWindowPopup(bounds, payload);
        });
        this._controller.emitter.onContentLayoutInit((layout) => {
            this.reportLayoutStructure(layout);
        });
        this._controller.emitter.onWorkspaceAddButtonClicked(async () => {
            const payload = {
                frameId: this._frameId,
                peerId: window.glue.agm.instance.peerId
            };
            const addButton = store_1.default
                .workspaceLayoutHeader
                .element
                .find(".lm_workspace_controls")
                .find(".lm_add_button");
            const addButtonBounds = utils_1.getElementBounds(addButton);
            await this._popupManager.showOpenWorkspacePopup(addButtonBounds, payload);
        });
        this._controller.emitter.onWorkspaceSaveRequested(async (workspaceId) => {
            const payload = {
                frameId: this._frameId,
                workspaceId,
                peerId: window.glue.agm.instance.peerId
            };
            const saveButton = store_1.default
                .getWorkspaceLayoutItemById(workspaceId)
                .tab
                .element
                .find(".lm_saveButton");
            const targetBounds = utils_1.getElementBounds(saveButton);
            await this._popupManager.showSaveWorkspacePopup(targetBounds, payload);
        });
        this._controller.emitter.onStackMaximized((stack) => {
            const activeItem = stack.getActiveContentItem();
            const toBack = stack.contentItems.map((ci) => utils_1.idAsString(ci.config.id));
            stack.contentItems.forEach((ci) => {
                this._frameController.maximizeTab(utils_1.idAsString(ci.config.id));
            });
            this._frameController.selectionChanged([utils_1.idAsString(activeItem.config.id)], toBack);
        });
        this._controller.emitter.onStackRestored((stack) => {
            const activeItem = stack.getActiveContentItem();
            const toBack = stack.contentItems.map((ci) => utils_1.idAsString(ci.config.id));
            stack.contentItems.forEach((ci) => {
                this._frameController.restoreTab(utils_1.idAsString(ci.config.id));
            });
            this._frameController.selectionChanged([utils_1.idAsString(activeItem.config.id)], toBack);
        });
        this._controller.emitter.onEjectRequested((item) => {
            if (!item.isComponent) {
                throw new Error(`Can't eject item of type ${item.type}`);
            }
            return this.eject(item);
        });
    }
    subscribeForPopups() {
        this._frameController.onFrameContentClicked(() => {
            this._popupManager.hidePopup();
        });
        this._frameController.onWindowTitleChanged((id, title) => {
            this.setItemTitle(id, title);
        });
    }
    subscribeForEvents() {
        window.onbeforeunload = () => {
            const currentWorkspaces = store_1.default.layouts;
            this._layoutsManager.saveWorkspacesFrame(currentWorkspaces);
        };
    }
    reportLayoutStructure(layout) {
        const allWinsInLayout = utils_1.getAllWindowsFromConfig(layout.toConfig().content);
        allWinsInLayout.forEach((w) => {
            const win = layout.root.getItemsById(w.id)[0];
            this._frameController.moveFrame(utils_1.idAsString(win.config.id), utils_1.getElementBounds(win.element));
        });
    }
    closeTab(item) {
        const itemId = utils_1.idAsString(item.config.id);
        const workspace = store_1.default.getByWindowId(itemId);
        this._controller.removeLayoutElement(itemId);
        this._frameController.remove(itemId);
        if (!workspace.windows.length) {
            this.checkForEmptyWorkspace(workspace);
        }
    }
    closeWorkspace(workspace) {
        workspace.windows.forEach(w => this._frameController.remove(w.id));
        this.checkForEmptyWorkspace(workspace);
    }
    checkForEmptyWorkspace(workspace) {
        var _a;
        // Closing all workspaces except the last one
        if (store_1.default.layouts.length === 1) {
            workspace.windows = [];
            (_a = workspace.layout) === null || _a === void 0 ? void 0 : _a.destroy();
            workspace.layout = undefined;
            this._controller.showAddButton(workspace.id);
        }
        else {
            this._controller.removeWorkspace(workspace.id);
        }
    }
}
exports.default = new WorkspacesManager();
//# sourceMappingURL=manager.js.map