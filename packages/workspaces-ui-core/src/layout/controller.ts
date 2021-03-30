import GoldenLayout from "@glue42/golden-layout";
import registryFactory from "callback-registry";
const ResizeObserver = require("resize-observer-polyfill").default || require("resize-observer-polyfill");
import { idAsString, getAllWindowsFromConfig, createWaitFor, getElementBounds } from "../utils";
import { Workspace, Window, FrameLayoutConfig, StartupConfig, ComponentState, LayoutWithMaximizedItem } from "../types/internal";
import { LayoutEventEmitter } from "./eventEmitter";
import store from "../store";
import { LayoutStateResolver } from "./stateResolver";
import { EmptyVisibleWindowName } from "../constants";
import { TabObserver } from "./tabObserver";
import componentStateMonitor from "../componentStateMonitor";
import { WorkspacesConfigurationFactory } from "../config/factory";

export class LayoutController {
    private readonly _maximizedId = "__glMaximised";
    private readonly _workspaceLayoutElementId: string = "#outter-layout-container";
    private readonly _registry = registryFactory();
    private readonly _emitter: LayoutEventEmitter;
    private _frameId: string;
    private readonly _emptyVisibleWindowName: string = EmptyVisibleWindowName;
    private readonly _stateResolver: LayoutStateResolver;
    private readonly _options: StartupConfig;
    private readonly _stackMaximizeLabel = "maximize";
    private readonly _stackRestoreLabel = "restore";
    private readonly _configFactory: WorkspacesConfigurationFactory;

    constructor(emitter: LayoutEventEmitter, stateResolver: LayoutStateResolver, options: StartupConfig, configFactory: WorkspacesConfigurationFactory) {
        this._options = options;
        this._emitter = emitter;
        this._stateResolver = stateResolver;
        this._configFactory = configFactory;
    }

    public get emitter() {
        return this._emitter;
    }

    public get bounds() {
        return getElementBounds(document.getElementById("outter-layout-container"));
    }

    public async init(config: FrameLayoutConfig) {
        this._frameId = config.frameId;
        const tabObserver = new TabObserver();
        tabObserver.init(this._workspaceLayoutElementId);
        await this.initWorkspaceConfig(config.workspaceLayout);
        this.refreshLayoutSize();
        await Promise.all(config.workspaceConfigs.map(async (c) => {
            await this.initWorkspaceContents(c.id, c.config);
            this.emitter.raiseEvent("workspace-added", { workspace: store.getById(c.id) });
        }));

        this.setupOuterLayout();

        store.workspaceIds.forEach((id) => {
            this.setupContentLayouts(id);
        });
    }

    public async addWindow(config: GoldenLayout.ItemConfig, parentId: string) {
        parentId = parentId || idAsString(store.workspaceLayout.root.contentItems[0].getActiveContentItem().config.id);
        const workspace = store.getByContainerId(parentId);

        if (this._stateResolver.isWorkspaceHibernated(workspace.id)) {
            throw new Error(`Could not add window to ${workspace.id} because its hibernated`);
        }

        if (!workspace.layout) {
            this.hideAddButton(workspace.id);
            await this.initWorkspaceContents(workspace.id, config);
            return;
        }

        const maximizedItem = (workspace.layout as LayoutWithMaximizedItem)._maximizedItem as GoldenLayout.ContentItem;
        if (maximizedItem) {
            maximizedItem.toggleMaximise();
        }

        let contentItem = workspace.layout.root.getItemsByFilter((ci) => ci.isColumn || ci.isRow)[0];
        if (parentId && parentId !== workspace.id) {
            contentItem = workspace.layout.root.getItemsById(parentId)[0];
        }

        if (!contentItem) {
            contentItem = workspace.layout.root.getItemsByFilter((ci) => ci.isStack)[0];
        }

        const { placementId, windowId, url, appName } = this.getWindowInfoFromConfig(config);

        this.registerWindowComponent(workspace.layout, idAsString(placementId));

        const emptyVisibleWindow = contentItem.getComponentsByName(this._emptyVisibleWindowName)[0];

        return new Promise<void>((res) => {
            const unsub = this.emitter.onContentComponentCreated((component) => {
                if (component.config.id === placementId) {
                    unsub();
                    res();
                }
            });

            // if the root element is a stack you must add the window to the stack
            if (workspace.layout.root.contentItems[0].type === "stack" && config.type !== "component") {
                config = getAllWindowsFromConfig([config])[0];
            }

            if (emptyVisibleWindow && !emptyVisibleWindow.parent.config.workspacesConfig?.wrapper) {
                // Triggered when the API level parent is an empty group

                const group = this._configFactory.wrapInGroup([config as GoldenLayout.ComponentConfig]);
                group.workspacesConfig.wrapper = false;
                // Replacing the whole stack in order to trigger the header logic and the properly update the title
                emptyVisibleWindow.parent.parent.replaceChild(emptyVisibleWindow.parent, group);

                return;
            } else if (emptyVisibleWindow) {
                // Triggered when the API level parent is an empty group/column
                emptyVisibleWindow.parent.replaceChild(emptyVisibleWindow, config);
                return;
            }
            contentItem.addChild(config);
        });
    }

