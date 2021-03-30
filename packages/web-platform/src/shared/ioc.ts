import { Glue42WebPlatform } from "../../platform";
import { Gateway } from "../connection/gateway";
import { PlatformController } from "../controllers/main";
import { Platform } from "../platform";
import { GlueController } from "../controllers/glue";
import { PortsBridge } from "../connection/portsBridge";
import { WindowsController } from "../libs/windows/controller";
import { SessionStorageController } from "../controllers/session";
import { StateController } from "../controllers/state";
import { ApplicationsController } from "../libs/applications/controller";
import { LayoutsController } from "../libs/layouts/controller";
import { IdbStore } from "../libs/layouts/idbStore";
import { WorkspacesController } from "../libs/workspaces/controller";
import { IntentsController } from "../libs/intents/controller";
import { ChannelsController } from "../libs/channels/controller";
import { FramesController } from "../libs/workspaces/frames";
import { WorkspaceHibernationWatcher } from "../libs/workspaces/hibernationWatcher";
import { SystemController } from "../controllers/system";
import { AppDirectory } from "../libs/applications/appStore/directory";
import { RemoteWatcher } from "../libs/applications/appStore/remoteWatcher";

export class IoC {
    private _gatewayInstance!: Gateway;
    private _platformInstance!: Platform;
    private _mainController!: PlatformController;
    private _glueController!: GlueController;
    private _portsBridge!: PortsBridge;
    private _windowsController!: WindowsController;
    private _applicationsController!: ApplicationsController;
    private _appDirectory!: AppDirectory;
    private _remoteWatcher!: RemoteWatcher;
    private _layoutsController!: LayoutsController;
    private _workspacesController!: WorkspacesController;
    private _hibernationWatcher!: WorkspaceHibernationWatcher;
    private _intentsController!: IntentsController;
    private _channelsController!: ChannelsController;
    private _sessionController!: SessionStorageController;
    private _stateChecker!: StateController;
    private _framesController!: FramesController;
    private _systemController!: SystemController;
    private _idbStore!: IdbStore;

    constructor(private readonly config?: Glue42WebPlatform.Config) { }

    public get gateway(): Gateway {
        if (!this._gatewayInstance) {
            this._gatewayInstance = new Gateway();
        }

        return this._gatewayInstance;
    }

    public get platform(): Platform {
        if (!this._platformInstance) {
            this._platformInstance = new Platform(this.controller, this.config);
        }

        return this._platformInstance;
    }

    public get controller(): PlatformController {
        if (!this._mainController) {
            this._mainController = new PlatformController(
                this.systemController,
                this.glueController,
                this.windowsController,
                this.applicationsController,
                this.layoutsController,
                this.workspacesController,
                this.intentsController,
                this.channelsController,
                this.portsBridge,
                this.stateController
            );
        }

        return this._mainController;
    }

    public get glueController(): GlueController {
        if (!this._glueController) {
            this._glueController = new GlueController(this.portsBridge, this.sessionController);
        }

        return this._glueController;
    }

    public get systemController(): SystemController {
        if (!this._systemController) {
            this._systemController = new SystemController();
        }

        return this._systemController;
    }

    public get sessionController(): SessionStorageController {
        if (!this._sessionController) {
            this._sessionController = new SessionStorageController();
        }

        return this._sessionController;
    }

    public get stateController(): StateController {
        if (!this._stateChecker) {
            this._stateChecker = new StateController(this.sessionController);
        }

        return this._stateChecker;
    }

    public get windowsController(): WindowsController {
        if (!this._windowsController) {
            this._windowsController = new WindowsController(this.glueController, this.sessionController, this.stateController, this);
        }

        return this._windowsController;
    }

    public get applicationsController(): ApplicationsController {
        if (!this._applicationsController) {
            this._applicationsController = new ApplicationsController(
                this.glueController,
                this.sessionController,
                this.stateController,
                this.appDirectory,
                this
            );
        }

        return this._applicationsController;
    }

    public get appDirectory(): AppDirectory {
        if (!this._appDirectory) {
            this._appDirectory = new AppDirectory(
                this.sessionController,
                this.remoteWatcher
            );
        }

        return this._appDirectory;
    }

    public get remoteWatcher(): RemoteWatcher {
        if (!this._remoteWatcher) {
            this._remoteWatcher = new RemoteWatcher();
        }

        return this._remoteWatcher;
    }


    public get layoutsController(): LayoutsController {
        if (!this._layoutsController) {
            this._layoutsController = new LayoutsController(
                this.glueController,
                this.idbStore,
                this.sessionController
            );
        }

        return this._layoutsController;
    }

    public get workspacesController(): WorkspacesController {
        if (!this._workspacesController) {
            this._workspacesController = new WorkspacesController(
                this.framesController,
                this.glueController,
                this.stateController,
                this.hibernationWatcher,
                this
            );
        }

        return this._workspacesController;
    }

    public get hibernationWatcher(): WorkspaceHibernationWatcher {
        if (!this._hibernationWatcher) {
            this._hibernationWatcher = new WorkspaceHibernationWatcher(this.sessionController);
        }

        return this._hibernationWatcher;
    }

    public get intentsController(): IntentsController {
        if (!this._intentsController) {
            this._intentsController = new IntentsController(
                this.glueController,
                this.appDirectory,
                this
            );
        }

        return this._intentsController;
    }

    public get channelsController(): ChannelsController {
        if (!this._channelsController) {
            this._channelsController = new ChannelsController(
                this.glueController
            );
        }

        return this._channelsController;
    }

    public get framesController(): FramesController {
        if (!this._framesController) {
            this._framesController = new FramesController(
                this.sessionController,
                this.glueController,
                this
            );
        }

        return this._framesController;
    }

    public get idbStore(): IdbStore {
        if (!this._idbStore) {
            this._idbStore = new IdbStore();
        }

        return this._idbStore;
    }

    public get portsBridge(): PortsBridge {
        if (!this._portsBridge) {
            this._portsBridge = new PortsBridge(this.gateway, this.sessionController, this);
        }

        return this._portsBridge;
    }

    public createMessageChannel(): MessageChannel {
        return new MessageChannel();
    }
}
