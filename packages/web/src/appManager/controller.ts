/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { Glue42Web } from "../../web";
import { GlueBridge } from "../communication/bridge";
import { applicationDefinitionDecoder, appManagerOperationTypesDecoder, nonEmptyStringDecoder } from "../shared/decoders";
import { IoC } from "../shared/ioc";
import { LibController } from "../shared/types";
import { WindowHello } from "../windows/protocol";
import { AppsImportOperation, AppHelloSuccess, ApplicationData, ApplicationStartConfig, AppRemoveConfig, InstanceData, operations, BaseApplicationData } from "./protocol";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";

export class AppManagerController implements LibController {
    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private ioc!: IoC;
    private bridge!: GlueBridge;
    private publicWindowId!: string;
    private actualWindowId: string | undefined;
    private me: Glue42Web.AppManager.Instance | undefined;
    private applications: Glue42Web.AppManager.Application[] = [];
    private instances: Glue42Web.AppManager.Instance[] = [];
    private platformRegistration!: Promise<void>;
    private logger!: Glue42Web.Logger.API;

    public async start(coreGlue: Glue42Core.GlueCore, ioc: IoC): Promise<void> {
        this.logger = coreGlue.logger.subLogger("appManger.controller.web");

        this.logger.trace("starting the web appManager controller");

        this.publicWindowId = (coreGlue as any).connection.transport.publicWindowId;
        this.actualWindowId = coreGlue.interop.instance.windowId;

        this.addOperationsExecutors();

        this.ioc = ioc;
        this.bridge = ioc.bridge;

        this.platformRegistration = this.registerWithPlatform();

        await this.platformRegistration;

        this.logger.trace("registration with the platform successful, attaching the appManager property to glue and returning");

        const api = this.toApi();

        (coreGlue as Glue42Web.API).appManager = api;
    }

    public async handleBridgeMessage(args: any): Promise<void> {
        await this.platformRegistration;

        const operationName = appManagerOperationTypesDecoder.runWithException(args.operation);

        const operation = operations[operationName];

        if (!operation.execute) {
            return;
        }

        let operationData: any = args.data;

        if (operation.dataDecoder) {
            operationData = operation.dataDecoder.runWithException(args.data);
        }

        return await operation.execute(operationData);
    }

    public onInstanceStarted(callback: (instance: Glue42Web.AppManager.Instance) => any): UnsubscribeFunction {
        return this.registry.add("instance-started", callback, this.instances);
    }

    public onInstanceStopped(callback: (instance: Glue42Web.AppManager.Instance) => any): UnsubscribeFunction {
        return this.registry.add("instance-stopped", callback);
    }

    public async startApplication(appName: string, context?: object, options?: Glue42Web.AppManager.ApplicationStartOptions): Promise<Glue42Web.AppManager.Instance> {
        const startOptions: ApplicationStartConfig = {
            name: appName,
            waitForAGMReady: options?.waitForAGMReady ?? true,
            context,
            top: options?.top,
            left: options?.left,
            width: options?.width,
            height: options?.height,
            relativeTo: options?.relativeTo,
            relativeDirection: options?.relativeDirection
        };

        const openResult = await this.bridge.send<ApplicationStartConfig, InstanceData>("appManager", operations.applicationStart, startOptions);

        const app = this.applications.find((a) => a.name === openResult.applicationName) as Glue42Web.AppManager.Application;

        return this.ioc.buildInstance(openResult, app);
    }

    private toApi(): Glue42Web.AppManager.API {
        const api: Glue42Web.AppManager.API = {
            myInstance: this.me as unknown as Glue42Web.AppManager.Instance,
            import: this.import.bind(this),
            remove: this.remove.bind(this),
            export: this.export.bind(this),
            application: this.getApplication.bind(this),
            applications: this.getApplications.bind(this),
            instances: this.getInstances.bind(this),
            onAppAdded: this.onAppAdded.bind(this),
            onAppChanged: this.onAppChanged.bind(this),
            onAppRemoved: this.onAppRemoved.bind(this),
            onInstanceStarted: this.onInstanceStarted.bind(this),
            onInstanceStopped: this.onInstanceStopped.bind(this)
        };

        return Object.freeze(api);
    }

    private addOperationsExecutors(): void {
        operations.applicationAdded.execute = this.handleApplicationAddedMessage.bind(this);
        operations.applicationRemoved.execute = this.handleApplicationRemovedMessage.bind(this);
        operations.applicationChanged.execute = this.handleApplicationChangedMessage.bind(this);
        operations.instanceStarted.execute = this.handleInstanceStartedMessage.bind(this);
        operations.instanceStopped.execute = this.handleInstanceStoppedMessage.bind(this);
    }

    private onAppAdded(callback: (app: Glue42Web.AppManager.Application) => any): UnsubscribeFunction {
        return this.registry.add("application-added", callback, this.applications);
    }