    public async addContainer(config: GoldenLayout.RowConfig | GoldenLayout.ColumnConfig | GoldenLayout.StackConfig, parentId: string): Promise<string> {
        const workspace = store.getByContainerId(parentId);
        if (this._stateResolver.isWorkspaceHibernated(workspace.id)) {
            throw new Error(`Could not add container to ${workspace.id} because its hibernated`);
        }
        if (!workspace.layout) {
            const containerId = config.id || this._configFactory.getId();
            if (config) {
                config.id = containerId;
            }
            this.hideAddButton(workspace.id);
            await this.initWorkspaceContents(workspace.id, config);
            return idAsString(containerId);
        }

        const maximizedItem = (workspace.layout as LayoutWithMaximizedItem)._maximizedItem as GoldenLayout.ContentItem;
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
            if (config.type === "column" || config.type === "stack") {
                this.bundleWorkspace(workspace.id, "row");
            }
            else if (config.type === "row") {
                this.bundleWorkspace(workspace.id, "column");
            }

            contentItem = workspace.layout.root.contentItems[0];
        }

        if (config.content) {
            getAllWindowsFromConfig(config.content).forEach((w: GoldenLayout.ComponentConfig) => {
                this.registerWindowComponent(workspace.layout, idAsString(w.id));
                // store.addWindow({
                //     id: idAsString(w.id),
                //     appName: w.componentState.appName,
                //     url: w.componentState.url,
                //     windowId: w.componentState.windowId,
                // }, workspace.id);
            });
        }

        if (contentItem.type === "component") {
            throw new Error("The target item for add container can't be a component");
        }

        const groupWrapperChild = contentItem.contentItems
            .find((ci) => ci.type === "stack" && ci.config.workspacesConfig.wrapper === true) as GoldenLayout.Stack;

        const hasGroupWrapperAPlaceholder = (groupWrapperChild?.contentItems[0] as GoldenLayout.Component)?.config.componentName === this._emptyVisibleWindowName;

