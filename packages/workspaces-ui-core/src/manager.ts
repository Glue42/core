import { LayoutController } from "./layout/controller";
import { WindowSummary, Workspace, WorkspaceOptionsWithTitle, WorkspaceOptionsWithLayoutName, Window as WorkspacesWindow, ComponentFactory } from "./types/internal";
import { LayoutEventEmitter } from "./layout/eventEmitter";
import { IFrameController } from "./iframeController";
import store from "./store";
import registryFactory from "callback-registry";
import GoldenLayout from "@glue42/golden-layout";
import { LayoutsManager } from "./layouts";
import { LayoutStateResolver } from "./layout/stateResolver";
import scReader from "./config/startupReader";
import { idAsString, getAllWindowsFromConfig, getElementBounds, getWorkspaceContextName } from "./utils";
import { WorkspacesConfigurationFactory } from "./config/factory";
import { WorkspacesEventEmitter } from "./eventEmitter";
import { Glue42Web } from "@glue42/web";
import { RestoreWorkspaceConfig } from "./interop/types";
import { EmptyVisibleWindowName, PlatformControlMethod } from "./constants";
import { TitleGenerator } from "./config/titleGenerator";
import startupReader from "./config/startupReader";
import componentStateMonitor from "./componentStateMonitor";
import { ConfigConverter } from "./config/converter";
import { PopupManagerComposer } from "./popups/composer";
import { PopupManager } from "./popups/external";
import { ComponentPopupManager } from "./popups/component";
import { generate } from "shortid";
import { GlueFacade } from "./interop/facade";

class WorkspacesManager {
    private _controller: LayoutController;
    private _frameController: IFrameController;
    private _frameId: string;
    private _popupManager: PopupManagerComposer
    private _layoutsManager: LayoutsManager;
    private _stateResolver: LayoutStateResolver;
    private _isLayoutInitialized = false;
    private _initPromise = Promise.resolve();
    private _workspacesEventEmitter = new WorkspacesEventEmitter();
    private _titleGenerator = new TitleGenerator();
    private _initialized: boolean;
    private _glue: Glue42Web.API;
    private _configFactory: WorkspacesConfigurationFactory;
    private _facade: GlueFacade;
    private _isDisposing: boolean;

    public get stateResolver() {
        return this._stateResolver;
    }

    public get workspacesEventEmitter() {
        return this._workspacesEventEmitter;
    }

    public get initPromise() {
        return this._initPromise;
    }

    public get initialized() {
        return this._initialized;
    }

    public get frameId() {
        return this._frameId;
    }

    public init(glue: Glue42Web.API, frameId: string, facade: GlueFacade, componentFactory?: ComponentFactory): { cleanUp: () => void } {
        this._glue = glue;
        this._facade = facade;
        const startupConfig = scReader.loadConfig();

        if (this._initialized) {
            componentStateMonitor.reInitialize(componentFactory);
            return;
        }

        this._initialized = true;
        this._frameId = frameId;
        this._configFactory = new WorkspacesConfigurationFactory(glue);
        const converter = new ConfigConverter(this._configFactory);
        componentStateMonitor.init(this._frameId, componentFactory);
        const eventEmitter = new LayoutEventEmitter(registryFactory());
        this._stateResolver = new LayoutStateResolver(this._frameId, eventEmitter);
        this._controller = new LayoutController(eventEmitter, this._stateResolver, startupConfig, this._configFactory);
        this._frameController = new IFrameController(glue);
        this._layoutsManager = new LayoutsManager(this.stateResolver, glue, this._configFactory, converter);
        this._popupManager = new PopupManagerComposer(new PopupManager(glue), new ComponentPopupManager(componentFactory, frameId), componentFactory);

        if (!startupConfig.emptyFrame) {
            this.initLayout();
        }

        return { cleanUp: this.cleanUp };
    }

    public getComponentBounds = () => {
        return this._controller.bounds;
    }

    public subscribeForWindowClicked = (cb: () => void) => {
        return this._frameController.onFrameContentClicked(cb);
    }

