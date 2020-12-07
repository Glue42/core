/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import { Glue42Core } from "@glue42/core";
import { generate } from "shortid";
import { Glue42WebPlatform } from "../../../platform";
import { defaultFetchTimeoutMs } from "../../common/defaultConfig";
import { BridgeOperation, InternalApplicationsConfig, InternalPlatformConfig, LibController, ModeExecutor, SessionWindowData } from "../../common/types";
import { GlueController } from "../../controllers/glue";
import { SessionStorageController } from "../../controllers/session";
import { StateController } from "../../controllers/state";
import { appsCollectionDecoder } from "../../shared/decoders";
import { fetchTimeout } from "../../shared/fetchTimeout";
import { IoC } from "../../shared/ioc";
import { PromiseWrap } from "../../shared/promisePlus";
import { getRelativeBounds, objEqual } from "../../shared/utils";
import { appHelloDecoder, appHelloSuccessDecoder, applicationStartConfigDecoder, appManagerOperationTypesDecoder, basicInstanceDataDecoder, instanceDataDecoder } from "./decoders";
import { AppHello, AppHelloSuccess, ApplicationData, ApplicationStartConfig, AppManagerOperationTypes, BaseApplicationData, BasicInstanceData, InstanceData, InstanceLock, InstanceProcessInfo } from "./types";
import logger from "../../shared/logger";
import { workspaceWindowDataDecoder } from "../workspaces/decoders";
import { simpleWindowDecoder } from "../windows/decoders";
import { WorkspaceWindowData } from "../workspaces/types";
import { SimpleWindowCommand } from "../windows/types";

export class ApplicationsController implements LibController {
    private applicationStartTimeoutMs = 15000;
    private started = false;
    private config!: InternalApplicationsConfig;
    private applications: BaseApplicationData[] = [];
    private defaultBounds!: Glue42Web.Windows.Bounds;

    private locks: { [key: string]: InstanceLock } = {};

    private modesExecutors: { [key in "local" | "remote" | "supplier"]: ModeExecutor } = {
        local: { setup: this.setupLocalMode.bind(this) },
        remote: { setup: this.setupRemoteMode.bind(this) },
        supplier: { setup: this.setupSupplierMode.bind(this) }
    };

    private operations: { [key in AppManagerOperationTypes]: BridgeOperation } = {
        appHello: { name: "appHello", dataDecoder: appHelloDecoder, resultDecoder: appHelloSuccessDecoder, execute: this.handleAppHello.bind(this) },
        applicationStart: { name: "applicationStart", dataDecoder: applicationStartConfigDecoder, resultDecoder: instanceDataDecoder, execute: this.handleApplicationStart.bind(this) },
        instanceStop: { name: "instanceStop", dataDecoder: basicInstanceDataDecoder, execute: this.handleInstanceStop.bind(this) },
        registerWorkspaceApp: { name: "registerWorkspaceApp", dataDecoder: workspaceWindowDataDecoder, execute: this.registerWorkspaceApp.bind(this) },
        unregisterWorkspaceApp: { name: "unregisterWorkspaceApp", dataDecoder: simpleWindowDecoder, execute: this.unregisterWorkspaceApp.bind(this) }
    }

