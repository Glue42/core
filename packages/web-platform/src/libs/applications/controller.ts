/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import { Glue42Core } from "@glue42/core";
import { generate } from "shortid";
import { Glue42WebPlatform } from "../../../platform";
import { ApplicationStartConfig, BridgeOperation, InternalApplicationsConfig, InternalPlatformConfig, LibController, SessionWindowData } from "../../common/types";
import { GlueController } from "../../controllers/glue";
import { SessionStorageController } from "../../controllers/session";
import { StateController } from "../../controllers/state";
import { IoC } from "../../shared/ioc";
import { PromiseWrap } from "../../shared/promisePlus";
import { getRelativeBounds, objEqual } from "../../shared/utils";
import { appHelloDecoder, appHelloSuccessDecoder, applicationStartConfigDecoder, appManagerOperationTypesDecoder, appRemoveConfigDecoder, appsExportOperationDecoder, appsImportOperationDecoder, basicInstanceDataDecoder, instanceDataDecoder } from "./decoders";
import { AppsImportOperation, AppHello, AppHelloSuccess, ApplicationData, AppManagerOperationTypes, BaseApplicationData, BasicInstanceData, InstanceData, InstanceLock, InstanceProcessInfo, AppsExportOperation, AppRemoveConfig } from "./types";
import logger from "../../shared/logger";
import { workspaceWindowDataDecoder } from "../workspaces/decoders";
import { simpleWindowDecoder } from "../windows/decoders";
import { WorkspaceWindowData } from "../workspaces/types";
import { SimpleWindowCommand, WindowTitleConfig } from "../windows/types";

export class ApplicationsController implements LibController {
    private applicationStartTimeoutMs = 15000;
    private started = false;
    private config!: InternalApplicationsConfig;
    private defaultBounds!: Glue42Web.Windows.Bounds;

    private locks: { [key: string]: InstanceLock } = {};

    private operations: { [key in AppManagerOperationTypes]: BridgeOperation } = {
        appHello: { name: "appHello", dataDecoder: appHelloDecoder, resultDecoder: appHelloSuccessDecoder, execute: this.handleAppHello.bind(this) },
        applicationStart: { name: "applicationStart", dataDecoder: applicationStartConfigDecoder, resultDecoder: instanceDataDecoder, execute: this.handleApplicationStart.bind(this) },
        instanceStop: { name: "instanceStop", dataDecoder: basicInstanceDataDecoder, execute: this.handleInstanceStop.bind(this) },
        registerWorkspaceApp: { name: "registerWorkspaceApp", dataDecoder: workspaceWindowDataDecoder, execute: this.registerWorkspaceApp.bind(this) },
        unregisterWorkspaceApp: { name: "unregisterWorkspaceApp", dataDecoder: simpleWindowDecoder, execute: this.unregisterWorkspaceApp.bind(this) },
        import: { name: "import", dataDecoder: appsImportOperationDecoder, execute: this.handleImport.bind(this) },
        remove: { name: "remove", dataDecoder: appRemoveConfigDecoder, execute: this.handleRemove.bind(this) },
        export: { name: "export", resultDecoder: appsExportOperationDecoder, execute: this.handleExport.bind(this) }
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

        this.logger?.trace("initializing applications");

        await this.setupApps(this.config);

        this.started = true;
        this.stateController.onWindowDisappeared(this.processInstanceClosed.bind(this));

        this.logger?.trace("initialization is completed");
    }

