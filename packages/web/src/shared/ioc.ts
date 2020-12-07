import { WebWindowModel } from "../windows/webWindow";
import { LibController, LibDomains } from "./types";
import { WindowsController } from "../windows/controller";
import { Glue42Core } from "@glue42/core";
import { GlueBridge } from "../communication/bridge";
import { AppManagerController } from "../appManager/controller";
import { WindowProjection } from "../windows/protocol";
import { ApplicationData, InstanceData } from "../appManager/protocol";
import { Glue42Web } from "../../web";
import { InstanceModel } from "../appManager/instance";
import { ApplicationModel } from "../appManager/application";
import { LayoutsController } from "../layouts/controller";
import { NotificationsController } from "../notifications/controller";


export class IoC {
    private _windowsControllerInstance!: WindowsController;
    private _appManagerControllerInstance!: AppManagerController;
    private _layoutsControllerInstance!: LayoutsController;
    private _notificationsControllerInstance!: NotificationsController;
    private _bridgeInstance!: GlueBridge;

    public controllers: { [key in LibDomains]: LibController } = {
        windows: this.windowsController,
        appManager: this.appManagerController,
        layouts: this.layoutsController,
        notifications: this.notificationsController
    }

    constructor(private readonly coreGlue: Glue42Core.GlueCore) { }

    public get windowsController(): WindowsController {
        if (!this._windowsControllerInstance) {
            this._windowsControllerInstance = new WindowsController();
        }

        return this._windowsControllerInstance;
    }

    public get appManagerController(): AppManagerController {
        if (!this._appManagerControllerInstance) {
            this._appManagerControllerInstance = new AppManagerController();
        }

        return this._appManagerControllerInstance;
    }

    public get layoutsController(): LayoutsController {
        if (!this._layoutsControllerInstance) {
            this._layoutsControllerInstance = new LayoutsController();
        }

        return this._layoutsControllerInstance;
    }

    public get notificationsController(): NotificationsController {
        if (!this._notificationsControllerInstance) {
            this._notificationsControllerInstance = new NotificationsController();
        }

        return this._notificationsControllerInstance;
    }

    public get bridge(): GlueBridge {
        if (!this._bridgeInstance) {
            this._bridgeInstance = new GlueBridge(this.coreGlue);
        }

        return this._bridgeInstance;
    }

    public async buildWebWindow(id: string, name: string): Promise<WindowProjection> {

        const model = new WebWindowModel(id, name, this.bridge);

        const api = await model.toApi();

        return { id, model, api };
    }

    public async buildApplication(app: ApplicationData): Promise<Glue42Web.AppManager.Application> {

        const application = (new ApplicationModel(app, [], this.appManagerController)).toApi();

        const instances = app.instances.map((instanceData) => this.buildInstance(instanceData, application));

        application.instances.push(...instances);

        return application;
    }

    public buildInstance(instanceData: InstanceData, app: Glue42Web.AppManager.Application): Glue42Web.AppManager.Instance {
        return (new InstanceModel(instanceData, this.bridge, app)).toApi();
    }
}