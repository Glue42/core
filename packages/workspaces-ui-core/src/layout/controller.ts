/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any*/
import GoldenLayout from "@glue42/golden-layout";
import registryFactory from "callback-registry";
const ResizeObserver = require("resize-observer-polyfill").default || require("resize-observer-polyfill");
import { idAsString, getAllWindowsFromConfig, createWaitFor, getElementBounds, getAllItemsFromConfig, getRealHeight } from "../utils";
import { Workspace, Window, FrameLayoutConfig, StartupConfig, ComponentState, LayoutWithMaximizedItem, WorkspaceDropOptions, Bounds } from "../types/internal";
import { LayoutEventEmitter } from "./eventEmitter";
import store from "../state/store";
import { LayoutStateResolver } from "../state/resolver";
import { EmptyVisibleWindowName } from "../utils/constants";
import { TabObserver } from "./tabObserver";
import componentStateMonitor from "../componentStateMonitor";
import { WorkspacesConfigurationFactory } from "../config/factory";
import { WorkspaceContainerWrapper } from "../state/containerWrapper";
import { WorkspaceWrapper } from "../state/workspaceWrapper";
import { WorkspaceWindowWrapper } from "../state/windowWrapper";
import uiExecutor from "../uiExecutor";

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
    private _showLoadingIndicator: boolean;

    constructor(emitter: LayoutEventEmitter,
        stateResolver: LayoutStateResolver,
        options: StartupConfig,
        configFactory: WorkspacesConfigurationFactory
    ) {
        this._options = options;
        this._emitter = emitter;
        this._stateResolver = stateResolver;
        this._configFactory = configFactory;
    }

    public get emitter(): LayoutEventEmitter {
        return this._emitter;
    }

    public get bounds(): Bounds {
        return getElementBounds(document.getElementById("outter-layout-container"));
    }

    public async init(config: FrameLayoutConfig): Promise<void> {
        this._frameId = config.frameId;
        this._showLoadingIndicator = config.showLoadingIndicator;
        const tabObserver = new TabObserver();
        tabObserver.init(this._workspaceLayoutElementId);
        await this.initWorkspaceConfig(config.workspaceLayout);
        this.refreshLayoutSize();
        await Promise.all(config.workspaceConfigs.map(async (c) => {
            await this.initWorkspaceContents(c.id, c.config, false);
            this.emitter.raiseEvent("workspace-added", { workspace: store.getById(c.id) });
        }));

        this.setupOuterLayout();

        store.workspaceIds.forEach((id) => {
            this.setupContentLayouts(id);
        });
    }

    public async addWindow(config: GoldenLayout.ItemConfig, parentId: string): Promise<void> {
        parentId = parentId || idAsString(store.workspaceLayout.root.contentItems[0].getActiveContentItem().config.id);
        const workspace = store.getByContainerId(parentId);

        if (this._stateResolver.isWorkspaceHibernated(workspace.id)) {
            throw new Error(`Could not add window to ${workspace.id} because its hibernated`);
        }

        if (!workspace.layout) {
            this.hideAddButton(workspace.id);
            await this.initWorkspaceContents(workspace.id, config, true);
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

        const workspaceContentItem = store.getWorkspaceContentItem(workspace.id);
        const workspaceWrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        if (config.type === "component") {
            this.applyLockConfig(config, contentItem, workspaceWrapper, parentId === workspace.id);
        } else {
            const allItems = [...getAllItemsFromConfig(config.content), config];
            allItems.forEach((item) => {
                this.applyLockConfig(item, contentItem, workspaceWrapper, parentId === workspace.id);
            });
        }

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

            if (emptyVisibleWindow &&
                emptyVisibleWindow.parent &&
                !emptyVisibleWindow.parent.config.workspacesConfig?.wrapper) {
                // Triggered when the API level parent is an empty group

                const group = this._configFactory.wrapInGroup([config as GoldenLayout.ComponentConfig]);
                group.workspacesConfig.wrapper = false;
                const { wrapper, ...options } = emptyVisibleWindow.parent.config?.workspacesConfig || {};
                group.workspacesConfig = {
                    ...group.workspacesConfig,
                    ...options
                };
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
            await this.initWorkspaceContents(workspace.id, config, true);
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

        if (config.content) {
            const allItems = [...getAllItemsFromConfig(config.content), config];

            const workspaceContentItem = store.getWorkspaceContentItem(workspace.id);
            const workspaceWrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

            allItems.forEach((item: GoldenLayout.ItemConfig) => {
                this.applyLockConfig(item, contentItem, workspaceWrapper, parentId === workspace.id);
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

    public closeContainer(itemId: string): void {
        const workspace = store.getByContainerId(itemId) || store.getByWindowId(itemId);

        if (!workspace) {
            throw new Error(`Could not find container ${itemId} to close in any workspace`);
        }

        const contentItem = workspace.layout.root.getItemsById(itemId)[0];

        contentItem.remove();
    }

    public bundleWorkspace(workspaceId: string, type: "row" | "column"): void {
        const workspace = store.getById(workspaceId);

        const contentConfigs = workspace.layout.root.contentItems.map((ci) => {
            return this._stateResolver.getContainerConfig(ci.config.id);
        });

        const oldChild = workspace.layout.root.contentItems[0];
        const newChild: GoldenLayout.ItemConfig = { type, content: contentConfigs, workspacesConfig: {} };

        workspace.layout.root.replaceChild(oldChild, newChild);
    }

    public hideAddButton(workspaceId: string): void {
        $(`#nestHere${workspaceId}`).children(".add-button").hide();
    }

    public showAddButton(workspaceId: string): void {
        $(`#nestHere${workspaceId}`).children(".add-button").show();
    }

    public async addWorkspace(id: string, config: GoldenLayout.Config): Promise<void> {
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

        await this.initWorkspaceContents(id, config, false);

        const wrapper = new WorkspaceWrapper(this._stateResolver, store.getById(id), store.getWorkspaceContentItem(id), this._frameId);

        if (wrapper.showCloseButton === false) {
            uiExecutor.hideWorkspaceCloseButton(id);
        }

        if (wrapper.showSaveButton === false) {
            uiExecutor.hideWorkspaceSaveButton(id);
        }

        this.setupContentLayouts(id);

        this.emitter.raiseEvent("workspace-added", { workspace: store.getById(id) });
    }

    public reinitializeWorkspace(id: string, config: GoldenLayout.Config): Promise<unknown> {
        store.removeLayout(id);
        if (config.workspacesOptions?.reuseWorkspaceId) {
            // Making sure that the property doesn't leak in a workspace summary or a saved layout
            delete config.workspacesOptions.reuseWorkspaceId;
        }
        return this.initWorkspaceContents(id, config, false);
    }

    public removeWorkspace(workspaceId: string): void {
        const workspaceToBeRemoved = store.getWorkspaceLayoutItemById(workspaceId);

        if (!workspaceToBeRemoved) {
            throw new Error(`Could find workspace to remove with id ${workspaceId}`);
        }
        store.removeById(workspaceId);
        workspaceToBeRemoved.remove();
    }

    public changeTheme(themeName: string): void {
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

    public setDragElementSize(contentWidth: number, contentHeight: number): void {
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

    public setWindowTitle(windowId: string, title: string): void {
        const item = store.getWindowContentItem(windowId);

        if (!item) {
            throw new Error(`Could not find window ${windowId} to change its title to ${title}`);
        }

        item.setTitle(title);
        item.config.componentState.title = title;
    }

    public setWorkspaceTitle(workspaceId: string, title: string): void {
        const item = store.getWorkspaceLayoutItemById(workspaceId);

        item.setTitle(title);
    }

    public focusWindow(windowId: string): void {
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

    public focusWorkspace(workspaceId: string): void {
        const item = store.getWorkspaceLayoutItemById(workspaceId);
        item.parent.setActiveContentItem(item);
    }

    public maximizeWindow(windowId: string): void {
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

    public restoreWindow(windowId: string): void {
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

    public async showLoadedWindow(placementId: string, windowId: string): Promise<void> {
        await this.waitForWindowContainer(placementId);

        const winContainer: GoldenLayout.Component = store.getWindowContentItem(placementId);
        const workspace = store.getByWindowId(placementId);
        const winContainerConfig = winContainer.config;

        winContainerConfig.componentState.windowId = windowId;

        workspace.windows.find((w) => w.id === placementId).windowId = windowId;
        winContainer.parent.replaceChild(winContainer, winContainerConfig);
    }

    public isWindowVisible(placementId: string | string[]): boolean {
        placementId = idAsString(placementId);
        const contentItem = store.getWindowContentItem(placementId);
        const parentStack = contentItem.parent;

        if (parentStack.contentItems.length === 1) {
            return true;
        }
        return parentStack.getActiveContentItem().config.id === placementId;
    }

    public showHibernationIcon(workspaceId: string): void {
        const tab = store.getWorkspaceContentItem(workspaceId)?.tab;

        if (!tab) {
            return;
        }

        const saveButton = tab.element.children(".lm_saveButton");

        saveButton.addClass("lm_hibernationIcon");
        saveButton.attr("title", "hibernated");
    }

    public showSaveIcon(workspaceId: string): void {
        const tab = store.getWorkspaceContentItem(workspaceId)?.tab;

        if (!tab) {
            console.error("Could not find the tab for", workspaceId);
            return;
        }

        const saveButton = tab.element.children(".lm_saveButton");
        saveButton.removeClass("lm_hibernationIcon");

        saveButton.attr("title", "save");
    }

    public hideLoadingIndicator(itemId: string): void {
        const windowContentItem = store.getWindowContentItem(itemId);

        if (windowContentItem) {
            const hibernationIcon = windowContentItem.tab.element[0].getElementsByClassName("lm_hibernationIcon")[0];
            hibernationIcon?.remove();
        }
    }

    public refreshWorkspaceSize(workspaceId: string): void {
        const workspaceContainer = document.getElementById(`nestHere${workspaceId}`);
        const workspace = store.getById(workspaceId);

        if (workspaceContainer && workspace.layout) {
            const bounds = getElementBounds(workspaceContainer);

            workspace.layout.updateSize(bounds.width, bounds.height);
        }
    }

    public enableWorkspaceDrop(workspaceId: string, workspaceDropOptions: WorkspaceDropOptions): void {
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const workspace = store.getById(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.allowDrop = workspaceDropOptions.allowDrop;
        wrapper.allowDropLeft = workspaceDropOptions.allowDropLeft;
        wrapper.allowDropTop = workspaceDropOptions.allowDropTop;
        wrapper.allowDropRight = workspaceDropOptions.allowDropRight;
        wrapper.allowDropBottom = workspaceDropOptions.allowDropBottom;
    }

    public disableWorkspaceDrop(workspaceId: string, workspaceDropOptions: WorkspaceDropOptions): void {
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const workspace = store.getById(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.allowDropLeft = workspaceDropOptions.allowDropLeft;
        wrapper.allowDropTop = workspaceDropOptions.allowDropTop;
        wrapper.allowDropRight = workspaceDropOptions.allowDropRight;
        wrapper.allowDropBottom = workspaceDropOptions.allowDropBottom;
    }

    public enableWorkspaceSaveButton(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showSaveButton = true;
        uiExecutor.showWorkspaceSaveButton(workspaceId);
    }

    public disableWorkspaceSaveButton(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showSaveButton = false;
        uiExecutor.hideWorkspaceSaveButton(workspaceId);
    }

    public enableWorkspaceCloseButton(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showCloseButton = true;
        uiExecutor.showWorkspaceCloseButton(workspaceId);
    }

    public disableWorkspaceCloseButton(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showCloseButton = false;
        uiExecutor.hideWorkspaceCloseButton(workspaceId);
    }

    public enableSplitters(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.allowSplitters = true;
    }

    public disableSplitters(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.allowSplitters = false;
    }

    public enableWorkspaceExtract(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.allowExtract = true;
    }

    public disableWorkspaceExtract(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.allowExtract = false;
    }

    public enableWorkspaceWindowCloseButtons(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showWindowCloseButtons = true;
        uiExecutor.showWindowCloseButtons(workspaceId);
    }

    public disableWorkspaceWindowCloseButtons(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showWindowCloseButtons = false;
        uiExecutor.hideWindowCloseButtons(workspaceId);
    }

    public enableWorkspaceEjectButtons(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showEjectButtons = true;
        uiExecutor.showEjectButtons(workspaceId);
    }

    public disableWorkspaceEjectButtons(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showEjectButtons = false;
        uiExecutor.hideEjectButtons(workspaceId);
    }

    public enableWorkspaceAddWindowButtons(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showAddWindowButtons = true;
        uiExecutor.showAddWindowButtons(workspaceId);
    }

    public disableWorkspaceAddWindowButtons(workspaceId: string): void {
        const workspace = store.getById(workspaceId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
        const wrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);

        wrapper.showAddWindowButtons = false;
        uiExecutor.hideAddWindowButtons(workspaceId);
    }

    public enableWindowExtract(windowId: string, value: boolean | undefined): void {
        const windowContentItem = store.getWindowContentItem(windowId);
        const wrapper = new WorkspaceWindowWrapper(windowContentItem, this._frameId);

        wrapper.allowExtract = value;
    }

    public disableWindowExtract(windowId: string): void {
        const windowContentItem = store.getWindowContentItem(windowId);
        const wrapper = new WorkspaceWindowWrapper(windowContentItem, this._frameId);

        wrapper.allowExtract = false;
    }

    public enableWindowCloseButton(windowId: string, value: boolean | undefined): void {
        const windowContentItem = store.getWindowContentItem(windowId);
        const wrapper = new WorkspaceWindowWrapper(windowContentItem, this._frameId);

        wrapper.showCloseButton = value;

        const workspace = store.getByWindowId(windowId);
        const workspaceContentItem = store.getWorkspaceContentItem(workspace.id);
        const workspaceWrapper = new WorkspaceWrapper(this._stateResolver, workspace, workspaceContentItem, this._frameId);
        if (workspaceWrapper.showCloseButton) {
            uiExecutor.showWindowCloseButton(windowId);
        }
    }

    public disableWindowCloseButton(windowId: string): void {
        const windowContentItem = store.getWindowContentItem(windowId);
        const wrapper = new WorkspaceWindowWrapper(windowContentItem, this._frameId);

        wrapper.showCloseButton = false;

        uiExecutor.hideWindowCloseButton(windowId);
    }

    public enableColumnDrop(itemId: string, allowDrop: boolean): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "column") {
            throw new Error(`Expected item with type column but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.allowDrop = allowDrop;
    }

    public disableColumnDrop(itemId: string): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "column") {
            throw new Error(`Expected item with type column but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.allowDrop = false;
    }

    public enableRowDrop(itemId: string, allowDrop: boolean): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "row") {
            throw new Error(`Expected item with type row but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.allowDrop = allowDrop;
    }

    public disableRowDrop(itemId: string): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "row") {
            throw new Error(`Expected item with type row but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.allowDrop = false;
    }

    public enableGroupDrop(itemId: string, allowDrop: boolean): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.allowDrop = allowDrop;
    }

    public disableGroupDrop(itemId: string): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.allowDrop = false;
    }

    public enableGroupMaximizeButton(itemId: string, showMaximizeButton: boolean): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.showMaximizeButton = showMaximizeButton;
        uiExecutor.showMaximizeButton(itemId);
    }
    public disableGroupMaximizeButton(itemId: string): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.showMaximizeButton = false;
        uiExecutor.hideMaximizeButton(itemId);
    }
    public enableGroupEjectButton(itemId: string, showEjectButton: boolean): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.showEjectButton = showEjectButton;
        uiExecutor.showEjectButton(itemId);
    }
    public disableGroupEjectButton(itemId: string): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.showEjectButton = false;
        uiExecutor.hideEjectButton(itemId);
    }

    public enableGroupAddWindowButton(itemId: string, showAddWindowButton: boolean): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.showAddWindowButton = showAddWindowButton;
        uiExecutor.showAddWindowButton(itemId);
    }

    public disableGroupAddWindowButton(itemId: string): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.showAddWindowButton = false;
        uiExecutor.hideAddWindowButton(itemId);
    }
    public enableGroupExtract(itemId: string, allowExtract: boolean): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.allowExtract = allowExtract;
    }
    public disableGroupExtract(itemId: string): void {
        const containerContenteItem = store.getContainer(itemId);

        if (containerContenteItem.type !== "stack") {
            throw new Error(`Expected item with type stack but received ${containerContenteItem.type} ${itemId}`);
        }

        const wrapper = new WorkspaceContainerWrapper(containerContenteItem, this._frameId);
        wrapper.allowExtract = false;
    }

    public resizeRow(rowItem: GoldenLayout.Row, height?: number): void {
        const component = rowItem.getItemsByType("component")[0] as GoldenLayout.Component;
        let heightToResize = this.validateRowHeight(rowItem, height);

        if (!heightToResize) {
            return;
        }

        if (typeof height === "number") {
            const stackHeaderSize = getRealHeight(component.parent.header.element);

            heightToResize -= stackHeaderSize;
        }

        this.resizeComponentCore(component, undefined, heightToResize);
    }

    public resizeColumn(columnItem: GoldenLayout.Column, width?: number): void {
        const component = columnItem.getItemsByType("component")[0] as GoldenLayout.Component;
        const widthToResize = this.validateColumnWidth(columnItem, width);

        if (!widthToResize) {
            return;
        }

        this.resizeComponentCore(component, widthToResize);
    }

    public resizeStack(stackItem: GoldenLayout.Stack, width?: number, height?: number): void {
        const widthToResize = this.validateStackWidth(stackItem, width);
        let heightToResize = this.validateStackHeight(stackItem, height);
        const component = stackItem.getItemsByType("component")[0] as GoldenLayout.Component;

        if (typeof heightToResize === "number") {
            const stackHeaderSize = getRealHeight(component.parent.header.element);

            heightToResize -= stackHeaderSize;
        }

        this.resizeComponentCore(component, widthToResize, heightToResize);
    }

    public resizeComponent(componentItem: GoldenLayout.Component, width?: number, height?: number): void {

        this.resizeComponentCore(componentItem, width, height);
    }

    private resizeComponentCore(componentItem: GoldenLayout.Component, width?: number, height?: number): void {
        const widthToResize = this.validateComponentWidth(componentItem, width);
        const heightToResize = this.validateComponentHeight(componentItem, height);

        if (typeof widthToResize === "number") {
            // Resizing twice to increase accuracy
            const result = (componentItem as any).container.setSize(widthToResize, undefined);
            (componentItem as any).container.setSize(widthToResize, undefined);

            if (!result) {
                throw new Error(`Failed to resize window ${componentItem.config.id} to ${widthToResize} width.
                 This is most likely caused by a missing row parent element - to change the width please make sure that there is a row element`);
            }
        }

        if (typeof heightToResize === "number") {
            // Resizing twice to increase accuracy
            const result = (componentItem as any).container.setSize(undefined, heightToResize);
            (componentItem as any).container.setSize(undefined, heightToResize);

            if (!result) {
                throw new Error(`Failed to resize component ${componentItem.config.id} to ${heightToResize} height.
                     This is most likely caused by a missing column parent element - to change the height please make sure that there is a column element`);
            }
        }
    }

    private validateRowHeight(item: GoldenLayout.ContentItem, height: number): number | undefined {
        if (!height) {
            return;
        }
        const parent = item.parent;
        const parentMaxHeight = parent.getMaxHeight();
        const itemMaxHeight = item.getMaxHeight();
        const itemMinHeight = item.getMinHeight();
        const parentHeight = getElementBounds(parent.element).height;

        const neighboursMinHeights = parent.contentItems.filter((ci) => ci !== item).reduce((acc, ci) => {
            acc += ci.getMinHeight();
            return acc;
        }, 0);

        const maxHeightConstraintFromNeighbours = parentHeight - neighboursMinHeights;
        if (maxHeightConstraintFromNeighbours <= 0) {
            return;
        }

        const neighoursMaxHeights = parent.contentItems.filter((ci) => ci !== item).reduce((acc, ci) => {
            acc += ci.getMaxHeight();
            return acc;
        }, 0);

        const minHeightConstraintFromNeighbours = Math.max(parentHeight - neighoursMaxHeights, 0);

        const smallestMaxConstraint = Math.min(parentMaxHeight, itemMaxHeight, maxHeightConstraintFromNeighbours);
        const biggestMinConstraint = Math.max(minHeightConstraintFromNeighbours, itemMinHeight);

        if (smallestMaxConstraint < biggestMinConstraint) {
            return;
        }

        return Math.min(Math.max(biggestMinConstraint, height), smallestMaxConstraint);
    }

    private validateColumnWidth(item: GoldenLayout.ContentItem, width: number): number | undefined {
        if (!width) {
            return;
        }
        const parent = item.parent;
        const parentMaxWidth = parent.getMaxWidth();
        const itemMaxWidth = item.getMaxWidth();
        const itemMinWidth = item.getMinWidth();
        const parentWidth = getElementBounds(parent.element).width;

        const neighboursMinWidths = parent.contentItems.filter((ci) => ci !== item).reduce((acc, ci) => {
            acc += ci.getMinWidth();
            return acc;
        }, 0);

        const maxWidthConstraintFromNeighbours = parentWidth - neighboursMinWidths;
        if (maxWidthConstraintFromNeighbours <= 0) {
            return;
        }

        const neighoursMaxWidths = parent.contentItems.filter((ci) => ci !== item).reduce((acc, ci) => {
            acc += ci.getMaxWidth();
            return acc;
        }, 0);

        const minWidthConstraintFromNeighbours = Math.max(parentWidth - neighoursMaxWidths, 0);

        const smallestMaxConstraint = Math.min(parentMaxWidth, itemMaxWidth, maxWidthConstraintFromNeighbours);
        const biggestMinConstraint = Math.max(minWidthConstraintFromNeighbours, itemMinWidth);

        if (smallestMaxConstraint < biggestMinConstraint) {
            return;
        }

        return Math.min(Math.max(biggestMinConstraint, width), smallestMaxConstraint);
    }

    private validateStackHeight(item: GoldenLayout.ContentItem, height: number): number | undefined {
        if (!height) {
            return;
        }
        const itemMaxHeight = item.getMaxHeight();
        const itemMinHeight = item.getMinHeight();

        const smallestMaxConstraint = itemMaxHeight;
        const biggestMinConstraint = itemMinHeight;

        if (smallestMaxConstraint < biggestMinConstraint) {
            return;
        }

        return Math.min(Math.max(biggestMinConstraint, height), smallestMaxConstraint);
    }

    private validateStackWidth(item: GoldenLayout.ContentItem, width: number): number | undefined {
        if (!width) {
            return;
        }
        const itemMaxWidth = item.getMaxWidth();
        const itemMinWidth = item.getMinWidth();

        const smallestMaxConstraint = itemMaxWidth;
        const biggestMinConstraint = itemMinWidth;

        if (smallestMaxConstraint < biggestMinConstraint) {
            return;
        }

        return Math.min(Math.max(biggestMinConstraint, width), smallestMaxConstraint);
    }

    private validateComponentHeight(item: GoldenLayout.ContentItem, height: number): number | undefined {
        if (!height) {
            return;
        }
        const itemMaxHeight = item.getMaxHeight();
        const itemMinHeight = item.getMinHeight();

        const smallestMaxConstraint = itemMaxHeight;
        const biggestMinConstraint = itemMinHeight;

        if (smallestMaxConstraint < biggestMinConstraint) {
            return;
        }

        return Math.min(Math.max(biggestMinConstraint, height), smallestMaxConstraint);
    }

    private validateComponentWidth(item: GoldenLayout.ContentItem, width: number): number | undefined {
        if (!width) {
            return;
        }
        const itemMaxWidth = item.getMaxWidth();
        const itemMinWidth = item.getMinWidth();

        const smallestMaxConstraint = itemMaxWidth;
        const biggestMinConstraint = itemMinWidth;

        if (smallestMaxConstraint < biggestMinConstraint) {
            return;
        }

        return Math.min(Math.max(biggestMinConstraint, width), smallestMaxConstraint);
    }

    private initWorkspaceContents(id: string, config: GoldenLayout.Config | GoldenLayout.ItemConfig, useWorkspaceSpecificConfig: boolean): Promise<unknown> {
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

        const workspaceContentItem = store.getWorkspaceContentItem(id);

        // TODO fix typings
        const optionsFromItem = (workspaceContentItem.config as any).workspacesConfig;
        const optionsFromConfig = (config as GoldenLayout.Config).workspacesOptions;

        const mergedOptions = useWorkspaceSpecificConfig ? Object.assign({}, optionsFromItem, optionsFromConfig) : optionsFromConfig;

        workspaceContentItem.config.workspacesConfig = mergedOptions;
        (config as GoldenLayout.Config).workspacesOptions = mergedOptions;

        const layout = new GoldenLayout(config as GoldenLayout.Config, $(`#nestHere${id}`));
        store.addOrUpdate(id, []);

        this.registerEmptyWindowComponent(layout, id);

        getAllWindowsFromConfig((config as GoldenLayout.Config).content).forEach((element: GoldenLayout.ComponentConfig) => {
            this.registerWindowComponent(layout, idAsString(element.id));
        });

        const layoutContainer = $(`#nestHere${id}`);

        const resizeObserver = new ResizeObserver(() => {
            this.emitter.raiseEvent("workspace-container-resized", { workspaceId: id });
        });

        resizeObserver.observe(layoutContainer[0]);

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
            const wrapper = new WorkspaceContainerWrapper(stack, this._frameId);
            const button = document.createElement("li");
            button.classList.add("lm_add_button");

            button.onclick = (e): void => {
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

            if (wrapper.showMaximizeButton === false) {
                uiExecutor.hideMaximizeButton(stack);
            }

            const ejectButton = (stack as any)
                .element
                .children(".lm_header")
                .children(".lm_controls")
                .children(".lm_popout")[0];

            if ((layout.config.workspacesOptions as any).showEjectButtons === false && wrapper.showEjectButton !== true) {
                uiExecutor.hideAddWindowButton(stack);
            }

            if (wrapper.showEjectButton === false) {
                uiExecutor.hideEjectButton(stack);
            }

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

            if ((layout.config.workspacesOptions as any).showAddWindowButtons === false && wrapper.showAddWindowButton !== true) {
                uiExecutor.hideAddWindowButton(stack);
            }

            if (wrapper.showAddWindowButton === false) {
                uiExecutor.hideAddWindowButton(stack);
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

            tab.element.on("mousedown", () => {
                this.emitter.raiseEvent("tab-element-mouse-down", { tab });
            });

            this.refreshTabSizeClass(tab);

            if (this._showLoadingIndicator && tab?.contentItem.type === "component" && !this._stateResolver.isWindowLoaded(tab.contentItem.config.id)) {
                const hibernationIcon = document.createElement("div");
                hibernationIcon.classList.add("lm_saveButton", "lm_hibernationIcon");
                tab.element[0].prepend(hibernationIcon);
            }

            if (!tab.contentItem.isComponent) {
                return;
            }

            const wrapper = new WorkspaceWindowWrapper(tab.contentItem, this._frameId);

            if ((layout.config.workspacesOptions as any).showWindowCloseButtons === false && wrapper.showCloseButton !== true) {
                uiExecutor.hideWindowCloseButton(tab.contentItem);
            }

            if (wrapper.showCloseButton === false) {
                uiExecutor.hideWindowCloseButton(tab.contentItem);
            }
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

        layout.on("activeContentItemChanged", (component: GoldenLayout.Component) => {
            this.emitter.raiseEvent("workspace-global-selection-changed", { component, workspaceId: id });
        });

        layout._ignorePinned = true;
        layout.init();
        return waitFor.promise.then(() => {
            layout._ignorePinned = false;
        });
    }

    private initWorkspaceConfig(workspaceConfig: GoldenLayout.Config): Promise<void> {
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
                    closeButton.onclick = (): void => {
                        this.emitter.raiseEvent("close-frame", {});
                    };
                }

                const headerElement: HTMLElement = stack.header.element[0];
                const mutationObserver = new MutationObserver(() => {
                    const addButton = this.getElementByClass(headerElement, "lm_add_button");

                    if (addButton && componentStateMonitor.decoratedFactory.createAddWorkspace) {
                        addButton.onclick = (e: MouseEvent): void => {
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

                    button.onclick = (e): void => {
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
                saveButton.onclick = (e): void => {
                    // e.stopPropagation();
                    this.emitter.raiseEvent("workspace-save-requested", { workspaceId: idAsString(tab.contentItem.config.id) });
                };
                if (!this._options.disableCustomButtons) {
                    tab.element[0].prepend(saveButton);
                    tab.element[0].onclick = (e): void => {
                        if (e.composedPath().indexOf(saveButton) !== -1) {
                            (document.activeElement as any).blur();
                        }
                        e.stopPropagation();
                    };
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

    private setupOuterLayout(): void {
        this.emitter.onOuterLayoutContainerResized((target) => {
            store.workspaceLayout.updateSize($(target).width(), $(target).height());
        });
    }

    private setupContentLayouts(id: string): void {
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

    private registerWindowComponent(layout: GoldenLayout, placementId: string): void {
        this.registerComponent(layout, `app${placementId}`, (container) => {
            const div = document.createElement("div");
            div.setAttribute("style", "height:100%;");
            div.id = `app${placementId}`;

            container.getElement().append(div);
        });
    }

    private registerEmptyWindowComponent(layout: GoldenLayout, workspaceId: string): void {
        this.registerComponent(layout, this._emptyVisibleWindowName, (container) => {
            const emptyContainerDiv = document.createElement("div");
            emptyContainerDiv.classList.add("empty-container-background");
            const newButton = document.createElement("button");
            newButton.classList.add("add-button");
            newButton.onclick = (e): void => {
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

    private registerWorkspaceComponent(workspaceId: string): void {
        this.registerComponent(store.workspaceLayout, this._configFactory.getWorkspaceLayoutComponentName(workspaceId), (container: GoldenLayout.Container) => {

            const div = document.createElement("div");
            div.setAttribute("style", "height:calc(100% - 1px); width:calc(100% - 1px);");
            div.id = `nestHere${workspaceId}`;
            const newButton = document.createElement("button");
            newButton.classList.add("add-button");
            newButton.onclick = (e): void => {
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
        callback?: (container: GoldenLayout.Container, componentState: ComponentState) => void): void {
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

    private waitForLayout(id: string): Promise<void> {
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

    private waitForWindowContainer(placementId: string): Promise<void> {
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
    private refreshLayoutSize(): void {
        const bounds = getElementBounds($(this._workspaceLayoutElementId));
        store.workspaceLayout.updateSize(bounds.width, bounds.height);
    }

    private refreshTabSizeClass(tab: GoldenLayout.Tab): void {
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

    private applyLockConfig(itemConfig: GoldenLayout.ItemConfig, parent: GoldenLayout.ContentItem, workspaceWrapper: WorkspaceWrapper, isParentWorkspace: boolean): void {
        const parentAllowDrop = isParentWorkspace ? workspaceWrapper.allowDrop : (parent.config.workspacesConfig as any).allowDrop;
        if (itemConfig.type === "stack") {
            if (typeof (itemConfig.workspacesConfig as any).allowDrop === "undefined") {
                (itemConfig.workspacesConfig as any).allowDrop = (itemConfig.workspacesConfig as any).allowDrop ?? parentAllowDrop;
            }

            if (typeof (itemConfig.workspacesConfig as any).allowExtract === "undefined") {
                const parentAllowExtract = workspaceWrapper.allowExtract;
                (itemConfig.workspacesConfig as any).allowExtract = (itemConfig.workspacesConfig as any).allowExtract ?? parentAllowExtract;
            }

            if (typeof (itemConfig.workspacesConfig as any).showAddWindowButton === "undefined") {
                (itemConfig.workspacesConfig as any).showAddWindowButton = workspaceWrapper.showAddWindowButtons;
            }

            if (typeof (itemConfig.workspacesConfig as any).showEjectButton === "undefined") {
                (itemConfig.workspacesConfig as any).showEjectButton = workspaceWrapper.showEjectButtons;
            }
        } else if (itemConfig.type === "row" || itemConfig.type === "column") {
            if (typeof (itemConfig.workspacesConfig as any).allowDrop === "undefined") {
                (itemConfig.workspacesConfig as any).allowDrop = (itemConfig.workspacesConfig as any).allowDrop ?? parentAllowDrop;
            }
        } else if (itemConfig.type === "component") {
            if (typeof (itemConfig.workspacesConfig as any).allowExtract === "undefined") {
                const parentAllowExtract = isParentWorkspace ? workspaceWrapper.allowExtract : (parent.config.workspacesConfig as any).allowExtract;
                (itemConfig.workspacesConfig as any).allowExtract = parentAllowExtract;
            }
            if (typeof (itemConfig.workspacesConfig as any).showCloseButton === "undefined") {
                (itemConfig.workspacesConfig as any).allowExtract = workspaceWrapper.showWindowCloseButtons;
            }
        }
    }
}