    private onAppRemoved(callback: (app: Glue42Web.AppManager.Application) => any): UnsubscribeFunction {
        return this.registry.add("application-removed", callback);
    }

    private onAppChanged(callback: (app: Glue42Web.AppManager.Application) => any): UnsubscribeFunction {
        return this.registry.add("application-changed", callback);
    }


    private async handleApplicationAddedMessage(appData: BaseApplicationData): Promise<void> {

        if (this.applications.some((app) => app.name === appData.name)) {
            return;
        }

        const app = await this.ioc.buildApplication(appData, []);

        const instances = this.instances.filter((instance) => instance.application.name === app.name);

        app.instances.push(...instances);

        this.applications.push(app);

        this.registry.execute("application-added", app);
    }

    private async handleApplicationRemovedMessage(appData: BaseApplicationData): Promise<void> {
        const appIndex = this.applications.findIndex((app) => app.name === appData.name);

        if (appIndex < 0) {
            return;
        }

        const app = this.applications[appIndex];

        this.applications.splice(appIndex, 1);

        this.registry.execute("application-removed", app);
    }

    private async handleApplicationChangedMessage(appData: BaseApplicationData): Promise<void> {
        const app = this.applications.find((app) => app.name === appData.name);

        if (!app) {
            return this.handleApplicationAddedMessage(appData);
        }

        app.title = appData.title as string;
        app.version = appData.version as string;
        app.icon = appData.icon as string;
        app.caption = appData.caption as string;
        app.userProperties = appData.userProperties;

        this.registry.execute("application-changed", app);
    }

    private async handleInstanceStartedMessage(instanceData: InstanceData): Promise<void> {
        if (this.instances.some((instance) => instance.id === instanceData.id)) {
            return;
        }

        const application = this.applications.find((app) => app.name === instanceData.applicationName);

        if (!application) {
            throw new Error(`Cannot add instance: ${instanceData.id}, because there is no application definition associated with it`);
        }

        const instance = this.ioc.buildInstance(instanceData, application);

        this.instances.push(instance);
        application.instances.push(instance);

        this.registry.execute("instance-started", instance);
    }

    private async handleInstanceStoppedMessage(instanceData: InstanceData): Promise<void> {
        const instance = this.instances.find((i) => i.id === instanceData.id);

        if (instance) {
            const instIdx = this.instances.findIndex((inst) => inst.id === instanceData.id);
            this.instances.splice(instIdx, 1);
        }

        const application = this.applications.find((app) => app.instances.some((inst) => inst.id === instanceData.id));

        if (application) {
            const instIdxApps = application.instances.findIndex((inst) => inst.id === instanceData.id);
            application.instances.splice(instIdxApps, 1);
        }

        if (!instance) {
            return;
        }

        this.registry.execute("instance-stopped", instance);
    }

    private async import(definitions: Glue42Web.AppManager.Definition[], mode: "replace" | "merge" = "replace"): Promise<void> {
        await this.bridge.send<AppsImportOperation, void>("appManager", operations.import, { definitions, mode });
    }

    private async remove(name: string): Promise<void> {
        nonEmptyStringDecoder.runWithException(name);

        await this.bridge.send<AppRemoveConfig, void>("appManager", operations.remove, { name });
    }

    private async export(): Promise<Glue42Web.AppManager.Definition[]> {

        const response = await this.bridge.send<void, AppsImportOperation>("appManager", operations.export, undefined);

        return response.definitions;
    }

    private getApplication(name: string): Glue42Web.AppManager.Application {
        const verifiedName = nonEmptyStringDecoder.runWithException(name);

        return this.applications.find((app) => app.name === verifiedName) as Glue42Web.AppManager.Application;
    }

    private getApplications(): Glue42Web.AppManager.Application[] {
        return this.applications.slice();
    }

    private getInstances(): Glue42Web.AppManager.Instance[] {
        return this.instances.slice();
    }

    private async registerWithPlatform(): Promise<void> {
        const result = await this.bridge.send<WindowHello, AppHelloSuccess>("appManager", operations.appHello, { windowId: this.actualWindowId });

        this.logger.trace("the platform responded to the hello message with a full list of apps");

        this.applications = await Promise.all(result.apps.map((app) => this.ioc.buildApplication(app, app.instances)));

        this.instances = this.applications.reduce<Glue42Web.AppManager.Instance[]>((instancesSoFar, app) => {

            instancesSoFar.push(...app.instances);

            return instancesSoFar;
        }, []);

        this.me = this.findMyInstance();

        this.logger.trace(`all applications were parsed and saved. I am ${this.me ? "NOT a" : "a"} valid instance`);
    }

    private findMyInstance(): Glue42Web.AppManager.Instance | undefined {
        for (const app of this.applications) {
            const foundInstance = app.instances.find((instance) => instance.id === this.publicWindowId);

            if (foundInstance) {
                return foundInstance;
            }
        }
    }
}