    constructor(
        private readonly glueController: GlueController,
        private readonly sessionStorage: SessionStorageController,
        private readonly stateController: StateController,
        private readonly ioc: IoC
    ) { }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("applications.controller");
    }

    public async start(config: InternalPlatformConfig): Promise<void> {
        this.config = config.applications;
        this.defaultBounds = config.windows.defaultWindowOpenBounds;

        this.logger?.trace(`initializing with mode: ${this.config.mode}`);

        await this.modesExecutors[this.config.mode].setup();

        this.started = true;
        this.stateController.onWindowDisappeared(this.processInstanceClosed.bind(this));

        this.logger?.trace("initialization is completed");
    }

    public async handleControl(args: any): Promise<void> {
        if (!this.started) {
            new Error("Cannot handle this windows control message, because the controller has not been started");
        }

        const applicationData = args.data;

        const commandId = args.commandId;

        const operationValidation = appManagerOperationTypesDecoder.run(args.operation);

        if (!operationValidation.ok) {
            throw new Error(`This appManager request cannot be completed, because the operation name did not pass validation: ${JSON.stringify(operationValidation.error)}`);
        }

        const operationName: AppManagerOperationTypes = operationValidation.result;

        const incomingValidation = this.operations[operationName].dataDecoder?.run(applicationData);

        if (incomingValidation && !incomingValidation.ok) {
            throw new Error(`AppManager request for ${operationName} rejected, because the provided arguments did not pass the validation: ${JSON.stringify(incomingValidation.error)}`);
        }

        this.logger?.debug(`[${commandId}] ${operationName} command is valid with data: ${JSON.stringify(applicationData)}`);

        const result = await this.operations[operationName].execute(applicationData, commandId);

        const resultValidation = this.operations[operationName].resultDecoder?.run(result);

        if (resultValidation && !resultValidation.ok) {
            throw new Error(`AppManager request for ${operationName} could not be completed, because the operation result did not pass the validation: ${JSON.stringify(resultValidation.error)}`);
        }

        this.logger?.trace(`[${commandId}] ${operationName} command was executed successfully`);

        return result;
    }

    public handleClientUnloaded(windowId: string, win: Window): void {
        this.logger?.trace(`handling unloading of ${windowId}`);

        if (!windowId) {
            return;
        }

        if (win.closed) {
            this.logger?.trace(`${windowId} detected as closed, processing instance closed`);
            return this.processInstanceClosed(windowId);
        }

        this.logger?.trace(`${windowId} detected as closed, skipping instance closed procedure`);
    }

    public unregisterWorkspaceApp(config: SimpleWindowCommand): void {
        this.processInstanceClosed(config.windowId);
        this.ioc.windowsController.cleanUpWindow(config.windowId);
    }

    private processInstanceClosed(selfWindowId?: string): void {
        if (!selfWindowId) {
            return;
        }

        const instanceData = this.sessionStorage.getInstanceData(selfWindowId);

        if (instanceData) {
            this.sessionStorage.removeInstance(instanceData.id);
            this.emitStreamData("instanceStopped", instanceData);
        }
    }

    private async handleApplicationStart(config: ApplicationStartConfig, commandId: string): Promise<InstanceData> {

        this.logger?.trace(`[${commandId}] handling application start command for application: ${config.name}`);

        const appDefinition = this.applications.find((app) => app.name === config.name);

        if (!appDefinition) {
            throw new Error(`Cannot start an instance of application: ${config.name}, because it is not found.`);
        }

        const instance: InstanceData = {
            id: generate(),
            applicationName: config.name
        };

        const openBounds = await this.getStartingBounds(appDefinition.createOptions, config, commandId);

        const options = `left=${openBounds.left},top=${openBounds.top},width=${openBounds.width},height=${openBounds.height}`;

        this.logger?.trace(`[${commandId}] open arguments are valid, opening to bounds: ${options}`);

        const childWindow = window.open(appDefinition.createOptions.url, instance.id, options);

        if (!childWindow) {
            throw new Error(`Cannot an instance with url: ${appDefinition.createOptions.url} for application: ${config.name}. The most likely reason is that the user has not approved popups or has a blocker.`);
        }

        this.sessionStorage.saveBridgeInstanceData({ windowId: instance.id, appName: instance.applicationName });

        this.logger?.trace(`[${commandId}] the new window has been opened successfully with id: ${instance.id}, checking for AGM ready and notifying windows`);

        if (config.waitForAGMReady) {
            this.logger?.trace(`[${commandId}] wait for AGM is set, configuring the lock`);
            this.setLock(instance.id);
        }

        await this.notifyWindows(instance, config.context, childWindow);

        if (this.locks[instance.id]) {
            try {
                await PromiseWrap(() => this.locks[instance.id]?.keyOne, this.applicationStartTimeoutMs);
            } catch (error) {
                throw new Error(`Application start for ${config.name} timed out waiting for client to initialize Glue`);
            }
        }

        this.logger?.trace(`[${commandId}] the windows controller has been successfully notified`);

        const processConfig: InstanceProcessInfo = {
            data: instance,
            monitorState: config.waitForAGMReady ? undefined : { child: childWindow },
            context: config.context
        };

        await this.processNewInstance(processConfig);

        this.logger?.trace(`[${commandId}] the new instance with id ${instance.id} has been saved, announced and context set, lifting key two and responding to caller`);

        this.locks[instance.id]?.openKeyTwo();

        return instance;
    }

    private async notifyWindows(instance: InstanceData, context?: any, child?: Window): Promise<void> {
        const windowData: SessionWindowData = {
            windowId: instance.id,
            name: `${instance.applicationName}_${instance.id}`
        };

        await this.ioc.windowsController.processNewWindow(windowData, context, child);
    }

    private async handleAppHello(helloMsg: AppHello, commandId: string): Promise<AppHelloSuccess> {

        this.logger?.trace(`[${commandId}] handling hello message for id: ${helloMsg.windowId}`);

        if (helloMsg.windowId && this.locks[helloMsg.windowId]) {
            this.logger?.trace(`[${commandId}] found an app lock, unlocking key one and waiting for the second one`);

            this.locks[helloMsg.windowId].openKeyOne();

            await this.locks[helloMsg.windowId].keyTwo;

            delete this.locks[helloMsg.windowId];

            this.logger?.trace(`[${commandId}] the lock is lifted, proceeding`);
        }

        if (helloMsg.windowId) {
            this.logger?.trace(`[${commandId}] there is a valid windowId, removing ${helloMsg.windowId} from the state controller`);
            this.stateController.remove(helloMsg.windowId);
        }

        const allInstances = this.sessionStorage.getAllInstancesData();

        const allAppsFull = this.applications.map<ApplicationData>((app) => {

            const appInstances = allInstances.filter((inst) => inst.applicationName === app.name);

            return Object.assign({}, app, { instances: appInstances });
        });

        const helloSuccessMessage = { apps: allAppsFull };

        this.logger?.trace(`[${commandId}] compiled a list of all active applications and instances and returning it to the caller`);

        return helloSuccessMessage;
    }

    private async handleInstanceStop(inst: BasicInstanceData, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling stop command for instance: ${inst.id}`);

        const workspaceClient = this.sessionStorage.getWorkspaceClientById(inst.id);

        if (workspaceClient) {
            this.logger?.trace(`[${commandId}] this instance is detected as a workspace window, closing via the workspaces controller`);

            await this.ioc.workspacesController.closeItem({ itemId: inst.id }, commandId);

            return;
        }

        const instanceData = this.sessionStorage.getInstanceData(inst.id);

        if (!instanceData) {
            throw new Error(`Cannot close instance: ${inst.id}, because it is not known by the platform`);
        }

        const windowData = this.sessionStorage.getWindowDataById(inst.id);

        if (!windowData) {
            throw new Error(`Cannot close instance: ${inst.id}, because it's window is not known by the platform`);
        }

        if (windowData.name === "Platform") {
            throw new Error("Closing the main application is not allowed");
        }

        window.open(undefined, windowData.windowId)?.close();

        this.processInstanceClosed(inst.id);

        this.ioc.windowsController.cleanUpWindow(inst.id);

        this.logger?.trace(`[${commandId}] instance ${inst.id} has been closed, removed from store, announced stopped and notified windows, responding to caller`);
    }

    private setLock(id: string): void {

        const lock: any = {};

        const keyOne = new Promise<void>((resolve) => {
            lock.openKeyOne = resolve;
        });

        const keyTwo = new Promise<void>((resolve) => {
            lock.openKeyTwo = resolve;
        });

        lock.keyOne = keyOne;
        lock.keyTwo = keyTwo;

        this.locks[id] = lock;
    }

    private async registerWorkspaceApp(data: WorkspaceWindowData, commandId: string): Promise<void> {
        if (!data.appName) {
            throw new Error(`Cannot register application with config: ${JSON.stringify(data)}, because no app name was found`);
        }

        if (!this.applications.some((app) => app.name === data.appName)) {
            throw new Error(`Cannot register application with config: ${JSON.stringify(data)}, because no app with this name name was found`);
        }

        this.sessionStorage.saveBridgeInstanceData({ windowId: data.windowId, appName: data.appName });

        this.logger?.trace(`[${commandId}] processing valid workspace application registration with id ${data.windowId}, app name ${data.appName} and frame ${data.frameId}`);

        if (data.context) {
            await this.glueController.setInstanceStartContext(data.windowId, data.context);
        }

        const instanceData: InstanceData = { id: data.windowId, applicationName: data.appName };

        this.sessionStorage.saveInstanceData(instanceData);

        this.emitStreamData("instanceStarted", instanceData);

        this.logger?.trace(`[${commandId}] instance registration is completed and announced, calling windows registration`);

        await this.ioc.windowsController.registerWorkspaceWindow(data, commandId);
    }

    private async processNewInstance(config: InstanceProcessInfo): Promise<void> {
        if (config.context) {
            await this.glueController.setInstanceStartContext(config.data.id, config.context);
        }

        this.sessionStorage.saveInstanceData(config.data);

        if (config.monitorState) {
            this.stateController.add(config.monitorState.child, config.data.id);
        }

        this.emitStreamData("instanceStarted", config.data);
    }

    private async setupLocalMode(): Promise<void> {
        const parsedDefinitions = this.config.local.map((def) => this.parseDefinition(def));

        this.applications.push(...parsedDefinitions);

        this.logger?.trace(`simple local mode is configured with applications: ${this.applications.map((app) => app.name).join(", ")}`);
    }

    private emitStreamData(operation: "applicationAdded" | "applicationRemoved" | "applicationChanged" | "instanceStarted" | "instanceStopped", data: any): void {
        this.logger?.trace(`sending notification of event: ${operation} with data: ${JSON.stringify(data)}`);
        this.glueController.pushSystemMessage("appManager", operation, data);
    }

    private async setupRemoteMode(): Promise<void> {
        const store = this.config.remote;

        if (!store) {
            throw new Error("Cannot initiate the Applications lib, because the selected mode is remote, but there is no remote store definition");
        }

        this.logger?.trace(`setting up remote mode for store at: ${store.url}`);

        const fetchFunc = this.getRemoteStoreFetchFunc(store.url);

        let apps: BaseApplicationData[];

        try {
            apps = await fetchFunc();
            this.logger?.trace(`initial apps fetch successful, saving ${apps.map((a) => a.name).join(", ")}`);
        } catch (error) {
            const errorString = JSON.stringify(error);
            this.logger?.trace(`Cannot initiate the AppManager, because the provided remote store threw: ${errorString}`);
            throw new Error(`Cannot initiate the AppManager, because the provided remote store threw: ${errorString}`);
        }

        this.applications.push(...apps);

        if (store.pollingInterval) {
            this.logger?.trace(`polling interval detected at ${store.pollingInterval}, setting up`);

            await this.wait(store.pollingInterval);
            this.pollForDefinitions(fetchFunc, store.pollingInterval, store.requestTimeout);
        }
    }

    private async setupSupplierMode(): Promise<void> {
        const supplier = this.config.supplier;

        if (!supplier) {
            throw new Error("Cannot initiate the Applications lib, because the selected mode is supplier, but there is no supplier definition");
        }

        this.logger?.trace("setting up supplier mode");

        const fetchFunc = this.getSupplierFetchFunc(supplier.fetch);
        let apps: BaseApplicationData[];

        try {
            apps = await fetchFunc();
            this.logger?.trace(`initial apps fetch successful, saving ${apps.map((a) => a.name).join(", ")}`);
        } catch (error) {
            const errorString = JSON.stringify(error);
            this.logger?.trace(`Cannot initiate the AppManager, because the provided supplier threw: ${errorString}`);
            throw new Error(`Cannot initiate the AppManager, because the provided supplier threw: ${errorString}`);
        }

        this.applications.push(...apps);

        if (supplier.pollingInterval) {
            this.logger?.trace(`polling interval detected at ${supplier.pollingInterval}, setting up`);

            await this.wait(supplier.pollingInterval);
            this.pollForDefinitions(fetchFunc, supplier.pollingInterval, supplier.timeout);
        }
    }

    private parseDefinition(definition: Glue42WebPlatform.Applications.Glue42CoreDefinition | Glue42WebPlatform.Applications.FDC3Definition): BaseApplicationData {

        const glue42CoreAppProps = ["name", "title", "version", "customProperties", "icon", "caption"];

        const userProperties = Object.fromEntries(Object.entries(definition).filter(([key]) => !glue42CoreAppProps.includes(key)));

        let createOptions: Glue42WebPlatform.Applications.CreateOptions = { url: "" };

        if ((definition as any).manifest) {
            // this is fdc3
            const parsedManifest = JSON.parse((definition as Glue42WebPlatform.Applications.FDC3Definition).manifest);

            const url = parsedManifest.details?.url || parsedManifest.url;

            if (!url || typeof url !== "string") {
                throw new Error(`The FDC3 definition: ${definition.name} is not valid, because there is not url defined in the manifest`);
            }

            createOptions.url = url;
        } else {
            // this is GD
            createOptions = (definition as Glue42WebPlatform.Applications.Glue42CoreDefinition).details;
        }

        return {
            createOptions,
            name: definition.name,
            title: definition.title,
            version: definition.version,
            icon: (definition as any).icon,
            caption: (definition as any).caption,
            userProperties: {
                ...userProperties,
                ...(definition as any).customProperties
            }
        };
    }

    private async pollForDefinitions(getDefs: () => Promise<BaseApplicationData[]>, intervalMs: number, timeoutMs: number = defaultFetchTimeoutMs): Promise<void> {
        this.logger?.trace("polling for new definitions");

        let parsedDefinitions: BaseApplicationData[];

        try {
            parsedDefinitions = await PromiseWrap(getDefs, timeoutMs, "Timeout of new definitions fetch reached!");

        } catch (error) {
            this.logger?.trace(`Polling for new definitions failed, because of: ${JSON.stringify(error)}`);

            await this.wait(intervalMs);

            this.pollForDefinitions(getDefs, timeoutMs, intervalMs);

            return;
        }

        for (const definition of parsedDefinitions) {
            const defCurrentIdx = this.applications.findIndex((app) => app.name === definition.name);

            if (defCurrentIdx < 0) {
                this.logger?.trace(`new definition: ${definition.name} detected, adding and announcing`);
                this.emitStreamData("applicationAdded", definition);
                continue;
            }

            if (!objEqual(definition, this.applications[defCurrentIdx])) {
                this.logger?.trace(`change detected at definition ${definition.name}`);
                this.emitStreamData("applicationChanged", definition);
            }

            this.applications.splice(defCurrentIdx, 1);
        }

        // everything that is left in the old snap here, means it is removed in the latest one
        this.applications.forEach((app) => {
            this.logger?.trace(`definition ${app.name} missing, removing and announcing`);
            this.emitStreamData("applicationRemoved", app);
        });

        this.applications = parsedDefinitions;

        this.logger?.trace("poll completed, setting next");
        await this.wait(intervalMs);

        this.pollForDefinitions(getDefs, timeoutMs, intervalMs);
    }

    private getRemoteStoreFetchFunc(url: string): () => Promise<BaseApplicationData[]> {
        return async (): Promise<BaseApplicationData[]> => {
            const response = await fetchTimeout(url);

            const responseJSON = await response.json();

            if (!responseJSON || !responseJSON.message || responseJSON.message !== "OK") {
                throw new Error("The remote store did not respond with an OK message");
            }

            const apps = responseJSON.applications;

            if (!apps || !Array.isArray(apps)) {
                throw new Error("The remote store did not respond with valid applications collection");
            }

            const verifiedApps = appsCollectionDecoder.runWithException(apps);

            return verifiedApps.map((app) => this.parseDefinition(app));
        };
    }

    private getSupplierFetchFunc(supplierFetch: () => Promise<Array<Glue42WebPlatform.Applications.Glue42CoreDefinition | Glue42WebPlatform.Applications.FDC3Definition>>): () => Promise<BaseApplicationData[]> {
        return async (): Promise<BaseApplicationData[]> => {
            const apps = await supplierFetch();

            if (!apps || !Array.isArray(apps)) {
                throw new Error("The remote store did not respond with valid applications collection");
            }

            const verifiedApps = appsCollectionDecoder.runWithException(apps);

            return verifiedApps.map((app) => this.parseDefinition(app));
        };
    }

    private wait(timeMs: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, timeMs));
    }

    private async getStartingBounds(appDefOptions: Glue42WebPlatform.Applications.CreateOptions, openOptions: ApplicationStartConfig, commandId: string): Promise<Glue42Web.Windows.Bounds> {
        const openBounds = Object.assign(
            {},
            this.defaultBounds,
            { top: appDefOptions.top, left: appDefOptions.left, width: appDefOptions.width, height: appDefOptions.height },
            { top: openOptions.top, left: openOptions.left, width: openOptions.width, height: openOptions.height }
        );

        if (!openOptions.relativeTo) {
            return openBounds;
        }

        try {
            const relativeWindowBounds = await this.ioc.windowsController.getWindowBounds(openOptions.relativeTo, commandId);

            const relativeDir = openOptions.relativeDirection ?? "right";

            const newBounds = getRelativeBounds(openBounds, relativeWindowBounds, relativeDir);

            return newBounds;
        } catch (error) {
            return openBounds;
        }
    }
}
