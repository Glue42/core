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
import { LocalLayoutsMode } from "../libs/layouts/modes/local";
import { RemoteLayoutsMode } from "../libs/layouts/modes/remote";
import { SupplierLayoutsMode } from "../libs/layouts/modes/supplier";
import { IdbStore } from "../libs/layouts/modes/idbStore";
import { WorkspacesController } from "../libs/workspaces/controller";
import { FramesController } from "../libs/workspaces/frames";

export class IoC {
    private _gatewayInstance!: Gateway;
    private _platformInstance!: Platform;
    private _mainController!: PlatformController;
    private _glueController!: GlueController;
    private _portsBridge!: PortsBridge;
    private _windowsController!: WindowsController;
    private _applicationsController!: ApplicationsController;
    private _layoutsController!: LayoutsController;
    private _workspacesController!: WorkspacesController;
    private _sessionController!: SessionStorageController;
    private _stateChecker!: StateController;
    private _framesController!: FramesController;
    private _localLayoutsMode!: LocalLayoutsMode;
    private _remoteLayoutsMode!: RemoteLayoutsMode;
    private _supplierLayoutsMode!: SupplierLayoutsMode;
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
                this.glueController,
                this.windowsController,
                this.applicationsController,
                this.layoutsController,
                this.workspacesController,
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
                this
            );
        }

        return this._applicationsController;
    }

    public get layoutsController(): LayoutsController {
        if (!this._layoutsController) {
            this._layoutsController = new LayoutsController(
                this.glueController,
                this.localLayoutsMode,
                this.remoteLayoutsMode,
                this.supplierLayoutsMode
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
                this
            );
        }

        return this._workspacesController;
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

    public get localLayoutsMode(): LocalLayoutsMode {
        if (!this._localLayoutsMode) {
            this._localLayoutsMode = new LocalLayoutsMode(this.idbStore);
        }

        return this._localLayoutsMode;
    }

    public get remoteLayoutsMode(): RemoteLayoutsMode {
        if (!this._remoteLayoutsMode) {
            this._remoteLayoutsMode = new RemoteLayoutsMode();
        }

        return this._remoteLayoutsMode;
    }

    public get supplierLayoutsMode(): SupplierLayoutsMode {
        if (!this._supplierLayoutsMode) {
            this._supplierLayoutsMode = new SupplierLayoutsMode(this.sessionController);
        }

        return this._supplierLayoutsMode;
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
