/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable indent */
import { LayoutController } from "./layout/controller";
import { WindowSummary, Workspace, WorkspaceOptionsWithTitle, WorkspaceOptionsWithLayoutName, ComponentFactory, LoadingStrategy, WorkspaceLayout, Bounds, Constraints } from "./types/internal";
import { LayoutEventEmitter } from "./layout/eventEmitter";
import { IFrameController } from "./iframeController";
import store from "./state/store";
import registryFactory, { UnsubscribeFunction } from "callback-registry";
import GoldenLayout from "@glue42/golden-layout";
import { LayoutsManager } from "./layouts";
import { LayoutStateResolver } from "./state/resolver";
import scReader from "./config/startupReader";
import { idAsString, getAllWindowsFromConfig, getElementBounds, getWorkspaceContextName } from "./utils";
import { WorkspacesConfigurationFactory } from "./config/factory";
import { WorkspacesEventEmitter } from "./eventEmitter";
import { Glue42Web } from "@glue42/web";
import { LockColumnArguments, LockContainerArguments, LockGroupArguments, LockRowArguments, LockWindowArguments, LockWorkspaceArguments, ResizeItemArguments, RestoreWorkspaceConfig } from "./interop/types";
import { TitleGenerator } from "./config/titleGenerator";
import startupReader from "./config/startupReader";
import componentStateMonitor from "./componentStateMonitor";
import { ConfigConverter } from "./config/converter";
import { PopupManagerComposer } from "./popups/composer";
import { PopupManager } from "./popups/external";
import { ComponentPopupManager } from "./popups/component";
import { GlueFacade } from "./interop/facade";
import { ApplicationFactory } from "./app/factory";
import { DelayedExecutor } from "./utils/delayedExecutor";
import systemSettings from "./config/system";
import { ConstraintsValidator } from "./config/constraintsValidator";
import { WorkspaceWrapper } from "./state/workspaceWrapper";
import { DefaultMaxSize, DefaultMinSize } from "./utils/constants";

export class WorkspacesManager {
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
    private _applicationFactory: ApplicationFactory;
    private _facade: GlueFacade;
    private _isDisposing: boolean;

    public get stateResolver(): LayoutStateResolver {
        return this._stateResolver;
    }

    public get workspacesEventEmitter(): WorkspacesEventEmitter {
        return this._workspacesEventEmitter;
    }

    public get initPromise(): Promise<void> {
        return this._initPromise;
    }

    public get initialized(): boolean {
        return this._initialized;
    }

    public get frameId(): string {
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
        this._frameController = new IFrameController(glue);
        const eventEmitter = new LayoutEventEmitter(registryFactory());
        this._stateResolver = new LayoutStateResolver(this._frameId, eventEmitter, this._frameController, converter);
        this._controller = new LayoutController(eventEmitter, this._stateResolver, startupConfig, this._configFactory);
        this._applicationFactory = new ApplicationFactory(glue, this.stateResolver, this._frameController, this, new DelayedExecutor());
        this._layoutsManager = new LayoutsManager(this.stateResolver, glue, this._configFactory, converter, new ConstraintsValidator());
        this._popupManager = new PopupManagerComposer(new PopupManager(glue), new ComponentPopupManager(componentFactory, frameId), componentFactory);

        if (!startupConfig.emptyFrame) {
            this.initLayout();
        }

        return { cleanUp: this.cleanUp };
    }

    public getComponentBounds = (): Bounds => {
        return this._controller.bounds;
    }

    public subscribeForWindowClicked = (cb: () => void): UnsubscribeFunction => {
        if (!this._frameController) {
            // tslint:disable-next-line: no-console
            console.warn("Your subscription to window clicked wasn't successful, because the Workspaces library isn't initialized yet");
            return (): void => { };
        }
        return this._frameController.onFrameContentClicked(cb);
    }