    public async setupApps(config: InternalApplicationsConfig): Promise<void> {
        if (config.local && config.local.length) {
            const parsedDefinitions: BaseApplicationData[] = config.local.map((def) => this.parseDefinition(def));

            const currentApps: BaseApplicationData[] = this.sessionStorage.getAllApps();

            this.mergeImport(currentApps, parsedDefinitions);
        }
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

    public async handleApplicationStart(config: ApplicationStartConfig, commandId: string): Promise<InstanceData> {

        this.logger?.trace(`[${commandId}] handling application start command for application: ${config.name}`);

        const appDefinition = this.sessionStorage.getAllApps().find((app) => app.name === config.name);

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

        const allInstances = this.sessionStorage.getAllInstancesData();

        const allAppsFull = this.sessionStorage.getAllApps().map<ApplicationData>((app) => {

            const appInstances = allInstances.filter((inst) => inst.applicationName === app.name);

            return Object.assign({}, app, { instances: appInstances });
        });

        if (helloMsg.windowId) {
            this.logger?.trace(`[${commandId}] there is a valid windowId, removing ${helloMsg.windowId} from the state controller`);
            this.stateController.remove(helloMsg.windowId);

            const foundApp = allAppsFull.find((app) => app.instances.some((inst) => inst.id === helloMsg.windowId));

            if (foundApp && foundApp.title) {

                const windowId: string = helloMsg.windowId;
                const title: string = foundApp.title;

                PromiseWrap<void>(() => this.glueController.callWindow<WindowTitleConfig, void>(this.ioc.windowsController.setTitleOperation, { windowId, title }, windowId), 20000)
                    .catch((err) => this.logger?.trace(`[${commandId}] error while setting the application instance title: ${err.message}`));
            }
        }

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

    public async handleImport(config: AppsImportOperation, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling import command`);

        const parsedDefinitions: BaseApplicationData[] = config.definitions.map((def) => this.parseDefinition(def));

        const currentApps: BaseApplicationData[] = this.sessionStorage.getAllApps();

        if (config.mode === "replace") {
            this.replaceImport(currentApps, parsedDefinitions);
            this.logger?.trace(`[${commandId}] replace import command completed`);
            return;
        }

        this.mergeImport(currentApps, parsedDefinitions);
        this.logger?.trace(`[${commandId}] merge import command completed`);

        return;
    }

    public async handleRemove(config: AppRemoveConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling remove command for ${config.name}`);

        const removed = this.sessionStorage.removeApp(config.name);

        if (removed) {
            this.logger?.trace(`definition ${removed.name} removed successfully`);
            this.emitStreamData("applicationRemoved", removed);
        }
    }

    public async handleExport(_: any, commandId: string): Promise<AppsExportOperation> {
        this.logger?.trace(`[${commandId}] handling export command`);
        const all = this.sessionStorage.getAllApps();

        const reversed = all.map((def) => this.reverseParseDefinition(def));

        return { definitions: reversed };
    }

    public mergeImport(currentApps: BaseApplicationData[], parsedDefinitions: BaseApplicationData[]): void {
        for (const definition of parsedDefinitions) {
            const defCurrentIdx = currentApps.findIndex((app) => app.name === definition.name);

            if (defCurrentIdx > -1 && !objEqual(definition, currentApps[defCurrentIdx])) {
                this.logger?.trace(`change detected at definition ${definition.name}`);
                this.emitStreamData("applicationChanged", definition);

                currentApps[defCurrentIdx] = definition;

                continue;
            }

            if (defCurrentIdx < 0) {
                this.logger?.trace(`new definition: ${definition.name} detected, adding and announcing`);
                this.emitStreamData("applicationAdded", definition);
                currentApps.push(definition);
            }
        }

        this.sessionStorage.overwriteApps(currentApps);
    }

    public replaceImport(currentApps: BaseApplicationData[], parsedDefinitions: BaseApplicationData[]): void {
        for (const definition of parsedDefinitions) {
            const defCurrentIdx = currentApps.findIndex((app) => app.name === definition.name);

            if (defCurrentIdx < 0) {
                this.logger?.trace(`new definition: ${definition.name} detected, adding and announcing`);
                this.emitStreamData("applicationAdded", definition);
                continue;
            }

            if (!objEqual(definition, currentApps[defCurrentIdx])) {
                this.logger?.trace(`change detected at definition ${definition.name}`);
                this.emitStreamData("applicationChanged", definition);
            }

            currentApps.splice(defCurrentIdx, 1);
        }

        // everything that is left in the old snap here, means it is removed in the latest one
        currentApps.forEach((app) => {
            this.logger?.trace(`definition ${app.name} missing, removing and announcing`);
            this.emitStreamData("applicationRemoved", app);
        });

        this.sessionStorage.overwriteApps(parsedDefinitions);
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

        if (!this.sessionStorage.getAllApps().some((app) => app.name === data.appName)) {
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

    private emitStreamData(operation: "applicationAdded" | "applicationRemoved" | "applicationChanged" | "instanceStarted" | "instanceStopped", data: any): void {
        this.logger?.trace(`sending notification of event: ${operation} with data: ${JSON.stringify(data)}`);
        this.glueController.pushSystemMessage("appManager", operation, data);
    }

    private reverseParseDefinition(definition: BaseApplicationData): Glue42Web.AppManager.Definition {

        const definitionDetails = definition.userProperties.details;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { details, ...removedDetails } = definition.userProperties;

        return {
            name: definition.name,
            title: definition.title,
            version: definition.version,
            icon: (definition as any).icon,
            caption: (definition as any).caption,
            details: definitionDetails,
            customProperties: removedDetails
        };
    }

    private parseDefinition(definition: Glue42Web.AppManager.Definition | Glue42WebPlatform.Applications.FDC3Definition): BaseApplicationData {

        const glue42CoreAppProps = ["name", "title", "version", "customProperties", "icon", "caption"];

        const userProperties = Object.fromEntries(Object.entries(definition).filter(([key]) => !glue42CoreAppProps.includes(key)));

        let createOptions: Glue42Web.AppManager.DefinitionDetails = { url: "" };

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
            createOptions = (definition as Glue42Web.AppManager.Definition).details;
        }

        const baseDefinition = {
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

        if (!baseDefinition.userProperties.details) {
            baseDefinition.userProperties.details = createOptions;
        }

        return baseDefinition;
    }

    private async getStartingBounds(appDefOptions: Glue42Web.AppManager.DefinitionDetails, openOptions: ApplicationStartConfig, commandId: string): Promise<Glue42Web.Windows.Bounds> {
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