    public async saveWorkspace(name: string, id?: string, saveContext?: boolean) {
        const workspace = store.getById(id) || store.getActiveWorkspace();
        const result = await this._layoutsManager.save({
            name,
            workspace,
            title: store.getWorkspaceTitle(workspace.id),
            saveContext
        });

        (workspace.layout.config.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName = name;
        if (workspace.layout.config.workspacesOptions.noTabHeader) {
            delete workspace.layout.config.workspacesOptions.noTabHeader;
        }

        return result;
    }

    public async openWorkspace(name: string, options?: RestoreWorkspaceConfig): Promise<string> {
        const savedConfigWithData = await this._layoutsManager.getWorkspaceByName(name);
        const savedConfig = savedConfigWithData.config;

        savedConfig.workspacesOptions.context = savedConfigWithData.layoutData.context;

        if (options?.context && savedConfig.workspacesOptions.context) {
            savedConfig.workspacesOptions.context = Object.assign(savedConfigWithData.layoutData.context, options?.context);
        } else if (options?.context) {
            savedConfig.workspacesOptions.context = options?.context;
        }

        if (options?.title) {
            (savedConfig.workspacesOptions as WorkspaceOptionsWithTitle).title = options?.title;
        }

        if (savedConfig && savedConfig.workspacesOptions && !savedConfig.workspacesOptions.name) {
            savedConfig.workspacesOptions.name = name;
        }

        if (savedConfig) {
            savedConfig.workspacesOptions = savedConfig.workspacesOptions || {};

            (savedConfig.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName = savedConfigWithData.layoutData.name;
        }

        if (savedConfig && options?.noTabHeader !== undefined) {
            savedConfig.workspacesOptions = savedConfig.workspacesOptions || {};
            savedConfig.workspacesOptions.noTabHeader = options?.noTabHeader;
        }

        if (!this._isLayoutInitialized) {
            this._layoutsManager.setInitialWorkspaceConfig(savedConfig);

            this._initPromise = this.initLayout();

            await this._initPromise;

            return idAsString(savedConfig.id);
        } else if (name) {
            savedConfig.id = options?.reuseWorkspaceId || this._configFactory.getId();

            if (options?.reuseWorkspaceId) {
                const workspace = store.getById(savedConfig.id);

                workspace.windows.map((w) => store.getWindowContentItem(w.id))
                    .filter((w) => w)
                    .map((w) => this.closeTab(w, false));
                await this._controller.reinitializeWorkspace(savedConfig.id, savedConfig);
                if (savedConfig.workspacesOptions?.context) {
                    await this._glue.contexts.set(getWorkspaceContextName(savedConfig.id), savedConfig.workspacesOptions.context);
                }
            } else {
                await this.addWorkspace(idAsString(savedConfig.id), savedConfig);
            }

            return idAsString(savedConfig.id);
        }
    }

    public exportAllLayouts() {
        return this._layoutsManager.export();
    }

    public deleteLayout(name: string) {
        this._layoutsManager.delete(name);
    }

    public maximizeItem(itemId: string) {
        this._controller.maximizeWindow(itemId);
    }

    public restoreItem(itemId: string) {
        this._controller.restoreWindow(itemId);
    }

    public closeItem(itemId: string) {
        const win = store.getWindow(itemId);
        const container = store.getContainer(itemId);
        if (this._frameId === itemId) {
            store.workspaceIds.forEach((wid) => this.closeWorkspace(store.getById(wid)));
        } else if (win) {
            const windowContentItem = store.getWindowContentItem(itemId);
            this.closeTab(windowContentItem);
        } else if (container) {
            this._controller.closeContainer(itemId);
        } else {
            const workspace = store.getById(itemId);
            this.closeWorkspace(workspace);
        }
    }

    public addContainer(config: GoldenLayout.RowConfig | GoldenLayout.StackConfig | GoldenLayout.ColumnConfig, parentId: string) {
        return this._controller.addContainer(config, parentId);
    }

    public addWindow(itemConfig: GoldenLayout.ItemConfig, parentId: string) {
        const parent = store.getContainer(parentId);
        if ((!parent || parent.type !== "stack") && itemConfig.type === "component") {
            itemConfig = this._configFactory.wrapInGroup([itemConfig]);
        }
        return this._controller.addWindow(itemConfig, parentId);
    }

    public setItemTitle(itemId: string, title: string) {
        if (store.getById(itemId)) {
            this._controller.setWorkspaceTitle(itemId, title);
        } else {
            this._controller.setWindowTitle(itemId, title);
        }
    }

    public async eject(item: GoldenLayout.Component): Promise<{ windowId: string }> {
        const { appName, url, windowId } = item.config.componentState;
        const workspaceContext = store.getWorkspaceContext(store.getByWindowId(item.config.id).id);
        const webWindow = this._glue.windows.findById(windowId);
        const context = webWindow ? await webWindow.getContext() : workspaceContext;
        this.closeItem(idAsString(item.config.id));

        // If an appName is available it should be used instead of just opening the window with glue.windows.open
        // in order to be as close as possible to a real eject
        if (appName) {
            const options = (windowId ? { reuseId: windowId } : undefined) as any; // making sure that the invokation is robust and can't fail easily due to corrupted state
            const ejectedInstance = await this._glue.appManager.application(appName).start(context, options);

            return { windowId: ejectedInstance.id };
        }

        const ejectedWindowUrl = this.getUrlByAppName(appName) || url;
        const ejectedWindow = await this._glue.windows.open(`${appName}_${windowId}`, ejectedWindowUrl, { context, windowId } as Glue42Web.Windows.Settings);

        return { windowId: ejectedWindow.id };
    }

    public async createWorkspace(config: GoldenLayout.Config) {
        if (!this._isLayoutInitialized) {
            config.id = this._configFactory.getId();
            this._layoutsManager.setInitialWorkspaceConfig(config);

            this._initPromise = this.initLayout();

            await this._initPromise;

            return idAsString(config.id);
        }

        const id = config.workspacesOptions?.reuseWorkspaceId || this._configFactory.getId();

        if (config.workspacesOptions?.reuseWorkspaceId) {
            const workspace = store.getById(id);

            workspace.windows.map((w) => store.getWindowContentItem(w.id))
                .filter((w) => w)
                .map((w) => this.closeTab(w, false));
            await this._controller.reinitializeWorkspace(id, config);
            if (config.workspacesOptions.context) {
                await this._glue.contexts.set(getWorkspaceContextName(id), config.workspacesOptions.context);
            }
        } else {
            await this.addWorkspace(id, config);
        }

        return id;
    }

    public async loadWindow(itemId: string) {
        let contentItem = store.getWindowContentItem(itemId);
        let { windowId } = contentItem.config.componentState;
        if (!windowId) {
            await this.waitForFrameLoaded(itemId);
            contentItem = store.getWindowContentItem(itemId);
            windowId = contentItem.config.componentState.windowId;
        }
        return new Promise<{ windowId: string }>((res, rej) => {
            if (!windowId) {
                rej(`The window id of ${itemId} is missing`);
            }

            let unsub = () => {
                // safety
            };
            const timeout = setTimeout(() => {
                rej(`Could not load window ${windowId} for 5000ms`);
                unsub();
            }, 5000);

            unsub = this._glue.windows.onWindowAdded((w) => {
                if (w.id === windowId) {
                    res({ windowId });
                    unsub();
                    clearTimeout(timeout);
                }
            });
            const win = this._glue.windows.list().find((w) => w.id === windowId);

            if (win) {
                res({ windowId });
                unsub();
                clearTimeout(timeout);
            }
        });
    }

    public async focusItem(itemId: string) {
        const workspace = store.getById(itemId);

        if (this._frameId === itemId) {
            await this._glue.windows.my().focus();
        } else if (workspace) {
            this._controller.focusWorkspace(workspace.id);
        } else {
            this._controller.focusWindow(itemId);
        }
    }

    public bundleWorkspace(workspaceId: string, type: "row" | "column") {
        this._controller.bundleWorkspace(workspaceId, type);
    }

    public move(location: { x: number; y: number }) {
        return this._glue.windows.my().moveTo(location.y, location.x);
    }

    public getFrameSummary(itemId: string) {
        const workspace = store.getByContainerId(itemId) || store.getByWindowId(itemId) || store.getById(itemId);
        const isFrameId = this._frameId === itemId;
        return {
            id: (workspace || isFrameId) ? this._frameId : "none"
        };
    }

    public async moveWindowTo(itemId: string, containerId: string) {
        const targetWorkspace = store.getByContainerId(containerId) || store.getById(containerId);
        if (!targetWorkspace) {
            throw new Error(`Could not find container ${containerId} in frame ${this._frameId}`);
        }

        const targetWindow = store.getWindowContentItem(itemId);
        if (!targetWindow) {
            throw new Error(`Could not find window ${itemId} in frame ${this._frameId}`);
        }
        this.closeTab(targetWindow);
        return this._controller.addWindow(targetWindow.config, containerId);
    }

    public generateWorkspaceLayout(name: string, itemId: string) {
        const workspace = store.getById(itemId);
        if (!workspace) {
            throw new Error(`Could not find workspace with id ${itemId}`);
        }

        return this._layoutsManager.generateLayout(name, workspace);
    }

    public unmount() {
        try {
            this._popupManager.hidePopup();
        } catch (error) {
            // tslint:disable-next-line: no-console
            console.warn(error);
        }
    }

    private async initLayout() {
        const config = await this._layoutsManager.getInitialConfig();
        this.subscribeForPopups();
        this.subscribeForLayout();

        this._isLayoutInitialized = true;

        await Promise.all(config.workspaceConfigs.map(c => {
            return this._glue.contexts.set(getWorkspaceContextName(c.id), c.config?.workspacesOptions?.context || {});
        }));

        await this._controller.init({
            frameId: this._frameId,
            workspaceLayout: config.workspaceLayout,
            workspaceConfigs: config.workspaceConfigs,
        });

        store.layouts.map((l) => l.layout).filter((l) => l).forEach((l) => this.reportLayoutStructure(l));

        if (startupReader.config.emptyFrame) {

            this._workspacesEventEmitter.raiseFrameEvent({
                action: "opened", payload: {
                    frameSummary: {
                        id: this._frameId
                    }
                }
            });
        }

    }

    private subscribeForLayout() {
        this._controller.emitter.onContentComponentCreated(async (component, workspaceId) => {
            if (component.config.componentName === EmptyVisibleWindowName) {
                return;
            }
            const workspace = store.getById(workspaceId);
            const newWindowBounds = getElementBounds(component.element);
            const { componentState } = component.config;
            const { title, appName } = componentState;
            let { windowId } = componentState;
            const componentId = idAsString(component.config.id);
            const applicationTitle = this.getTitleByAppName(appName);
            const windowTitle = this.vaidateTitle(title) || this.vaidateTitle(applicationTitle) || this.vaidateTitle(appName) || "Glue";
            const windowContext = component?.config.componentState?.context;
            let url = this.getUrlByAppName(componentState.appName) || componentState.url;

            const isNewWindow = !store.getWindow(componentId);

            store.addWindow({
                id: componentId,
                bounds: newWindowBounds,
                windowId,
                url,
                appName
            }, workspace.id);

            if (!url && windowId) {
                const win = this._glue.windows.list().find((w) => w.id === windowId);

                url = await win.getURL();
                const newlyAddedWindow = store.getWindow(componentId) as WorkspacesWindow;

                newlyAddedWindow.url = url;
            }

            windowId = windowId || generate();

            if (component.config.componentState?.context) {
                delete component.config.componentState.context;
            }

            component.config.componentState.url = url;
            if (windowTitle) {
                component.setTitle(windowTitle);
            }
            if (isNewWindow) {
                const windowSummary = this.stateResolver.getWindowSummarySync(componentId, component);
                this.workspacesEventEmitter.raiseWindowEvent({
                    action: "added",
                    payload: {
                        windowSummary
                    }
                });

                const glueWinOutsideOfWorkspace = this._glue.windows.findById(windowId);
                if (glueWinOutsideOfWorkspace) {
                    try {
                        // Glue windows with the given id should be closed
                        await glueWinOutsideOfWorkspace.close();
                    } catch (error) {
                        // because of chrome security policy this call can fail,
                        // however the opening of a new window should continue
                    }
                }
            }

            try {
                await this.notifyFrameWillStart(windowId, appName, windowContext, windowTitle);
                await this._frameController.startFrame(componentId, url, undefined, windowId);
                const newlyAddedWindow = store.getWindow(componentId) as WorkspacesWindow;

                component.config.componentState.windowId = windowId;
                newlyAddedWindow.windowId = windowId;

                const newlyOpenedWindow = this._glue.windows.findById(windowId);
                newlyOpenedWindow.getTitle().then((winTitle) => {
                    if (this.vaidateTitle(windowTitle)) {
                        component.setTitle(winTitle);
                    }
                }).catch((e) => {
                    console.warn("Failed while setting the window title", e);
                });

                this._frameController.moveFrame(componentId, getElementBounds(component.element));

                if (isNewWindow) {
                    this._workspacesEventEmitter.raiseWindowEvent({
                        action: "loaded",
                        payload: {
                            windowSummary: await this.stateResolver.getWindowSummary(componentId)
                        }
                    });
                }

                if (!appName) {
                    const appNameToUse = this.getAppNameByWindowId(windowId);
                    if (!component.config.componentState) {
                        throw new Error(`Invalid state - the created component ${componentId} with windowId ${windowId} is missing its state object`);
                    }
                    component.config.componentState.appName = appNameToUse;


                    newlyAddedWindow.appName = appNameToUse;
                }

            } catch (error) {
                // If a frame doesn't initialize properly remove its windowId
                component.config.componentState.windowId = undefined;
                if (url) {
                    this._frameController.moveFrame(componentId, getElementBounds(component.element));
                } else {
                    this.closeTab(component, false);
                }
                const wsp = store.getById(workspaceId);
                if (!wsp) {
                    throw new Error(`Workspace ${workspaceId} failed ot initialize because none of the specified windows were able to load
                    Internal error: ${error}`);
                }
            }

        });

        this._controller.emitter.onContentItemResized((target, id) => {
            this._frameController.moveFrame(id, getElementBounds(target));
        });

        this._controller.emitter.onTabCloseRequested(async (item) => {
            const workspace = store.getByWindowId(idAsString(item.config.id));
            // const windowSummary = await this.stateResolver.getWindowSummary(item.config.id);
            this.closeTab(item);

            this._controller.removeLayoutElement(idAsString(item.config.id));
            this._frameController.remove(idAsString(item.config.id));
            if (!workspace.windows.length) {
                this.checkForEmptyWorkspace(workspace);
            }
        });

        this._controller.emitter.onWorkspaceTabCloseRequested((workspace) => {
            this.closeWorkspace(workspace);
        });

        this._controller.emitter.onTabElementMouseDown((tab) => {
            const tabContentSize = getElementBounds(tab.contentItem.element);
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

                        const proxyContentBounds = getElementBounds(proxyContent[0]);
                        const id = idAsString(tab.contentItem.config.id);
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
            this._frameController.selectionChanged([idAsString(tab.contentItem.id)],
                toBack.map((t) => idAsString(t.contentItem.id)));
        });

        this._controller.emitter.onSelectionChanged(async (toBack, toFront) => {
            this._popupManager.hidePopup();
            this._frameController.selectionChanged(toFront.map((tf) => tf.id), toBack.map((t) => t.id));
        });

        this._controller.emitter.onWorkspaceAdded((workspace) => {
            const allOtherWindows = store.workspaceIds.filter((wId) => wId !== workspace.id).reduce((acc, w) => {
                return [...acc, ...store.getById(w).windows];
            }, []);

            this._workspacesEventEmitter.raiseWorkspaceEvent({
                action: "opened",
                payload: {
                    frameSummary: { id: this._frameId },
                    workspaceSummary: this.stateResolver.getWorkspaceSummary(workspace.id)
                }
            });
            if (store.getActiveWorkspace().id === workspace.id) {
                this._workspacesEventEmitter.raiseWorkspaceEvent({
                    action: "selected",
                    payload: {
                        frameSummary: { id: this._frameId },
                        workspaceSummary: this.stateResolver.getWorkspaceSummary(workspace.id)
                    }
                });
                if (!workspace.layout) {
                    this._frameController.selectionChangedDeep([], allOtherWindows.map((w) => w.id));
                    return;
                }
                const allWinsInLayout = getAllWindowsFromConfig(workspace.layout.toConfig().content);

                this._frameController.selectionChangedDeep(allWinsInLayout.map((w) => idAsString(w.id)), allOtherWindows.map((w) => w.id));
            }

            if (!workspace.layout) {
                return;
            }
            const workspaceOptions = workspace.layout.config.workspacesOptions as { title: string; name: string };
            const title = workspaceOptions.title || workspaceOptions.name;

            if (title) {
                store.getWorkspaceLayoutItemById(workspace.id)?.setTitle(title);
            }
        });

        this._controller.emitter.onWorkspaceSelectionChanged((workspace, toBack) => {
            this._popupManager.hidePopup();
            if (!workspace.layout) {
                this._frameController.selectionChangedDeep([], toBack.map((w) => w.id));
                this._workspacesEventEmitter.raiseWorkspaceEvent({
                    action: "selected", payload: {
                        frameSummary: { id: this._frameId },
                        workspaceSummary: this.stateResolver.getWorkspaceSummary(workspace.id)
                    }
                });
                return;
            }
            const allWinsInLayout = getAllWindowsFromConfig(workspace.layout.toConfig().content)
                .filter((w) => this._controller.isWindowVisible(w.id));

            this._frameController.selectionChangedDeep(allWinsInLayout.map((w) => idAsString(w.id)), toBack.map((w) => w.id));
            this._workspacesEventEmitter.raiseWorkspaceEvent({
                action: "selected", payload: {
                    frameSummary: { id: this._frameId },
                    workspaceSummary: this.stateResolver.getWorkspaceSummary(workspace.id)
                }
            });
        });

        this._controller.emitter.onAddButtonClicked(async ({ laneId, workspaceId, bounds, parentType }) => {
            const payload: any = {
                boxId: laneId,
                workspaceId,
                parentType,
                frameId: this._frameId,
                peerId: this._glue.agm.instance.peerId,
                domNode: undefined,
                resizePopup: undefined,
                hidePopup: undefined
            };

            await this._popupManager.showAddWindowPopup(bounds, payload);
        });

        this._controller.emitter.onContentLayoutInit((layout: Workspace["layout"]) => {
            this.reportLayoutStructure(layout);
        });

        this._controller.emitter.onWorkspaceAddButtonClicked(async () => {
            const payload = {
                frameId: this._frameId,
                peerId: this._glue.agm.instance.windowId
            };

            const addButton = store
                .workspaceLayoutHeader
                .element
                .find(".lm_workspace_controls")
                .find(".lm_add_button");
            const addButtonBounds = getElementBounds(addButton);

            await this._popupManager.showOpenWorkspacePopup(addButtonBounds, payload);
        });

        this._controller.emitter.onWorkspaceSaveRequested(async (workspaceId) => {
            const payload: any = {
                frameId: this._frameId,
                workspaceId,
                peerId: this._glue.agm.instance.peerId,
                buildMode: scReader.config.build,
                domNode: undefined,
                resizePopup: undefined,
                hidePopup: undefined
            };

            const saveButton = (store
                .getWorkspaceLayoutItemById(workspaceId) as GoldenLayout.Component)
                .tab
                .element
                .find(".lm_saveButton");

            const targetBounds = getElementBounds(saveButton);

            await this._popupManager.showSaveWorkspacePopup(targetBounds, payload);
        });

        this._controller.emitter.onStackMaximized((stack: GoldenLayout.Stack) => {
            const activeItem = stack.getActiveContentItem();
            const toBack = stack.contentItems.map((ci) => idAsString(ci.config.id));

            stack.contentItems.forEach((ci) => {
                this._frameController.maximizeTab(idAsString(ci.config.id));
            });
            this._frameController.selectionChanged([idAsString(activeItem.config.id)], toBack);
        });

        this._controller.emitter.onStackRestored((stack: GoldenLayout.Stack) => {
            const activeItem = stack.getActiveContentItem();
            const toBack = stack.contentItems.map((ci) => idAsString(ci.config.id));

            stack.contentItems.forEach((ci) => {
                this._frameController.restoreTab(idAsString(ci.config.id));
            });

            this._frameController.selectionChanged([idAsString(activeItem.config.id)], toBack);
        });

        this._controller.emitter.onEjectRequested((item) => {
            if (!item.isComponent) {
                throw new Error(`Can't eject item of type ${item.type}`);
            }
            return this.eject(item);
        });

        componentStateMonitor.onWorkspaceContentsShown((workspaceId: string) => {
            const workspace = store.getActiveWorkspace();
            if (!workspace?.layout || workspaceId !== workspace.id) {
                return;
            }
            const workspaceContentItem = store.getWorkspaceContentItem(workspaceId);
            const bounds = getElementBounds(workspaceContentItem.element);
            workspace.layout.updateSize(bounds.width, bounds.height);
            const stacks = workspace.layout.root.getItemsByFilter((e) => e.type === "stack");

            this._frameController.selectionChangedDeep(stacks.map(s => idAsString(s.getActiveContentItem().config.id)), []);
        });

        componentStateMonitor.onWorkspaceContentsHidden((workspaceId: string) => {
            const workspace = store.getById(workspaceId);
            if (!workspace?.layout || workspaceId !== workspace.id) {
                return;
            }

            this._frameController.selectionChangedDeep([], workspace.windows.map(w => w.id));
        });
    }

    private subscribeForPopups() {
        this._frameController.onFrameContentClicked(() => {
            this._popupManager.hidePopup();
        });

        this._frameController.onWindowTitleChanged((id, title) => {
            this.setItemTitle(id, title);
        });
    }

    private cleanUp = () => {
        this._isDisposing = true;
        if (scReader.config?.build) {
            return;
        }
        const windowSummaries: WindowSummary[] = [];
        const workspaceSummaries = store.workspaceIds.map((wid) => {
            const workspace = store.getById(wid);
            windowSummaries.push(...workspace.windows.map(w => this.stateResolver.getWindowSummarySync(w.id)));

            return this.stateResolver.getWorkspaceSummary(wid);
        });

        windowSummaries.forEach((ws) => {
            this.notifyFrameWillClose(ws.config.windowId, ws.config.appName).catch((e) => {
                // Log the error
            });
            this.workspacesEventEmitter.raiseWindowEvent({ action: "removed", payload: { windowSummary: ws } });
        });

        workspaceSummaries.forEach((ws) => {
            this.workspacesEventEmitter.raiseWorkspaceEvent({ action: "closed", payload: { frameSummary: { id: this._frameId }, workspaceSummary: ws } });
        });

        const currentWorkspaces = store.layouts.filter(l => !l.layout?.config?.workspacesOptions?.noTabHeader);


        this._layoutsManager.saveWorkspacesFrame(currentWorkspaces);

        this.workspacesEventEmitter.raiseFrameEvent({ action: "closed", payload: { frameSummary: { id: this._frameId } } });
    };

    private reportLayoutStructure(layout: Workspace["layout"]) {
        const allWinsInLayout = getAllWindowsFromConfig(layout.toConfig().content);

        allWinsInLayout.forEach((w) => {
            const win = layout.root.getItemsById(w.id)[0];

            this._frameController.moveFrame(idAsString(win.config.id), getElementBounds(win.element));
        });
    }

    private closeTab(item: GoldenLayout.ContentItem, emptyWorkspaceCheck: boolean = true) {
        const itemId = idAsString(item.config.id);
        const workspace = store.getByWindowId(itemId);
        const windowSummary = this.stateResolver.getWindowSummarySync(itemId);

        this._controller.removeLayoutElement(itemId);
        this._frameController.remove(itemId);

        this.notifyFrameWillClose(windowSummary.config.windowId, windowSummary.config.appName).catch((e) => {
            // Log the error
        });

        this.workspacesEventEmitter.raiseWindowEvent({
            action: "removed",
            payload: {
                windowSummary
            }
        });


        if (!workspace.windows.length && emptyWorkspaceCheck) {
            this.checkForEmptyWorkspace(workspace);
        }
    }

    private closeWorkspace(workspace: Workspace) {
        if (!workspace) {
            throw new Error("Could not find a workspace to close");
        }

        const workspaceSummary = this.stateResolver.getWorkspaceSummary(workspace.id);
        const windowSummaries = workspace.windows.map((w) => {
            if (store.getWindowContentItem(w.id)) {
                return this.stateResolver.getWindowSummarySync(w.id);
            }
        }).filter(ws => ws);

        workspace.windows.forEach((w) => this._frameController.remove(w.id));
        const isFrameEmpty = this.checkForEmptyWorkspace(workspace);
        windowSummaries.forEach((ws) => {
            this.notifyFrameWillClose(ws.config.windowId, ws.config.appName).catch((e) => {
                // Log the error
            });
            this.workspacesEventEmitter.raiseWindowEvent({
                action: "removed",
                payload: {
                    windowSummary: ws
                }
            });
        });
        if (isFrameEmpty) {
            return;
        }
        this.workspacesEventEmitter.raiseWorkspaceEvent({
            action: "closed",
            payload: {
                workspaceSummary,
                frameSummary: { id: this._frameId }
            }
        });
    }

    private async addWorkspace(id: string, config: GoldenLayout.Config) {
        await this._glue.contexts.set(getWorkspaceContextName(id), config?.workspacesOptions?.context || {});
        await this._controller.addWorkspace(id, config);
    }

    private checkForEmptyWorkspace(workspace: Workspace): boolean {
        // Closing all workspaces except the last one
        if (store.layouts.length === 1) {
            try {
                if (this._isLayoutInitialized) {

                    this._facade.executeAfterControlIsDone(() => {
                        window.close();
                    });
                    return true;
                }
            } catch (error) {
                // Try to close my window if it fails fallback to frame with one empty workspace
            }
            workspace.windows = [];
            workspace.layout?.destroy();
            workspace.layout = undefined;
            this._controller.showAddButton(workspace.id);
            const currentTitle = store.getWorkspaceTitle(workspace.id);
            const title = this._configFactory.getWorkspaceTitle(store.workspaceTitles.filter((wt) => wt !== currentTitle));
            this._controller.setWorkspaceTitle(workspace.id, title);
        } else {
            this._controller.removeWorkspace(workspace.id);
        }

        return false;
    }

    private waitForFrameLoaded(itemId: string) {
        return new Promise<void>((res, rej) => {
            let unsub = () => {
                // safety
            };
            const timeout = setTimeout(() => {
                unsub();
                rej(`Did not hear frame loaded for ${itemId} in 5000ms`);
            }, 5000);

            unsub = this.workspacesEventEmitter.onWindowEvent((action, payload) => {
                if (action === "loaded" && payload.windowSummary.itemId === itemId) {
                    res();
                    clearTimeout(timeout);
                    unsub();
                }
            });
        });
    }

    private getUrlByAppName(appName: string): string {
        if (!appName) {
            return undefined;
        }
        return this._glue.appManager?.application(appName)?.userProperties?.details?.url;
    }

    private getTitleByAppName(appName: string): string {
        if (!appName) {
            return undefined;
        }
        return this._glue.appManager?.application(appName)?.title;
    }

    private getAppNameByWindowId(windowId: string): string {
        return this._glue.appManager?.instances()?.find(i => i.id === windowId)?.application?.name;
    }

    private notifyFrameWillStart(windowId: string, appName?: string, context?: any, title?: string) {
        return this._glue.interop.invoke(PlatformControlMethod, {
            domain: appName ? "appManager" : "windows",
            operation: appName ? "registerWorkspaceApp" : "registerWorkspaceWindow",
            data: {
                name: `${appName || "window"}_${windowId}`,
                windowId,
                frameId: this.frameId,
                appName,
                context,
                title
            }
        });
    }

    private notifyFrameWillClose(windowId: string, appName?: string) {
        return this._glue.interop.invoke(PlatformControlMethod, {
            domain: appName ? "appManager" : "windows",
            operation: appName ? "unregisterWorkspaceApp" : "unregisterWorkspaceWindow",
            data: {
                windowId,
            }
        });
    }

    private vaidateTitle(title: string) {
        if (title?.length) {
            return undefined;
        }

        return title;
    }
}

export default new WorkspacesManager();
