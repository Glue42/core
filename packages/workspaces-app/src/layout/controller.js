"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutController = void 0;
const GoldenLayout = require("golden-layout");
const callback_registry_1 = require("callback-registry");
const ResizeObserver = require("resize-observer-polyfill").default;
const utils_1 = require("../utils");
const store_1 = require("../store");
const factory_1 = require("../config/factory");
const constants_1 = require("../constants");
const factory_2 = require("../config/factory");
class LayoutController {
    constructor(emitter, stateResolver, options) {
        this._maximizedId = "__glMaximised";
        this._workspaceLayoutElementId = "#outter-layout-container";
        this._registry = callback_registry_1.default();
        this._emptyVisibleWindowName = constants_1.EmptyVisibleWindowName;
        this._stackMaximizeLabel = "maximize";
        this._stackRestoreLabel = "restore";
        this._options = options;
        this._emitter = emitter;
        this._stateResolver = stateResolver;
    }
    get emitter() {
        return this._emitter;
    }
    async init(config) {
        this._frameId = config.frameId;
        await this.initWorkspaceConfig(config.workspaceLayout);
        await Promise.all(config.workspaceConfigs.map(async (c) => {
            await this.initWorkspaceContents(c.id, c.config);
            this.emitter.raiseEvent("workspace-added", { workspace: store_1.default.getById(c.id) });
        }));
        this.setupOuterLayout();
        store_1.default.workspaceIds.forEach((id) => {
            this.setupContentLayouts(id);
        });
    }
    async addWindow(config, parentId) {
        parentId = parentId || utils_1.idAsString(store_1.default.workspaceLayout.root.contentItems[0].getActiveContentItem().config.id);
        const workspace = store_1.default.getByContainerId(parentId);
        if (!workspace.layout) {
            this.hideAddButton(workspace.id);
            await this.initWorkspaceContents(workspace.id, config);
            return;
        }
        const maximizedItem = workspace.layout._maximizedItem;
        if (maximizedItem) {
            maximizedItem.toggleMaximise();
        }
        let contentItem = workspace.layout.root.getItemsByFilter((ci) => ci.isColumn || ci.isRow)[0];
        if (parentId) {
            contentItem = workspace.layout.root.getItemsById(parentId)[0];
        }
        if (!contentItem) {
            contentItem = workspace.layout.root.getItemsByFilter((ci) => ci.isStack)[0];
        }
        const { placementId, windowId, url, appName } = this.getWindowInfoFromConfig(config);
        this.registerWindowComponent(workspace.layout, utils_1.idAsString(placementId), windowId);
        const emptyVisibleWindow = contentItem.getComponentsByName(this._emptyVisibleWindowName)[0];
        store_1.default.addWindow({
            id: utils_1.idAsString(placementId),
            appName,
            url,
            windowId
        }, workspace.id);
        return new Promise((res, rej) => {
            const unsub = this.emitter.onContentComponentCreated((component) => {
                if (component.config.id === placementId) {
                    unsub();
                    res();
                }
            });
            // if the root element is a stack you must add the window to the stack
            if (workspace.layout.root.contentItems[0].type === "stack" && config.type !== "component") {
                config = utils_1.getAllWindowsFromConfig([config])[0];
            }
            if (emptyVisibleWindow) {
                emptyVisibleWindow.parent.replaceChild(emptyVisibleWindow, config);
                return;
            }
            contentItem.addChild(config);
        });
    }
    async addContainer(config, parentId) {
        var _a;
        const workspace = store_1.default.getByContainerId(parentId);
        if (!workspace.layout) {
            const containerId = config.id || factory_2.default.getId();
            if (config) {
                config.id = containerId;
            }
            this.hideAddButton(workspace.id);
            await this.initWorkspaceContents(workspace.id, config);
            return utils_1.idAsString(containerId);
        }
        const maximizedItem = workspace.layout._maximizedItem;
        if (maximizedItem) {
            maximizedItem.toggleMaximise();
        }
        let contentItem = workspace.layout.root.getItemsByFilter((ci) => ci.isColumn || ci.isRow)[0];
        if (parentId) {
            contentItem = workspace.layout.root.getItemsById(parentId)[0];
        }
        if (!contentItem) {
            contentItem = workspace.layout.root.getItemsByFilter((ci) => ci.isStack)[0];
        }
        if (workspace.id === parentId) {
            if (config.type === "column") {
                this.bundleWorkspace(workspace.id, "row");
            }
            else if (config.type === "row") {
                this.bundleWorkspace(workspace.id, "column");
            }
            contentItem = workspace.layout.root.contentItems[0];
        }
        if (config.content) {
            utils_1.getAllWindowsFromConfig(config.content).forEach((w) => {
                this.registerWindowComponent(workspace.layout, utils_1.idAsString(w.id), w.componentState.windowId);
                store_1.default.addWindow({
                    id: utils_1.idAsString(w.id),
                    appName: w.componentState.appName,
                    url: w.componentState.url,
                    windowId: w.componentState.windowId,
                }, workspace.id);
            });
        }
        if (contentItem.type === "component") {
            throw new Error("The target item for add container can't be a component");
        }
        const groupWrapperChild = contentItem.contentItems
            .find((ci) => ci.type === "stack" && ci.config.workspacesConfig.wrapper === true);
        const hasGroupWrapperAPlaceholder = ((_a = groupWrapperChild === null || groupWrapperChild === void 0 ? void 0 : groupWrapperChild.contentItems[0]) === null || _a === void 0 ? void 0 : _a.config.componentName) === this._emptyVisibleWindowName;
        return new Promise((res, rej) => {
            let unsub;
            const timeout = setTimeout(() => {
                unsub();
                rej(`Component with id ${config.id} could not be created in 10000ms`);
            }, 10000);
            unsub = this.emitter.onContentItemCreated((wId, item) => {
                if (wId === workspace.id && item.type === config.type) {
                    res(utils_1.idAsString(item.config.id));
                    unsub();
                    clearTimeout(timeout);
                }
            });
            if ((groupWrapperChild === null || groupWrapperChild === void 0 ? void 0 : groupWrapperChild.contentItems.length) === 1 && hasGroupWrapperAPlaceholder) {
                const emptyVisibleWindow = contentItem.getComponentsByName(this._emptyVisibleWindowName)[0];
                emptyVisibleWindow.parent.replaceChild(emptyVisibleWindow, config);
            }
            else {
                contentItem.addChild(config);
            }
        });
    }
    bundleWorkspace(workspaceId, type) {
        const workspace = store_1.default.getById(workspaceId);
        const contentConfigs = workspace.layout.root.contentItems.map((ci) => {
            return this._stateResolver.getContainerConfig(ci.config.id);
        });
        const oldChild = workspace.layout.root.contentItems[0];
        const newChild = { type, content: contentConfigs, workspacesConfig: {} };
        workspace.layout.root.replaceChild(oldChild, newChild);
    }
    hideAddButton(workspaceId) {
        $(`#nestHere${workspaceId}`).children(".add-button").hide();
    }
    showAddButton(workspaceId) {
        $(`#nestHere${workspaceId}`).children(".add-button").show();
    }
    async addWorkspace(id, config) {
        const stack = store_1.default.workspaceLayout.root.getItemsByFilter((ci) => ci.isStack)[0];
        const componentConfig = {
            componentName: factory_1.default.getWorkspaceLayoutComponentName(id),
            type: "component",
            workspacesConfig: {},
            id,
            title: factory_1.default.getWorkspaceTitle(store_1.default.workspaceTitles)
        };
        this.registerWorkspaceComponent(id);
        stack.addChild(componentConfig);
        await this.initWorkspaceContents(id, config);
        this.setupContentLayouts(id);
        this.emitter.raiseEvent("workspace-added", { workspace: store_1.default.getById(id) });
    }
    removeWorkspace(workspaceId) {
        const workspaceToBeRemoved = store_1.default.getWorkspaceLayoutItemById(workspaceId);
        if (!workspaceToBeRemoved) {
            throw new Error(`Could find workspace to remove with id ${workspaceId}`);
        }
        store_1.default.removeById(workspaceId);
        workspaceToBeRemoved.remove();
    }
    changeTheme(themeName) {
        const htmlElement = document.getElementsByTagName("html")[0];
        if (themeName === "light") {
            if (!htmlElement.classList.contains(themeName)) {
                htmlElement.classList.remove("dark");
                htmlElement.classList.add(themeName);
            }
        }
        else {
            if (!htmlElement.classList.contains(themeName)) {
                htmlElement.classList.remove("light");
                htmlElement.classList.add(themeName);
            }
        }
        const lightLink = $('link[href="./dist/glue42-light-theme.css"]');
        const link = lightLink.length === 0 ? $('link[href="./dist/glue42-dark-theme.css"]') : lightLink;
        link.attr("href", `./dist/glue42-${themeName}-theme.css`);
    }
    getDragElement() {
        const dragElement = $(".lm_dragProxy");
        return dragElement[0];
    }
    setDragElementSize(contentWidth, contentHeight) {
        const dragElement = this.getDragElement();
        if (!dragElement) {
            const observer = new MutationObserver((mutations) => {
                let targetElement;
                Array.from(mutations).forEach((m) => {
                    const newItems = $(m.addedNodes);
                    if (!targetElement) {
                        targetElement = newItems.find(".lm_dragProxy");
                    }
                });
                if (targetElement) {
                    observer.disconnect();
                    this.setDragElementSize(contentWidth, contentHeight);
                }
            });
            observer.observe($("body")[0], { childList: true, subtree: true });
        }
        else {
            dragElement.setAttribute("width", `${contentWidth}px`);
            dragElement.setAttribute("height", `${contentHeight}px`);
            const dragProxyContent = $(dragElement).children(".lm_content").children(".lm_item_container")[0];
            dragProxyContent.setAttribute("width", `${contentWidth}px`);
            dragProxyContent.setAttribute("height", `${contentHeight}px`);
            dragProxyContent.setAttribute("style", "");
        }
    }
    removeLayoutElement(windowId) {
        let resultLayout;
        store_1.default.layouts.filter((l) => l.layout).forEach((l) => {
            const elementToRemove = l.layout.root.getItemsById(windowId)[0];
            if (elementToRemove && l.windows.find((w) => w.id === windowId)) {
                l.windows = l.windows.filter((w) => w.id !== windowId);
                elementToRemove.remove();
                resultLayout = l;
            }
        });
        return resultLayout;
    }
    setWindowTitle(windowId, title) {
        const item = store_1.default.getWindowContentItem(windowId);
        item.setTitle(title);
    }
    setWorkspaceTitle(workspaceId, title) {
        const item = store_1.default.getWorkspaceLayoutItemById(workspaceId);
        item.setTitle(title);
    }
    focusWindow(windowId) {
        const layoutWithWindow = store_1.default.layouts.find((l) => l.windows.some((w) => w.id === windowId));
        const item = layoutWithWindow.layout.root.getItemsById(windowId)[0];
        item.parent.setActiveContentItem(item);
    }
    focusWorkspace(workspaceId) {
        const item = store_1.default.getWorkspaceLayoutItemById(workspaceId);
        item.parent.setActiveContentItem(item);
    }
    maximizeWindow(windowId) {
        const layoutWithWindow = store_1.default.layouts.find((l) => l.windows.some((w) => w.id === windowId));
        const item = layoutWithWindow.layout.root.getItemsById(windowId)[0];
        if (item.parent.hasId(this._maximizedId)) {
            return;
        }
        item.parent.toggleMaximise();
    }
    restoreWindow(windowId) {
        const layoutWithWindow = store_1.default.layouts.find((l) => l.windows.some((w) => w.id === windowId));
        const item = layoutWithWindow.layout.root.getItemsById(windowId)[0];
        if (item.parent.hasId(this._maximizedId)) {
            item.parent.toggleMaximise();
        }
    }
    async showLoadedWindow(placementId, windowId) {
        await this.waitForWindowContainer(placementId);
        const winContainer = store_1.default.getWindowContentItem(placementId);
        const workspace = store_1.default.getByWindowId(placementId);
        const winContainerConfig = winContainer.config;
        winContainerConfig.componentState.windowId = windowId;
        workspace.windows.find((w) => w.id === placementId).windowId = windowId;
        winContainer.parent.replaceChild(winContainer, winContainerConfig);
    }
    isWindowVisible(placementId) {
        placementId = utils_1.idAsString(placementId);
        const contentItem = store_1.default.getWindowContentItem(placementId);
        const parentStack = contentItem.parent;
        return parentStack.getActiveContentItem().config.id === placementId;
    }
    initWorkspaceContents(id, config) {
        if (!config || (config.type !== "component" && !config.content.length)) {
            store_1.default.addOrUpdate(id, []);
            this.showAddButton(id);
            return Promise.resolve();
        }
        const waitFor = utils_1.createWaitFor(2);
        if (!config.settings) {
            config.settings = factory_1.default.getDefaultWorkspaceSettings();
        }
        if (config.type && config.type !== "workspace") {
            // Wrap the component in a column when you don't have a workspace;
            config = {
                settings: factory_1.default.getDefaultWorkspaceSettings(),
                content: [
                    {
                        type: "column",
                        content: [
                            config
                        ],
                        workspacesConfig: {}
                    }
                ]
            };
        }
        if (config.type !== "component" && config.content[0].type === "stack") {
            // Wrap the component in a column when your top element is stack;
            config = {
                ...config,
                content: [
                    {
                        type: "column",
                        content: config.content,
                        workspacesConfig: {}
                    }
                ]
            };
        }
        const layout = new GoldenLayout(config, $(`#nestHere${id}`));
        store_1.default.addOrUpdate(id, []);
        this.registerEmptyWindowComponent(layout, id);
        utils_1.getAllWindowsFromConfig(config.content).forEach((element) => {
            this.registerWindowComponent(layout, utils_1.idAsString(element.id), element.componentState.windowId);
        });
        const layoutContainer = $(`#nestHere${id}`);
        layout.on("initialised", () => {
            const allWindows = utils_1.getAllWindowsFromConfig(layout.toConfig().content);
            store_1.default.addOrUpdate(id, allWindows.map((w) => {
                const winContentItem = layout.root.getItemsById(utils_1.idAsString(w.id))[0];
                const winElement = winContentItem.element;
                return {
                    id: utils_1.idAsString(w.id),
                    bounds: utils_1.getElementBounds(winElement),
                    windowId: w.componentState.windowId,
                };
            }), layout);
            this.emitter.raiseEventWithDynamicName(`content-layout-initialised-${id}`);
            this.emitter.raiseEvent("content-layout-init", { layout });
            const containerWidth = layoutContainer.width();
            const containerHeight = layoutContainer.height();
            layout.updateSize(containerWidth, containerHeight);
            waitFor.signal();
        });
        layout.on("stateChanged", () => {
            this.emitter.raiseEvent("content-layout-state-changed", { layoutId: id });
        });
        layout.on("itemCreated", (item) => {
            var _a;
            if (!item.isComponent) {
                if (item.isRoot) {
                    if (!item.id || !item.id.length) {
                        item.addId(id);
                    }
                    return;
                }
                if (!item.config.id || !item.config.id.length) {
                    item.addId(factory_2.default.getId());
                }
            }
            else {
                item.on("size-changed", () => {
                    const windowWithChangedSize = store_1.default.getById(id).windows.find((w) => w.id === item.config.id);
                    if (windowWithChangedSize) {
                        windowWithChangedSize.bounds = utils_1.getElementBounds(item.element);
                    }
                    const itemId = item.config.id;
                    this.emitter.raiseEvent("content-item-resized", { target: item.element[0], id: utils_1.idAsString(itemId) });
                });
                if (item.config.componentName === this._emptyVisibleWindowName || ((_a = item.parent) === null || _a === void 0 ? void 0 : _a.config.workspacesConfig.wrapper)) {
                    item.tab.header.position(false);
                }
            }
            this.emitter.raiseEvent("content-item-created", { workspaceId: id, item });
        });
        layout.on("stackCreated", (stack) => {
            const button = document.createElement("li");
            button.classList.add("lm_add_button");
            button.onclick = (e) => {
                e.stopPropagation();
                this.emitter.raiseEvent("add-button-clicked", {
                    args: {
                        laneId: utils_1.idAsString(stack.config.id),
                        workspaceId: id,
                        bounds: utils_1.getElementBounds(button),
                    }
                });
            };
            const maximizeButton = $(stack.element)
                .children(".lm_header")
                .children(".lm_controls")
                .children(".lm_maximise");
            maximizeButton.addClass("workspace_content");
            stack.on("maximized", () => {
                maximizeButton.addClass("lm_restore");
                maximizeButton.attr("title", this._stackRestoreLabel);
                this.emitter.raiseEvent("stack-maximized", { stack });
            });
            stack.on("minimized", () => {
                maximizeButton.removeClass("lm_restore");
                maximizeButton.attr("title", this._stackMaximizeLabel);
                this.emitter.raiseEvent("stack-restored", { stack });
            });
            if (!this._options.disableCustomButtons) {
                stack.header.controlsContainer.prepend($(button));
            }
            stack.on("activeContentItemChanged", (tab) => {
                const activeItem = stack.getActiveContentItem();
                if (!activeItem.isComponent) {
                    return;
                }
                const clickedTabId = activeItem.config.id;
                const toFront = [{
                        id: utils_1.idAsString(activeItem.config.id),
                        bounds: utils_1.getElementBounds(activeItem.element),
                        windowId: activeItem.config.componentState.windowId,
                        appName: activeItem.config.componentState.appName,
                        url: activeItem.config.componentState.url,
                    }];
                const allTabsInTabGroup = stack.header.tabs.reduce((acc, t) => {
                    const contentItemConfig = t.contentItem.config;
                    if (contentItemConfig.type === "component") {
                        const win = {
                            id: utils_1.idAsString(contentItemConfig.id),
                            bounds: utils_1.getElementBounds(t.contentItem.element),
                            windowId: contentItemConfig.componentState.windowId,
                            appName: contentItemConfig.componentState.appName,
                            url: contentItemConfig.componentState.url,
                        };
                        acc.push(win);
                    }
                    return acc;
                }, []);
                const toBack = allTabsInTabGroup
                    .filter((t) => t.id !== clickedTabId);
                this.emitter.raiseEvent("selection-changed", { toBack, toFront });
            });
            stack.on("popoutRequested", () => {
                const activeItem = stack.getActiveContentItem();
                this.emitter.raiseEvent("eject-requested", { item: activeItem });
            });
        });
        layout.on("tabCreated", (tab) => {
            tab._dragListener.on("drag", () => {
                this.emitter.raiseEvent("tab-drag", { tab });
            });
            tab._dragListener.on("dragStart", () => {
                this.emitter.raiseEvent("tab-drag-start", { tab });
            });
            tab._dragListener.on("dragEnd", () => {
                this.emitter.raiseEvent("tab-drag-end", { tab });
            });
            tab.element.mousedown(() => {
                this.emitter.raiseEvent("tab-element-mouse-down", { tab });
            });
        });
        layout.on("tabCloseRequested", (tab) => {
            this.emitter.raiseEvent("tab-close-requested", { item: tab.contentItem });
        });
        layout.on("componentCreated", (component) => {
            const result = this.emitter.raiseEvent("content-component-created", { component, workspaceId: id });
            if (Array.isArray(result)) {
                Promise.all(result).then(() => {
                    waitFor.signal();
                }).catch((e) => waitFor.reject(e));
            }
            else {
                result.then(() => {
                    waitFor.signal();
                }).catch((e) => waitFor.reject(e));
            }
        });
        layout.init();
        return waitFor.promise;
    }
    initWorkspaceConfig(workspaceConfig) {
        return new Promise((res) => {
            workspaceConfig.settings.selectionEnabled = true;
            store_1.default.workspaceLayout = new GoldenLayout(workspaceConfig, $(this._workspaceLayoutElementId));
            const outerResizeObserver = new ResizeObserver((entries) => {
                Array.from(entries).forEach((e) => {
                    this.emitter.raiseEvent("outer-layout-container-resized", { target: e.target });
                });
            });
            outerResizeObserver.observe($("#outter-layout-container")[0]);
            workspaceConfig.content[0].content.forEach((configObj) => {
                const workspaceId = configObj.id;
                this.registerWorkspaceComponent(utils_1.idAsString(workspaceId));
            });
            store_1.default.workspaceLayout.on("initialised", () => {
                this.emitter.raiseEvent("workspace-layout-initialised", {});
                res();
            });
            store_1.default.workspaceLayout.on("stackCreated", (stack) => {
                const closeButton = stack.header.controlsContainer.children(".lm_close")[0];
                if (closeButton) {
                    closeButton.onclick = () => {
                        this.emitter.raiseEvent("close-frame", {});
                    };
                }
                if (!this._options.disableCustomButtons) {
                    const button = document.createElement("li");
                    button.classList.add("lm_add_button");
                    button.onclick = (e) => {
                        e.stopPropagation();
                        this._emitter.raiseEvent("workspace-add-button-clicked", {});
                    };
                    stack.header.workspaceControlsContainer.prepend($(button));
                }
                stack.on("activeContentItemChanged", async (tab) => {
                    if (store_1.default.workspaceIds.length === 0) {
                        return;
                    }
                    const activeItem = stack.getActiveContentItem();
                    const activeWorkspaceId = activeItem.config.id;
                    await this.waitForLayout(activeWorkspaceId);
                    // don't ignore the windows from the currently selected workspace because the event
                    // which adds the workspacesFrame hasn't still added the new workspace and the active item status the last tab
                    const allOtherWindows = store_1.default.workspaceIds.reduce((acc, id) => {
                        return [...acc, ...store_1.default.getById(id).windows];
                    }, []);
                    const toBack = allOtherWindows;
                    this.emitter.raiseEvent("workspace-selection-changed", { workspace: store_1.default.getById(activeWorkspaceId), toBack });
                });
            });
            store_1.default.workspaceLayout.on("itemCreated", (item) => {
                if (item.isComponent) {
                    item.on("size-changed", () => {
                        this.emitter.raiseEvent("workspace-content-container-resized", { target: item, id: utils_1.idAsString(item.config.id) });
                        this.emitter.raiseEventWithDynamicName(`workspace-content-container-resized-${item.config.id}`, item);
                    });
                }
            });
            store_1.default.workspaceLayout.on("tabCreated", (tab) => {
                const saveButton = document.createElement("div");
                saveButton.classList.add("lm_saveButton");
                saveButton.onclick = (e) => {
                    e.stopPropagation();
                    this.emitter.raiseEvent("workspace-save-requested", { workspaceId: utils_1.idAsString(tab.contentItem.config.id) });
                };
                if (!this._options.disableCustomButtons) {
                    tab.element[0].prepend(saveButton);
                }
            });
            store_1.default.workspaceLayout.on("tabCloseRequested", (tab) => {
                this.emitter.raiseEvent("workspace-tab-close-requested", { workspace: store_1.default.getById(tab.contentItem.config.id) });
            });
            store_1.default.workspaceLayout.init();
        });
    }
    setupOuterLayout() {
        this.emitter.onOuterLayoutContainerResized((target) => {
            store_1.default.workspaceLayout.updateSize($(target).width(), $(target).height());
        });
    }
    setupContentLayouts(id) {
        this.emitter.onContentContainerResized((item) => {
            const currLayout = store_1.default.getById(id).layout;
            if (currLayout) {
                currLayout.updateSize($(item.element).width(), $(item.element).height());
            }
        }, id);
    }
    registerWindowComponent(layout, placementId, windowId) {
        this.registerComponent(layout, `app${placementId}`, (container) => {
            const div = document.createElement("div");
            div.setAttribute("style", "height:100%;");
            div.id = `app${placementId}`;
            container.getElement().append(div);
        });
    }
    registerEmptyWindowComponent(layout, workspaceId) {
        this.registerComponent(layout, this._emptyVisibleWindowName, (container) => {
            const emptyContainerDiv = document.createElement("div");
            emptyContainerDiv.classList.add("empty-container-background");
            const newButton = document.createElement("button");
            newButton.classList.add("add-button");
            newButton.onclick = (e) => {
                e.stopPropagation();
                const contentItem = container.tab.contentItem;
                const parentType = contentItem.parent.type === "stack" ? "group" : contentItem.parent.type;
                this.emitter.raiseEvent("add-button-clicked", {
                    args: {
                        laneId: utils_1.idAsString(contentItem.parent.config.id),
                        workspaceId,
                        parentType,
                        bounds: utils_1.getElementBounds(newButton)
                    }
                });
            };
            emptyContainerDiv.append(newButton);
            container.getElement().append(emptyContainerDiv);
        });
    }
    registerWorkspaceComponent(workspaceId) {
        this.registerComponent(store_1.default.workspaceLayout, factory_1.default.getWorkspaceLayoutComponentName(workspaceId), (container, componentState) => {
            const div = document.createElement("div");
            div.setAttribute("style", "height:calc(100% - 1px); width:calc(100% - 1px);");
            div.id = `nestHere${workspaceId}`;
            const newButton = document.createElement("button");
            newButton.classList.add("add-button");
            newButton.onclick = (e) => {
                e.stopPropagation();
                const contentItem = container.tab.contentItem;
                this.emitter.raiseEvent("add-button-clicked", {
                    args: {
                        laneId: utils_1.idAsString(contentItem.parent.id),
                        workspaceId,
                        bounds: utils_1.getElementBounds(newButton)
                    }
                });
            };
            div.appendChild(newButton);
            container.getElement().append(div);
            $(newButton).hide();
        });
    }
    registerComponent(layout, name, callback) {
        try {
            // tslint:disable-next-line:only-arrow-functions
            layout.registerComponent(name, function (container, componentState) {
                if (callback) {
                    callback(container, componentState);
                }
            });
        }
        catch (error) {
            // tslint:disable-next-line:no-console
            console.log(`Tried to register and already existing component - ${name}`);
        }
    }
    waitForLayout(id) {
        return new Promise((res, rej) => {
            const unsub = this._registry.add(`content-layout-initialised-${id}`, () => {
                res();
                unsub();
            });
            if (store_1.default.getById(id)) {
                res();
                unsub();
            }
        });
    }
    waitForWindowContainer(placementId) {
        return new Promise((res, rej) => {
            const unsub = this.emitter.onContentComponentCreated((component) => {
                if (component.config.id === placementId) {
                    res();
                    unsub();
                }
            });
            if (store_1.default.getWindowContentItem(placementId)) {
                res();
                unsub();
            }
        });
    }
    getWindowInfoFromConfig(config) {
        if (config.type !== "component") {
            return this.getWindowInfoFromConfig(config.content[0]);
        }
        return {
            placementId: utils_1.idAsString(config.id),
            windowId: config.componentState.windowId,
            appName: config.componentState.appName,
            url: config.componentState.url
        };
    }
}
exports.LayoutController = LayoutController;
//# sourceMappingURL=controller.js.map