    public async saveWorkspace(name: string, id?: string, saveContext?: boolean): Promise<WorkspaceLayout> {
        const workspace = store.getById(id) || store.getActiveWorkspace();
        const result = await this._layoutsManager.save({
            name,
            workspace,
            title: store.getWorkspaceTitle(workspace.id),
            saveContext
        });

        const config = workspace.layout?.config || workspace.hibernateConfig;
        (config.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName = name;
        if (config.workspacesOptions.noTabHeader) {
            delete config.workspacesOptions.noTabHeader;
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

        (savedConfig.workspacesOptions as WorkspaceOptionsWithTitle).title = options?.title || name;

        if (savedConfig && savedConfig.workspacesOptions && !savedConfig.workspacesOptions.name) {
            savedConfig.workspacesOptions.name = name;
        }

        if (savedConfig) {
            savedConfig.workspacesOptions = savedConfig.workspacesOptions || {};

            (savedConfig.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName = savedConfigWithData.layoutData.name;
        }

        if (savedConfig && options) {
            (savedConfig.workspacesOptions as any).loadingStrategy = options.loadingStrategy;
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

                await this.reinitializeWorkspace(savedConfig.id, savedConfig);

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

    public deleteLayout(name: string): void {
        this._layoutsManager.delete(name);
    }

    public maximizeItem(itemId: string): void {
        this._controller.maximizeWindow(itemId);
    }

    public restoreItem(itemId: string): void {
        this._controller.restoreWindow(itemId);
    }

    public closeItem(itemId: string): void {
        const win = store.getWindow(itemId);
        const container = store.getContainer(itemId);
        if (this._frameId === itemId) {
            store.workspaceIds.forEach((wid) => this.closeWorkspace(store.getById(wid)));
        } else if (win) {
            const windowContentItem = store.getWindowContentItem(itemId);
            if (!windowContentItem) {
                throw new Error(`Could not find item ${itemId} to close`);
            }
            this.closeTab(windowContentItem);
        } else if (container) {
            this._controller.closeContainer(itemId);
        } else {
            const workspace = store.getById(itemId);
            this.closeWorkspace(workspace);
        }
    }

    public async addContainer(config: GoldenLayout.RowConfig | GoldenLayout.StackConfig | GoldenLayout.ColumnConfig, parentId: string): Promise<string> {
        const configWithtoutIsPinned = this.cleanIsPinned(config) as GoldenLayout.RowConfig | GoldenLayout.StackConfig | GoldenLayout.ColumnConfig;
        const result = await this._controller.addContainer(configWithtoutIsPinned, parentId);

        const itemConfig = store.getContainer(result);
        if (itemConfig) {
            this.applyIsPinned(config, itemConfig);
        }

        const windowConfigs = getAllWindowsFromConfig(config.content);
        const workspace = store.getById(parentId) || store.getByContainerId(parentId);

        Promise.all(windowConfigs.map(async (itemConfig) => {
            const component = store.getWindowContentItem(idAsString(itemConfig.id));

            await this._applicationFactory.start(component, workspace.id);
        }));

        return result;
    }

    public async addWindow(itemConfig: GoldenLayout.ItemConfig, parentId: string): Promise<void> {
        const parent = store.getContainer(parentId);
        if ((!parent || parent.type !== "stack") && itemConfig.type === "component") {
            itemConfig = this._configFactory.wrapInGroup([itemConfig]);
        }
        const workspace = store.getById(parentId) || store.getByContainerId(parentId);
        await this._controller.addWindow(itemConfig, parentId);

        const allWindowsInConfig = getAllWindowsFromConfig([itemConfig]);
        const component = store.getWindowContentItem(idAsString(allWindowsInConfig[0].id));

        this._applicationFactory.start(component, workspace.id);
    }

    public setItemTitle(itemId: string, title: string): void {
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

        const ejectedWindowUrl = this._applicationFactory.getUrlByAppName(appName) || url;
        const ejectedWindow = await this._glue.windows.open(`${appName}_${windowId}`, ejectedWindowUrl, { context, windowId } as Glue42Web.Windows.Settings);

        return { windowId: ejectedWindow.id };
    }

    public async createWorkspace(config: GoldenLayout.Config): Promise<string> {
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

            if (!workspace) {
                throw new Error(`Could not find workspace ${config.workspacesOptions?.reuseWorkspaceId} to reuse`);
            }

            workspace.windows
                .map((w) => store.getWindowContentItem(w.id))
                .filter((w) => w)
                .map((w) => this.closeTab(w, false));

            await this.reinitializeWorkspace(id, config);
            await this._glue.contexts.set(getWorkspaceContextName(id), config.workspacesOptions.context ?? {});
        } else {
            await this.addWorkspace(id, config);
        }

        return id;
    }

    public async loadWindow(itemId: string): Promise<{ windowId: string }> {
        let contentItem = store.getWindowContentItem(itemId);
        if (!contentItem) {
            throw new Error(`Could not find window ${itemId} to load`);
        }
        let { windowId } = contentItem.config.componentState;
        const workspace = store.getByWindowId(itemId);
        if (!this.stateResolver.isWindowLoaded(itemId) && contentItem.type === "component") {
            this._applicationFactory.start(contentItem, workspace.id);
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
            // do nothing
        } else if (workspace) {
            if (workspace.hibernateConfig) {
                await this.resumeWorkspace(workspace.id);
            }
            this._controller.focusWorkspace(workspace.id);
        } else {
            this._controller.focusWindow(itemId);
        }
    }

    public bundleWorkspace(workspaceId: string, type: "row" | "column") {
        if (this._stateResolver.isWorkspaceHibernated(workspaceId)) {
            throw new Error(`Could not bundle workspace ${workspaceId} because its hibernated`);
        }
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
        const sourceWorkspace = store.getByWindowId(itemId);
        const targetWorkspace = store.getByContainerId(containerId) || store.getById(containerId);
        if (!targetWorkspace) {
            throw new Error(`Could not find container ${containerId} in frame ${this._frameId}`);
        }

        if (!sourceWorkspace) {
            throw new Error(`Could not find window ${itemId} in frame ${this._frameId}`);
        }

        if (this._stateResolver.isWorkspaceHibernated(targetWorkspace.id)) {
            throw new Error(`Could not move window ${itemId} to workspace ${targetWorkspace.id} because its hibernated`);
        }

        if (this._stateResolver.isWorkspaceHibernated(sourceWorkspace.id)) {
            throw new Error(`Could not move window ${itemId} from workspace ${sourceWorkspace.id} because its hibernated`);
        }

        const targetWindow = store.getWindowContentItem(itemId);
        if (!targetWindow) {
            throw new Error(`Could not find window ${itemId} in frame ${this._frameId}`);
        }
        const movedWindow = sourceWorkspace.windows.find(w => w.id === itemId || w.windowId === itemId)

        this._controller.removeLayoutElement(itemId);
        store.removeWindow(movedWindow, sourceWorkspace.id);
        store.addWindow(movedWindow, targetWorkspace.id);
        // this.closeTab(targetWindow);
        await this._controller.addWindow(targetWindow.config, containerId);
    }

    public generateWorkspaceLayout(name: string, itemId: string) {
        const workspace = store.getById(itemId);
        if (!workspace) {
            throw new Error(`Could not find workspace with id ${itemId}`);
        }

        return this._layoutsManager.generateLayout(name, workspace);
    }

    public async resumeWorkspace(workspaceId: string) {
        const workspace = store.getById(workspaceId);
        if (!workspace) {
            throw new Error(`Could not find workspace ${workspaceId} in any of the frames`);
        }
        const hibernatedConfig = workspace.hibernateConfig;

        if (!hibernatedConfig.workspacesOptions) {
            hibernatedConfig.workspacesOptions = {};
        }

        hibernatedConfig.workspacesOptions.reuseWorkspaceId = workspaceId;

        // the start mode should always be eager
        await this.createWorkspace(hibernatedConfig);

        workspace.hibernateConfig = undefined;
        this._controller.showSaveIcon(workspaceId);
    }

    public lockWorkspace(lockConfig: LockWorkspaceArguments): void {
        if (!lockConfig.config) {
            lockConfig.config = {
                allowDrop: false,
                allowDropLeft: false,
                allowDropTop: false,
                allowDropRight: false,
                allowDropBottom: false,
                allowExtract: false,
                allowSplitters: false,
                showCloseButton: false,
                showSaveButton: false,
                showWindowCloseButtons: false,
                showEjectButtons: false,
                showAddWindowButtons: false
            };
        }

        Object.keys(lockConfig.config).forEach((key) => {
            const config = lockConfig.config as any;
            if (config[key] === undefined) {
                config[key] = true;
            }
        });

        if (typeof lockConfig.config.allowDrop !== "undefined") {
            lockConfig.config.allowDropLeft = lockConfig.config.allowDropLeft ?? lockConfig.config.allowDrop;
            lockConfig.config.allowDropTop = lockConfig.config.allowDropTop ?? lockConfig.config.allowDrop;
            lockConfig.config.allowDropRight = lockConfig.config.allowDropRight ?? lockConfig.config.allowDrop;
            lockConfig.config.allowDropBottom = lockConfig.config.allowDropBottom ?? lockConfig.config.allowDrop;
        }

        const { allowDrop, allowExtract, allowSplitters, showCloseButton, showSaveButton, showAddWindowButtons, showWindowCloseButtons, showEjectButtons } = lockConfig.config;
        const { workspaceId } = lockConfig;

        if (allowDrop === false) {
            this._controller.disableWorkspaceDrop(workspaceId, lockConfig.config);
        } else {
            this._controller.enableWorkspaceDrop(workspaceId, lockConfig.config);
        }

        if (allowExtract === false) {
            this._controller.disableWorkspaceExtract(workspaceId);
        } else {
            this._controller.enableWorkspaceExtract(workspaceId);
        }

        if (allowSplitters === false) {
            this._controller.disableSplitters(workspaceId);
        } else {
            this._controller.enableSplitters(workspaceId);
        }

        if (showCloseButton === false) {
            this._controller.disableWorkspaceCloseButton(workspaceId);
        } else {
            this._controller.enableWorkspaceCloseButton(workspaceId);
        }

        if (showSaveButton === false) {
            this._controller.disableWorkspaceSaveButton(workspaceId);
        } else {
            this._controller.enableWorkspaceSaveButton(workspaceId);
        }

        if (showAddWindowButtons === false) {
            this._controller.disableWorkspaceAddWindowButtons(workspaceId);
        } else {
            this._controller.enableWorkspaceAddWindowButtons(workspaceId);
        }

        if (showEjectButtons === false) {
            this._controller.disableWorkspaceEjectButtons(workspaceId);
        } else {
            this._controller.enableWorkspaceEjectButtons(workspaceId);
        }

        if (showWindowCloseButtons === false) {
            this._controller.disableWorkspaceWindowCloseButtons(workspaceId);
        } else {
            this._controller.enableWorkspaceWindowCloseButtons(workspaceId);
        }
    }

    public lockContainer(lockConfig: LockContainerArguments): void {
        if (!lockConfig.config && lockConfig.type === "column") {
            lockConfig.config = {
                allowDrop: false,
            };
        } else if (!lockConfig.config && lockConfig.type === "row") {
            lockConfig.config = {
                allowDrop: false
            };
        } else if (!lockConfig.config && lockConfig.type === "group") {
            lockConfig.config = {
                allowDrop: false,
                allowExtract: false,
                showAddWindowButton: false,
                showEjectButton: false,
                showMaximizeButton: false
            };
        }

        Object.keys(lockConfig.config).forEach((key) => {
            const config = lockConfig.config as any;
            if (config[key] === undefined) {
                config[key] = true;
            }
        });

        switch (lockConfig.type) {
            case "column":
                this.handleColumnLockRequested(lockConfig);
                break;
            case "row":
                this.handleRowLockRequested(lockConfig);
                break;
            case "group":
                this.handleGroupLockRequested(lockConfig);
                break;
        }
    }

    public lockWindow(lockConfig: LockWindowArguments): void {
        if (!lockConfig.config) {
            lockConfig.config = {
                allowExtract: false,
                showCloseButton: false,
            };
        }

        Object.keys(lockConfig.config).forEach((key) => {
            const config = lockConfig.config as any;
            if (config[key] === undefined) {
                config[key] = true;
            }
        });

        const { allowExtract, showCloseButton } = lockConfig.config;
        const { windowPlacementId } = lockConfig;

        if (allowExtract === false) {
            this._controller.disableWindowExtract(windowPlacementId);
        } else {
            this._controller.enableWindowExtract(windowPlacementId, allowExtract);
        }

        if (showCloseButton === false) {
            this._controller.disableWindowCloseButton(windowPlacementId);
        } else {
            this._controller.enableWindowCloseButton(windowPlacementId, showCloseButton);
        }

        const workspace = store.getByWindowId(windowPlacementId);

        if (workspace?.layout) {
            workspace.layout.updateSize();
        }
    }

    public async hibernateWorkspace(workspaceId: string) {
        const workspace = store.getById(workspaceId);

        if (store.getActiveWorkspace().id === workspace.id) {
            throw new Error(`Cannot hibernate workspace ${workspace.id} because its active`);
        }

        if (this.stateResolver.isWorkspaceHibernated(workspaceId)) {
            throw new Error(`Cannot hibernate workspace ${workspaceId} because it has already been hibernated`);
        }

        if (!workspace.layout) {
            throw new Error(`Cannot hibernate workspace ${workspace.id} because its empty`);
        }

        const snapshot = await this.stateResolver.getWorkspaceConfig(workspace.id);

        workspace.hibernatedWindows = workspace.windows;
        (snapshot.workspacesOptions as any).isHibernated = true;
        workspace.hibernateConfig = snapshot;

        workspace.windows.map((w) => store.getWindowContentItem(w.id)).forEach((w) => this.closeTab(w, false));

        store.removeLayout(workspace.id);

        this._controller.showHibernationIcon(workspaceId);

        return snapshot;
    }

    public closeTab(item: GoldenLayout.ContentItem, emptyWorkspaceCheck: boolean = true) {
        const itemId = idAsString(item.config.id);
        const workspace = store.getByWindowId(itemId);
        const windowSummary = this.stateResolver.getWindowSummarySync(itemId);

        this._controller.removeLayoutElement(itemId);
        this._frameController.remove(itemId);

        this._applicationFactory.notifyFrameWillClose(windowSummary.config.windowId, windowSummary.config.appName).catch((e) => {
            // Log the error
        });

        if (!workspace.hibernatedWindows.some((hw) => windowSummary.itemId === hw.id)) {
            this.workspacesEventEmitter.raiseWindowEvent({
                action: "removed",
                payload: {
                    windowSummary
                }
            });
        }


        if (!workspace.windows.length && emptyWorkspaceCheck) {
            this.checkForEmptyWorkspace(workspace);
        }
    }

    public resizeItem(args: ResizeItemArguments) {
        if (args.itemId === this.frameId) {
            throw new Error(`Cannot resize frame ${args.itemId}`);
        } else {
            return this.resizeWorkspaceItem(args);
        }
    }

    public unmount() {
        try {
            this._popupManager.hidePopup();
        } catch (error) {
            // tslint:disable-next-line: no-console
            console.warn(error);
        }
    }

    private resizeWorkspaceItem(args: ResizeItemArguments) {
        const item = store.getContainer(args.itemId) || store.getWindowContentItem(args.itemId);

        if (!item) {
            throw new Error(`Could not find container ${args.itemId} in frame ${this.frameId}`);
        }

        if (item.type === "column" && args.height) {
            throw new Error(`Requested resize for ${item.type} ${args.itemId}, however an unsupported argument (height) was passed`);
        }

        if (item.type === "row" && args.width) {
            throw new Error(`Requested resize for ${item.type} ${args.itemId}, however an unsupported argument (width) was passed`);
        }

        if (item.type === "row") {
            this._controller.resizeRow(item, args.height);
        } else if (item.type === "column") {
            this._controller.resizeColumn(item, args.width);
        } else if (item.type === "stack") {
            this._controller.resizeStack(item, args.width, args.height);
        } else {
            this._controller.resizeComponent(item, args.width, args.height);
        }
    }

    private async initLayout() {
        const workspacesSystemSettings = await systemSettings.getSettings(this._glue);
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
            showLoadingIndicator: workspacesSystemSettings?.loadingStrategy?.showDelayedIndicator || false
        });

        Promise.all(store.workspaceIds.map((wid) => {
            const loadingStrategy = this._applicationFactory.getLoadingStrategy(workspacesSystemSettings, config.workspaceConfigs[0].config);
            return this.handleWindows(wid, loadingStrategy);
        }));

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

    private async reinitializeWorkspace(id: string, config: GoldenLayout.Config) {
        await this._controller.reinitializeWorkspace(id, config);

        const workspacesSystemSettings = await systemSettings.getSettings(this._glue);
        const loadingStrategy = this._applicationFactory.getLoadingStrategy(workspacesSystemSettings, config);
        this.handleWindows(id, loadingStrategy);
    }

    private subscribeForLayout() {
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


            if (!dragElement) {
                return;
            }

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

                if (workspace.hibernateConfig) {
                    this.resumeWorkspace(workspace.id);
                }
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

        this._controller.emitter.onComponentSelectedInWorkspace((component, workspaceId) => {
            this._applicationFactory.start(component, workspaceId);
        });

        const resizedTimeouts: { [id: string]: NodeJS.Timeout } = {};
        this._controller.emitter.onWorkspaceContainerResized((workspaceId) => {
            const id = idAsString(workspaceId);
            if (resizedTimeouts[id]) {
                clearTimeout(resizedTimeouts[id]);
            }
            resizedTimeouts[id] = setTimeout(() => {
                this._controller.refreshWorkspaceSize(id);
            }, 16); // 60 FPS
        });

        // debouncing because there is potential for 1ms spam
        let shownTimeout: NodeJS.Timeout = undefined;
        componentStateMonitor.onWorkspaceContentsShown((workspaceId: string) => {
            const workspace = store.getActiveWorkspace();
            if (!workspace?.layout || workspaceId !== workspace.id) {
                return;
            }
            if (shownTimeout) {
                clearTimeout(shownTimeout);
            }

            shownTimeout = setTimeout(() => {
                const containerElement = $(`#nestHere${workspace.id}`);
                const bounds = getElementBounds(containerElement[0]);
                workspace.layout.updateSize(bounds.width, bounds.height);
            }, 50);
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

        this.workspacesEventEmitter.onWorkspaceEvent((action, payload) => {
            const workspace = store.getById(payload.workspaceSummary.id);

            if (!workspace) {
                return;
            }

            workspace.lastActive = Date.now();
        });
    }

    private subscribeForPopups(): void {
        this._frameController.onFrameContentClicked(() => {
            this._popupManager.hidePopup();
        });

        this._frameController.onWindowTitleChanged((id, title) => {
            this.setItemTitle(id, title);
        });

        this._frameController.onFrameLoaded((id) => {
            this._controller.hideLoadingIndicator(id);
        });
    }

    private cleanUp = (): void => {
        this._isDisposing = true;
        if (scReader.config?.build) {
            return;
        }
        const windowSummaries: WindowSummary[] = [];
        const workspaceSummaries = store.workspaceIds.map((wid) => {
            const workspace = store.getById(wid);
            windowSummaries.push(...workspace.windows.map(w => this.stateResolver.getWindowSummarySync(w.id)));
            const snapshot = this.stateResolver.getWorkspaceConfig(wid);
            const hibernatedSummaries = this.stateResolver.extractWindowSummariesFromSnapshot(snapshot);
            windowSummaries.push(...hibernatedSummaries);

            return this.stateResolver.getWorkspaceSummary(wid);
        });

        windowSummaries.forEach((ws) => {
            this._applicationFactory.notifyFrameWillClose(ws.config.windowId, ws.config.appName).catch((e) => {
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

    private reportLayoutStructure(layout: Workspace["layout"]): void {
        const allWinsInLayout = getAllWindowsFromConfig(layout.toConfig().content);

        allWinsInLayout.forEach((w) => {
            const win = layout.root.getItemsById(w.id)[0];

            this._frameController.moveFrame(idAsString(win.config.id), getElementBounds(win.element));
        });
    }

    private closeWorkspace(workspace: Workspace): void {
        if (!workspace) {
            throw new Error("Could not find a workspace to close");
        }

        if (workspace.hibernateConfig) {
            this.closeHibernatedWorkspaceCore(workspace);
        } else {
            this.closeWorkspaceCore(workspace);
        }
    }

    private closeWorkspaceCore(workspace: Workspace): void {
        const workspaceSummary = this.stateResolver.getWorkspaceSummary(workspace.id);
        const windowSummaries = workspace.windows.map((w) => {
            if (store.getWindowContentItem(w.id)) {
                return this.stateResolver.getWindowSummarySync(w.id);
            }
        }).filter(ws => ws);

        workspace.windows.forEach((w) => this._frameController.remove(w.id));

        const isFrameEmpty = this.checkForEmptyWorkspace(workspace);
        windowSummaries.forEach((ws) => {
            this._applicationFactory.notifyFrameWillClose(ws.config.windowId, ws.config.appName).catch((e) => {
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

    private closeHibernatedWorkspaceCore(workspace: Workspace): void {
        const workspaceSummary = this.stateResolver.getWorkspaceSummary(workspace.id);
        const snapshot = this.stateResolver.getSnapshot(workspace.id) as GoldenLayout.Config;
        const windowSummaries = this.stateResolver.extractWindowSummariesFromSnapshot(snapshot);

        workspace.windows.forEach((w) => this._frameController.remove(w.id));

        const isFrameEmpty = this.checkForEmptyWorkspace(workspace);
        windowSummaries.forEach((ws) => {
            this._applicationFactory.notifyFrameWillClose(ws.config.windowId, ws.config.appName).catch((e) => {
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

    private async addWorkspace(id: string, config: GoldenLayout.Config): Promise<void> {
        await this._glue.contexts.set(getWorkspaceContextName(id), config?.workspacesOptions?.context || {});
        await this._controller.addWorkspace(id, config);

        const workspacesSystemSettings = await systemSettings.getSettings(this._glue);
        const loadingStrategy = this._applicationFactory.getLoadingStrategy(workspacesSystemSettings, config);
        this.handleWindows(id, loadingStrategy).catch((e) => {
            // If it failes do nothing
            console.log(e);
        });
    }

    private async handleWindows(workspaceId: string, loadingStrategy: LoadingStrategy): Promise<void> {
        switch (loadingStrategy) {
            case "delayed":
                await this._applicationFactory.startDelayed(workspaceId);
                break;
            case "direct":
                await this._applicationFactory.startDirect(workspaceId);
                break;
            case "lazy":
                await this._applicationFactory.startLazy(workspaceId);
                break;
        }
    }

    private checkForEmptyWorkspace(workspace: Workspace): boolean {
        // Closing all workspaces except the last one
        if (store.layouts.length === 1) {
            if (this._isLayoutInitialized && (window as any).glue42core.isPlatformFrame) {
                workspace.windows = [];
                workspace.layout?.destroy();
                workspace.layout = undefined;
                this._controller.showAddButton(workspace.id);
                const currentTitle = store.getWorkspaceTitle(workspace.id);
                const title = this._configFactory.getWorkspaceTitle(store.workspaceTitles.filter((wt) => wt !== currentTitle));
                this._controller.setWorkspaceTitle(workspace.id, title);

                return true;
            } else if (this._isLayoutInitialized) {
                try {
                    this._facade.executeAfterControlIsDone(() => {
                        window.close();
                    });
                } catch (error) {
                    // Try to close my window if it fails fallback to frame with one empty workspace
                }

                return true;
            }

        } else {
            this._controller.removeWorkspace(workspace.id);
        }

        return false;
    }

    private waitForFrameLoaded(itemId: string): Promise<void> {
        return new Promise<void>((res, rej) => {
            let unsub = (): void => {
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

            if (this.stateResolver.isWindowLoaded(itemId)) {
                res();
                clearTimeout(timeout);
                unsub();
            }
        });
    }

    private handleGroupLockRequested(data: LockGroupArguments): void {
        const { allowExtract, showAddWindowButton, showEjectButton, showMaximizeButton, allowDrop } = data.config;
        if (allowExtract === false) {
            this._controller.disableGroupExtract(data.itemId);
        } else {
            this._controller.enableGroupExtract(data.itemId, allowExtract);
        }

        if (showAddWindowButton === false) {
            this._controller.disableGroupAddWindowButton(data.itemId);
        } else {
            this._controller.enableGroupAddWindowButton(data.itemId, showAddWindowButton);
        }

        if (showEjectButton === false) {
            this._controller.disableGroupEjectButton(data.itemId);
        } else {
            this._controller.enableGroupEjectButton(data.itemId, showEjectButton);
        }

        if (showMaximizeButton === false) {
            this._controller.disableGroupMaximizeButton(data.itemId);
        } else {
            this._controller.enableGroupMaximizeButton(data.itemId, showMaximizeButton);
        }

        if (allowDrop === false) {
            this._controller.disableGroupDrop(data.itemId);
        } else {
            this._controller.enableGroupDrop(data.itemId, allowDrop);
        }

        const workspace = store.getByContainerId(data.itemId);
        if (workspace?.layout) {
            workspace.layout.updateSize();
        }
    }

    private handleRowLockRequested(data: LockRowArguments): void {
        const { allowDrop } = data.config;
        if (allowDrop === false) {
            this._controller.disableRowDrop(data.itemId);
        } else {
            this._controller.enableRowDrop(data.itemId, allowDrop);
        }
    }

    private handleColumnLockRequested(data: LockColumnArguments): void {
        const { allowDrop } = data.config;

        if (allowDrop === false) {
            this._controller.disableColumnDrop(data.itemId);
        } else {
            this._controller.enableColumnDrop(data.itemId, allowDrop);
        }
    }

    private cleanIsPinned(data: GoldenLayout.Config | GoldenLayout.ItemConfig): GoldenLayout.ItemConfig | GoldenLayout.Config {
        if (data.type !== "row" && data.type !== "column") {
            return data;
        }

        let hasFoundIsPinned = false;
        const clone = JSON.parse(JSON.stringify(data));

        const traverseAndClean = (item: GoldenLayout.ItemConfig) => {
            if (item.workspacesConfig.isPinned) {
                hasFoundIsPinned = true;
                item.workspacesConfig.isPinned = false;
            }
            if (item.type === "component") {
                return;
            }

            item.content.forEach((c) => traverseAndClean(c));
        };

        traverseAndClean(clone);

        if (hasFoundIsPinned) {
            return clone;
        }

        return data;
    }

    private applyIsPinned(initialConfig: GoldenLayout.Config | GoldenLayout.ItemConfig, currentConfig: GoldenLayout | GoldenLayout.ContentItem): void {
        if (initialConfig.type !== "row" && initialConfig.type !== "column") {
            return;
        }

        if (currentConfig.config.type !== "row" && currentConfig.config.type !== "column") {
            return;
        }

        let hasFoundIsPinned = false;

        const traverseAndApply = (initialItem: GoldenLayout.ItemConfig, currentItem: GoldenLayout.ContentItem): void => {
            if (initialItem.workspacesConfig.isPinned) {
                hasFoundIsPinned = true;
                currentItem.config.workspacesConfig.isPinned = true;
            }

            if (initialItem.type === "component" || currentItem.type === "component") {
                return;
            }

            initialItem.content.forEach((c, i) => traverseAndApply(c, currentItem.contentItems[i]));
        };

        traverseAndApply(initialConfig, currentConfig as GoldenLayout.ContentItem);
    }
}

export default new WorkspacesManager();