        return new Promise((res, rej) => {
            let unsub: () => void = () => {
                // safety
            };
            const timeout = setTimeout(() => {
                unsub();
                rej(`Component with id ${config.id} could not be created in 10000ms`);
            }, 10000);

            unsub = this.emitter.onContentItemCreated((wId, item) => {
                if (wId === workspace.id && item.type === config.type) {
                    res(idAsString(item.config.id));
                    unsub();
                    clearTimeout(timeout);
                }
            });

            if (groupWrapperChild?.contentItems.length === 1 && hasGroupWrapperAPlaceholder) {
                const emptyVisibleWindow = contentItem.getComponentsByName(this._emptyVisibleWindowName)[0];

                emptyVisibleWindow.parent.replaceChild(emptyVisibleWindow, config);
            } else {
                contentItem.addChild(config);
            }
        });
    }

    public closeContainer(itemId: string) {
        const workspace = store.getByContainerId(itemId) || store.getByWindowId(itemId);

        if (!workspace) {
            throw new Error(`Could not find container ${itemId} to close in any workspace`);
        }

        const contentItem = workspace.layout.root.getItemsById(itemId)[0];

        contentItem.remove();
    }

    public bundleWorkspace(workspaceId: string, type: "row" | "column") {
        const workspace = store.getById(workspaceId);

        const contentConfigs = workspace.layout.root.contentItems.map((ci) => {
            return this._stateResolver.getContainerConfig(ci.config.id);
        });

        const oldChild = workspace.layout.root.contentItems[0];
        const newChild: GoldenLayout.ItemConfig = { type, content: contentConfigs, workspacesConfig: {} };

        workspace.layout.root.replaceChild(oldChild, newChild);
    }

    public hideAddButton(workspaceId: string) {
        $(`#nestHere${workspaceId}`).children(".add-button").hide();
    }

    public showAddButton(workspaceId: string) {
        $(`#nestHere${workspaceId}`).children(".add-button").show();
    }

    public async addWorkspace(id: string, config: GoldenLayout.Config) {
        const stack = store.workspaceLayout.root.getItemsByFilter((ci) => ci.isStack)[0];

        const componentConfig: GoldenLayout.ComponentConfig = {
            componentName: this._configFactory.getWorkspaceLayoutComponentName(id),
            type: "component",
            workspacesConfig: {},
            id,
            noTabHeader: config.workspacesOptions?.noTabHeader,
            title: (config?.workspacesOptions as any)?.title || this._configFactory.getWorkspaceTitle(store.workspaceTitles)
        };

        this.registerWorkspaceComponent(id);

        stack.addChild(componentConfig, undefined, !componentConfig.noTabHeader);

        await this.initWorkspaceContents(id, config);

        this.setupContentLayouts(id);

        this.emitter.raiseEvent("workspace-added", { workspace: store.getById(id) });
    }

    public reinitializeWorkspace(id: string, config: GoldenLayout.Config) {
        store.removeLayout(id);
        if (config.workspacesOptions?.reuseWorkspaceId) {
            // Making sure that the property doesn't leak in a workspace summary or a saved layout
            delete config.workspacesOptions.reuseWorkspaceId;
        }
        return this.initWorkspaceContents(id, config);
    }

    public removeWorkspace(workspaceId: string) {
        const workspaceToBeRemoved = store.getWorkspaceLayoutItemById(workspaceId);

        if (!workspaceToBeRemoved) {
            throw new Error(`Could find workspace to remove with id ${workspaceId}`);
        }
        store.removeById(workspaceId);
        workspaceToBeRemoved.remove();
    }

    public changeTheme(themeName: string) {
        const htmlElement = document.getElementsByTagName("html")[0];

        if (themeName === "light") {
            if (!htmlElement.classList.contains(themeName)) {
                htmlElement.classList.remove("dark");
                htmlElement.classList.add(themeName);
            }
        } else {
            if (!htmlElement.classList.contains(themeName)) {
                htmlElement.classList.remove("light");
                htmlElement.classList.add(themeName);
            }
        }
        const lightLink = $("link[href='./dist/glue42-light-theme.css']");
        const link = lightLink.length === 0 ? $("link[href='./dist/glue42-dark-theme.css']") : lightLink;
        link.attr("href", `./dist/glue42-${themeName}-theme.css`);
    }

    public getDragElement(): Element {
        const dragElement = $(".lm_dragProxy");

        return dragElement[0];
    }

    public setDragElementSize(contentWidth: number, contentHeight: number) {
        const dragElement = this.getDragElement();

        if (!dragElement) {
            const observer = new MutationObserver((mutations) => {
                let targetElement: JQuery;
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
        } else {
            dragElement.setAttribute("width", `${contentWidth}px`);
            dragElement.setAttribute("height", `${contentHeight}px`);

            const dragProxyContent = $(dragElement).children(".lm_content").children(".lm_item_container")[0];

            dragProxyContent.setAttribute("width", `${contentWidth}px`);
            dragProxyContent.setAttribute("height", `${contentHeight}px`);
            dragProxyContent.setAttribute("style", "");
        }
    }

    public removeLayoutElement(windowId: string): Workspace {
        let resultLayout: Workspace;
        store.layouts.filter((l) => l.layout).forEach((l) => {
            const elementToRemove = l.layout.root.getItemsById(windowId)[0];

            if (elementToRemove && l.windows.find((w) => w.id === windowId)) {
                l.windows = l.windows.filter((w) => w.id !== windowId);
                elementToRemove.remove();

                resultLayout = l;
            }
        });

        return resultLayout;
    }

    public setWindowTitle(windowId: string, title: string) {
        const item = store.getWindowContentItem(windowId);

        if (!item) {
            throw new Error(`Could not find window ${windowId} to change its title to ${title}`);
        }

        item.setTitle(title);
        item.config.componentState.title = title;
    }

    public setWorkspaceTitle(workspaceId: string, title: string) {
        const item = store.getWorkspaceLayoutItemById(workspaceId);

        item.setTitle(title);
    }

    public focusWindow(windowId: string) {
        const layoutWithWindow = store.getByWindowId(windowId);

        if (!layoutWithWindow) {
            throw new Error(`Could not find workspace for window ${windowId}`);
        }

        if (this._stateResolver.isWorkspaceHibernated(layoutWithWindow.id)) {
            throw new Error(`Could not focus window ${windowId} because the workspace ${layoutWithWindow.id} is hibernated`);
        }

        const item = layoutWithWindow.layout.root.getItemsById(windowId)[0];
        item.parent.setActiveContentItem(item);
    }

    public focusWorkspace(workspaceId: string) {
        const item = store.getWorkspaceLayoutItemById(workspaceId);
        item.parent.setActiveContentItem(item);
    }

    public maximizeWindow(windowId: string) {
        const layoutWithWindow = store.getByWindowId(windowId);

        if (!layoutWithWindow) {
            throw new Error(`Could not find workspace for window ${windowId}`);
        }

        if (this._stateResolver.isWorkspaceHibernated(layoutWithWindow.id)) {
            throw new Error(`Could not maximize window ${windowId} because the workspace ${layoutWithWindow.id} is hibernated`);
        }

        const item = layoutWithWindow.layout.root.getItemsById(windowId)[0];
        if (item.parent.hasId(this._maximizedId)) {
            return;
        }
        item.parent.toggleMaximise();
    }

    public restoreWindow(windowId: string) {
        const layoutWithWindow = store.getByWindowId(windowId);

        if (!layoutWithWindow) {
            throw new Error(`Could not find workspace for window ${windowId}`);
        }

        if (this._stateResolver.isWorkspaceHibernated(layoutWithWindow.id)) {
            throw new Error(`Could not restore window ${windowId} because the workspace ${layoutWithWindow.id} is hibernated`);
        }

        const item = layoutWithWindow.layout.root.getItemsById(windowId)[0];
        if (item.parent.hasId(this._maximizedId)) {
            item.parent.toggleMaximise();
        }
    }

    public async showLoadedWindow(placementId: string, windowId: string) {
        await this.waitForWindowContainer(placementId);

        const winContainer: GoldenLayout.Component = store.getWindowContentItem(placementId);
        const workspace = store.getByWindowId(placementId);
        const winContainerConfig = winContainer.config;

        winContainerConfig.componentState.windowId = windowId;

        workspace.windows.find((w) => w.id === placementId).windowId = windowId;
        winContainer.parent.replaceChild(winContainer, winContainerConfig);
    }

    public isWindowVisible(placementId: string | string[]) {
        placementId = idAsString(placementId);
        const contentItem = store.getWindowContentItem(placementId);
        const parentStack = contentItem.parent;

        return parentStack.getActiveContentItem().config.id === placementId;
    }

    public showHibernationIcon(workspaceId: string) {
        const tab = store.getWorkspaceContentItem(workspaceId)?.tab;

        if (!tab) {
            return;
        }

        const saveButton = tab.element.children(".lm_saveButton");

        saveButton.addClass("lm_hibernationIcon");
        saveButton.attr("title", "hibernated");
    }

    public showSaveIcon(workspaceId: string) {
        const tab = store.getWorkspaceContentItem(workspaceId)?.tab;

        if (!tab) {
            console.error("Could not find the tab for", workspaceId);
            return;
        }

        const saveButton = tab.element.children(".lm_saveButton");
        saveButton.removeClass("lm_hibernationIcon");

        saveButton.attr("title", "save");
    }

    private initWorkspaceContents(id: string, config: GoldenLayout.Config | GoldenLayout.ItemConfig) {
        if (!config || (config.type !== "component" && !config.content.length)) {
            store.addOrUpdate(id, []);
            this.showAddButton(id);
            return Promise.resolve();
        }
        const waitFor = createWaitFor(2);

        if (!(config as GoldenLayout.Config).settings) {
            (config as GoldenLayout.Config).settings = this._configFactory.getDefaultWorkspaceSettings();

        }
        if (config.type && config.type !== "workspace") {
            // Wrap the component in a column when you don't have a workspace;
            config = {
                settings: this._configFactory.getDefaultWorkspaceSettings(),
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
        const layout = new GoldenLayout(config as GoldenLayout.Config, $(`#nestHere${id}`));
        store.addOrUpdate(id, []);

        this.registerEmptyWindowComponent(layout, id);

        getAllWindowsFromConfig((config as GoldenLayout.Config).content).forEach((element: GoldenLayout.ComponentConfig) => {
            this.registerWindowComponent(layout, idAsString(element.id));
        });

        const layoutContainer = $(`#nestHere${id}`);

        layout.on("initialised", () => {
            const allWindows = getAllWindowsFromConfig(layout.toConfig().content);

            store.addOrUpdate(id, allWindows.map((w) => {
                const winContentItem: GoldenLayout.ContentItem = layout.root.getItemsById(idAsString(w.id))[0];
                const winElement = winContentItem.element;

                return {
                    id: idAsString(w.id),
                    bounds: getElementBounds(winElement),
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

        layout.on("itemCreated", (item: GoldenLayout.ContentItem) => {
            if (!item.isComponent) {
                if (item.isRoot) {
                    if (!item.id || !item.id.length) {
                        item.addId(id);
                    }
                    return;
                }
                if (!item.config.id || !item.config.id.length) {
                    item.addId(this._configFactory.getId());
                }
            } else {
                item.on("size-changed", () => {
                    const windowWithChangedSize = store.getById(id).windows.find((w) => w.id === item.config.id);

                    if (windowWithChangedSize) {
                        windowWithChangedSize.bounds = getElementBounds(item.element);
                    }
                    const itemId = item.config.id;
                    this.emitter.raiseEvent("content-item-resized", { target: (item.element as any)[0], id: idAsString(itemId) });
                });

                if (item.config.componentName === this._emptyVisibleWindowName || item.parent?.config.workspacesConfig.wrapper) {
                    item.tab.header.position(false);
                }
            }

            this.emitter.raiseEvent("content-item-created", { workspaceId: id, item });
        });

        layout.on("stackCreated", (stack: GoldenLayout.Stack) => {
            const button = document.createElement("li");
            button.classList.add("lm_add_button");

            button.onclick = (e) => {
                e.stopPropagation();
                this.emitter.raiseEvent("add-button-clicked", {
                    args: {
                        laneId: idAsString(stack.config.id),
                        workspaceId: id,
                        bounds: getElementBounds(button),
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

            stack.on("activeContentItemChanged", () => {
                const activeItem = stack.getActiveContentItem();
                if (!activeItem.isComponent) {
                    return;
                }
                const clickedTabId = activeItem.config.id;
                const toFront: Window[] = [{
                    id: idAsString(activeItem.config.id),
                    bounds: getElementBounds(activeItem.element),
                    windowId: activeItem.config.componentState.windowId,
                    appName: activeItem.config.componentState.appName,
                    url: activeItem.config.componentState.url,
                }];

                const allTabsInTabGroup = stack.header.tabs.reduce((acc: Window[], t: GoldenLayout.Tab) => {
                    const contentItemConfig = t.contentItem.config;

                    if (contentItemConfig.type === "component") {
                        const win: Window = {
                            id: idAsString(contentItemConfig.id),
                            bounds: getElementBounds(t.contentItem.element),
                            windowId: contentItemConfig.componentState.windowId,
                            appName: contentItemConfig.componentState.appName,
                            url: contentItemConfig.componentState.url,
                        };

                        acc.push(win);
                    }

                    return acc;
                }, []);

                const toBack = allTabsInTabGroup
                    .filter((t: Window) => t.id !== clickedTabId);

                this.emitter.raiseEvent("selection-changed", { toBack, toFront });
            });

            stack.on("popoutRequested", () => {
                const activeItem = stack.getActiveContentItem();
                this.emitter.raiseEvent("eject-requested", { item: activeItem });
            });
        });

        layout.on("tabCreated", (tab: GoldenLayout.Tab) => {
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

            this.refreshTabSizeClass(tab);
        });

        layout.on("tabCloseRequested", (tab: GoldenLayout.Tab) => {
            this.emitter.raiseEvent("tab-close-requested", { item: tab.contentItem });
        });

        layout.on("componentCreated", (component: GoldenLayout.ContentItem) => {
            const result = this.emitter.raiseEvent("content-component-created", { component, workspaceId: id });
            if (Array.isArray(result)) {
                Promise.all(result).then(() => {
                    waitFor.signal();
                }).catch((e) => waitFor.reject(e));
            } else {
                result.then(() => {
                    waitFor.signal();
                }).catch((e) => waitFor.reject(e));
            }
        });

        layout.init();
        return waitFor.promise;
    }

    private initWorkspaceConfig(workspaceConfig: GoldenLayout.Config) {
        return new Promise<void>((res) => {
            workspaceConfig.settings.selectionEnabled = true;
            store.workspaceLayout = new GoldenLayout(workspaceConfig, $(this._workspaceLayoutElementId), componentStateMonitor.decoratedFactory);

            const outerResizeObserver = new ResizeObserver((entries: Array<{ target: Element }>) => {
                Array.from(entries).forEach((e) => {
                    this.emitter.raiseEvent("outer-layout-container-resized", { target: e.target });
                });
            });

            outerResizeObserver.observe($("#outter-layout-container")[0]);

            (workspaceConfig.content[0] as GoldenLayout.StackConfig).content.forEach((configObj) => {
                const workspaceId = configObj.id;

                this.registerWorkspaceComponent(idAsString(workspaceId));
            });

            store.workspaceLayout.on("initialised", () => {
                this.emitter.raiseEvent("workspace-layout-initialised", {});
                res();
            });

            store.workspaceLayout.on("stackCreated", (stack: GoldenLayout.Stack) => {
                const closeButton = stack.header.controlsContainer.children(".lm_close")[0];
                if (closeButton) {
                    closeButton.onclick = () => {
                        this.emitter.raiseEvent("close-frame", {});
                    };
                }

                const headerElement: HTMLElement = stack.header.element[0];
                const mutationObserver = new MutationObserver(() => {
                    const addButton = this.getElementByClass(headerElement, "lm_add_button");

                    if (addButton && componentStateMonitor.decoratedFactory.createAddWorkspace) {
                        addButton.onclick = (e: MouseEvent) => {
                            e.stopPropagation();
                            this.emitter.raiseEvent("workspace-add-button-clicked", { bounds: getElementBounds(addButton) });
                        };
                    }
                });

                const observerConfig = { attributes: false, childList: true, subtree: true };

                mutationObserver.observe(stack.header.element[0], observerConfig);
                if (!this._options.disableCustomButtons && !componentStateMonitor.decoratedFactory?.createAddWorkspace) {

                    const button = document.createElement("li");
                    button.classList.add("lm_add_button");

                    button.onclick = (e) => {
                        e.stopPropagation();
                        this._emitter.raiseEvent("workspace-add-button-clicked", {});
                    };

                    stack.header.workspaceControlsContainer.prepend($(button));
                }

                if (!componentStateMonitor.decoratedFactory.createLogo) {
                    const glueLogo = document.createElement("span");

                    glueLogo.classList.add("logo_type");

                    const container = stack.header.element[0].getElementsByClassName("lm_logo")[0];

                    if (container) {
                        container.appendChild(glueLogo);
                    }
                }

                stack.on("activeContentItemChanged", async () => {
                    if (store.workspaceIds.length === 0) {
                        return;
                    }

                    const activeItem = stack.getActiveContentItem();
                    const activeWorkspaceId = activeItem.config.id;
                    await this.waitForLayout(idAsString(activeWorkspaceId));

                    // don't ignore the windows from the currently selected workspace because the event
                    // which adds the workspacesFrame hasn't still added the new workspace and the active item status the last tab
                    const allOtherWindows = store.workspaceIds.reduce((acc, id) => {
                        return [...acc, ...store.getById(id).windows];
                    }, []);

                    const toBack: Window[] = allOtherWindows;

                    this.emitter.raiseEvent("workspace-selection-changed", { workspace: store.getById(activeWorkspaceId), toBack });
                });
            });

            store.workspaceLayout.on("itemCreated", (item: GoldenLayout.ContentItem) => {
                if (item.isComponent) {
                    item.on("size-changed", () => {
                        this.emitter.raiseEvent("workspace-content-container-resized", { target: item, id: idAsString(item.config.id) });
                        this.emitter.raiseEventWithDynamicName(`workspace-content-container-resized-${item.config.id}`, item);
                    });
                }
            });

            store.workspaceLayout.on("tabCreated", (tab: GoldenLayout.Tab) => {
                const saveButton = document.createElement("div");
                saveButton.classList.add("lm_saveButton");
                saveButton.onclick = (e) => {
                    // e.stopPropagation();
                    this.emitter.raiseEvent("workspace-save-requested", { workspaceId: idAsString(tab.contentItem.config.id) });
                };
                if (!this._options.disableCustomButtons) {
                    tab.element[0].prepend(saveButton);
                    tab.element[0].onclick = (e) => {
                        if (e.composedPath().indexOf(saveButton) !== -1) {
                            (document.activeElement as any).blur();
                        }
                        e.stopPropagation();
                    }
                }

                this.refreshTabSizeClass(tab);
            });

            store.workspaceLayout.on("tabCloseRequested", (tab: GoldenLayout.Tab) => {
                this.emitter.raiseEvent("workspace-tab-close-requested",
                    { workspace: store.getById(tab.contentItem.config.id) });
            });

            store.workspaceLayout.init();
        });
    }

    private setupOuterLayout() {
        this.emitter.onOuterLayoutContainerResized((target) => {
            store.workspaceLayout.updateSize($(target).width(), $(target).height());
        });
    }

    private setupContentLayouts(id: string) {
        this.emitter.onContentContainerResized((item) => {
            const currLayout = store.getById(id).layout;
            if (currLayout) {
                // The size must be passed in order to handle resizes like maximize of the browser
                const containerElement = $(`#nestHere${id}`);
                const bounds = getElementBounds(containerElement[0]);
                currLayout.updateSize(bounds.width, bounds.height);
            }
        }, id);
    }

    private registerWindowComponent(layout: GoldenLayout, placementId: string) {
        this.registerComponent(layout, `app${placementId}`, (container) => {
            const div = document.createElement("div");
            div.setAttribute("style", "height:100%;");
            div.id = `app${placementId}`;

            container.getElement().append(div);
        });
    }

    private registerEmptyWindowComponent(layout: GoldenLayout, workspaceId: string) {
        this.registerComponent(layout, this._emptyVisibleWindowName, (container) => {
            const emptyContainerDiv = document.createElement("div");
            emptyContainerDiv.classList.add("empty-container-background");
            const newButton = document.createElement("button");
            newButton.classList.add("add-button");
            newButton.onclick = (e) => {
                e.stopPropagation();
                const contentItem = container.tab.contentItem;
                const parentType = contentItem.parent.type === "stack" ? "group" : contentItem.parent.type;

                if (contentItem.parent.config.workspacesConfig.wrapper) {
                    this.emitter.raiseEvent("add-button-clicked", {
                        args: {
                            laneId: idAsString(contentItem.parent.parent.config.id),
                            workspaceId,
                            parentType: contentItem.parent.parent.type,
                            bounds: getElementBounds(newButton)
                        }
                    });
                    return;
                }
                this.emitter.raiseEvent("add-button-clicked", {
                    args: {
                        laneId: idAsString(contentItem.parent.config.id),
                        workspaceId,
                        parentType,
                        bounds: getElementBounds(newButton)
                    }
                });
            };

            emptyContainerDiv.append(newButton);

            container.getElement().append(emptyContainerDiv);
        });
    }

    private registerWorkspaceComponent(workspaceId: string) {
        this.registerComponent(store.workspaceLayout, this._configFactory.getWorkspaceLayoutComponentName(workspaceId), (container: GoldenLayout.Container) => {

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
                        laneId: idAsString(contentItem.parent.id),
                        workspaceId,
                        bounds: getElementBounds(newButton)
                    }
                });
            };

            div.appendChild(newButton);
            if (componentStateMonitor.decoratedFactory?.createWorkspaceContents) {
                // template.content.appendChild(div);
                // container.getElement().append(template);
                document.body.append(div);

                div.style.display = "none";
                componentStateMonitor.decoratedFactory?.createWorkspaceContents({
                    workspaceId,
                    domNode: container.getElement()[0]
                });

            } else {
                container.getElement().append(div);
            }
            $(newButton).hide();
        });
    }

    private registerComponent(layout: GoldenLayout,
        name: string,
        callback?: (container: GoldenLayout.Container, componentState: ComponentState) => void) {
        try {
            // tslint:disable-next-line:only-arrow-functions
            layout.registerComponent(name, function (container: GoldenLayout.Container, componentState: ComponentState) {
                if (callback) {
                    callback(container, componentState);
                }
            });
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.log(`Tried to register and already existing component - ${name}`);
        }
    }

    private waitForLayout(id: string) {
        return new Promise<void>((res) => {
            const unsub = this._registry.add(`content-layout-initialised-${id}`, () => {
                res();
                unsub();
            });

            if (store.getById(id)) {
                res();
                unsub();
            }
        });
    }

    private waitForWindowContainer(placementId: string) {
        return new Promise<void>((res) => {
            const unsub = this.emitter.onContentComponentCreated((component) => {
                if (component.config.id === placementId) {
                    res();
                    unsub();
                }
            });

            if (store.getWindowContentItem(placementId)) {
                res();
                unsub();
            }
        });
    }

    private getWindowInfoFromConfig(config: GoldenLayout.ItemConfig): { windowId: string; url: string; appName: string; placementId: string } {
        if (config.type !== "component") {
            return this.getWindowInfoFromConfig(config.content[0]);
        }
        return {
            placementId: idAsString(config.id),
            windowId: config.componentState.windowId,
            appName: config.componentState.appName,
            url: config.componentState.url
        };
    }
    private refreshLayoutSize() {
        const bounds = getElementBounds($(this._workspaceLayoutElementId));
        store.workspaceLayout.updateSize(bounds.width, bounds.height);
    }

    private refreshTabSizeClass(tab: GoldenLayout.Tab) {
        const tabs = tab.header.tabs;
        const haveClassSmall = tabs.map((t) => t.element).some((e) => e.hasClass("lm_tab_small"));
        const haveClassMini = tabs.map((t) => t.element).some((e) => e.hasClass("lm_tab_mini"));

        if (haveClassSmall) {
            tab.element.addClass("lm_tab_small");
        }

        if (haveClassMini) {
            tab.element.addClass("lm_tab_mini");
        }
    }

    private getElementByClass(root: HTMLElement, className: string): HTMLElement {
        const elements = root.getElementsByClassName(className);

        if (elements.length > 1) {
            throw new Error(`Multiple elements with class ${className} in element with id ${root.id} and class ${root.className} are not supported`);
        }

        return elements[0] as HTMLElement;
    }
}
