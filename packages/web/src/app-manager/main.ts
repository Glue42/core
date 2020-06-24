import { Glue42Web } from "../../web";
import { AppManagerConfig, Glue42CoreApplicationConfig, FDC3ApplicationConfig, RemoteSource } from "../glue.config";
import { default as CallbackRegistryFactory, CallbackRegistry, UnsubscribeFunction } from "callback-registry";
import { fetchTimeout } from "../utils";
import { Application } from "./application";
import { RemoteInstance } from "./instance";
import { LocalInstance } from "./my";
import { Control } from "../control/control";
import { Windows } from "../windows/main";
import { AppProps } from "./types";

export class AppManager implements Glue42Web.AppManager.API {
    private _apps: {
        [key: string]: {
            source: string;
            application: Glue42Web.AppManager.Application;
            appProps: AppProps;
        };
    } = {};
    private _myInstance: LocalInstance | undefined;
    private _instances: RemoteInstance[] = [];
    private registry: CallbackRegistry = CallbackRegistryFactory();

    private DEFAULT_POLLING_INTERVAL = 3000;
    private OKAY_MESSAGE = "OK";
    private LOCAL_SOURCE = "LOCAL_SOURCE";

    constructor(private windows: Windows, private interop: Glue42Web.Interop.API, private control: Control, private config?: AppManagerConfig, private appName?: string) {
        if (config?.remoteSources) {
            this.subscribeForRemoteApplications(config.remoteSources);
        }
        if (config?.localApplications) {
            const validatedApplications = this.getValidatedApplications(config.localApplications);

            this.addApplications(validatedApplications);
        }
        control.onStart(() => {
            this.trackInstanceLifetime();
        });
    }

    get myInstance(): LocalInstance {
        if (!this.appName) {
            // tslint:disable-next-line:no-console
            console.warn("application wasn't provided to the GlueWeb factory function!");
        }
        if (!this._myInstance) {
            // tslint:disable-next-line:no-console
            console.warn("The application isn't defined in any of the local/remote application sources!");
        }

        return this._myInstance as LocalInstance;
    }

    public application(name: string): Glue42Web.AppManager.Application {
        return this._apps[name].application;
    }

    public applications(): Glue42Web.AppManager.Application[] {
        return Object.keys(this._apps).map((appName) => this._apps[appName].application);
    }

    public instances(): Glue42Web.AppManager.Instance[] {
        return this._instances;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onAppAdded(callback: (app: Glue42Web.AppManager.Application) => any): UnsubscribeFunction {
        const applications = Object.keys(this._apps).map((appName) => {
            return this._apps[appName].application;
        });

        this.replay(applications, callback);
        return this.registry.add("appAdded", callback);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onAppRemoved(callback: (app: Glue42Web.AppManager.Application) => any): UnsubscribeFunction {
        return this.registry.add("appRemoved", callback);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onAppChanged(callback: (app: Glue42Web.AppManager.Application) => any): UnsubscribeFunction {
        return this.registry.add("appChanged", callback);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onInstanceStarted(callback: (app: Glue42Web.AppManager.Instance) => any): UnsubscribeFunction {
        return this.registry.add("instanceStarted", callback);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onInstanceStopped(callback: (app: Glue42Web.AppManager.Instance) => any): UnsubscribeFunction {
        return this.registry.add("instanceStopped", callback);
    }

    private validateFDC3ApplicationConfig(application: FDC3ApplicationConfig): boolean {
        if (typeof application.name !== "string" ||
            (typeof application.title !== "undefined" && typeof application.title !== "string") ||
            (typeof application.version !== "undefined" && typeof application.version !== "string") ||
            !application.appId ||
            typeof application.appId !== "string" ||
            typeof application.manifest !== "object" ||
            typeof application.manifestType !== "string" ||
            (typeof application.tooltip !== "undefined" && typeof application.tooltip !== "string") ||
            (typeof application.description !== "undefined" && typeof application.description !== "string") ||
            (typeof application.contactEmail !== "undefined" && typeof application.contactEmail !== "string") ||
            (typeof application.supportEmail !== "undefined" && typeof application.supportEmail !== "string") ||
            (typeof application.publisher !== "undefined" && typeof application.publisher !== "string") ||
            (typeof application.images !== "undefined" && (!Array.isArray(application.images) || application.images.some((image) => typeof image.url !== "string"))) ||
            (typeof application.icons !== "undefined" && (!Array.isArray(application.icons) || application.icons.some((icon) => typeof icon.icon !== "string"))) ||
            (typeof application.intents !== "undefined" && (!Array.isArray(application.intents) || application.intents.some((intent) => typeof intent.name !== "string" ||
                (typeof intent.displayName !== "undefined" && typeof intent.displayName !== "string") ||
                (typeof intent.contexts !== "undefined" && (!Array.isArray(intent.contexts) || intent.contexts.some((intentContext) => typeof intentContext !== "string"))))))
        ) {
            return false;
        }

        return true;
    }

    private validateGlue42CoreApplicationConfig(application: Glue42CoreApplicationConfig): boolean {
        if (typeof application.name !== "string" ||
            (typeof application.title !== "undefined" && typeof application.title !== "string") ||
            (typeof application.version !== "undefined" && typeof application.version !== "string") ||
            typeof application.details !== "object" ||
            typeof application.details.url !== "string" ||
            (typeof application.details.top !== "undefined" && typeof application.details.top !== "number") ||
            (typeof application.details.left !== "undefined" && typeof application.details.left !== "number") ||
            (typeof application.details.width !== "undefined" && typeof application.details.width !== "number") ||
            (typeof application.details.height !== "undefined" && typeof application.details.height !== "number") ||
            (typeof application.details.relativeTo !== "undefined" && typeof application.details.relativeTo !== "string") ||
            (typeof application.details.relativeDirection !== "undefined" && !["top", "left", "right", "bottom"].includes(application.details.relativeDirection))
        ) {
            return false;
        }

        return true;
    }

    private getValidatedApplications(applications: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>): Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig> {
        const verifiedApplications = applications.filter((application) => {
            const isFDC3App = typeof (application as FDC3ApplicationConfig).manifest !== "undefined";

            let isValid: boolean;

            if (isFDC3App) {
                isValid = this.validateFDC3ApplicationConfig(application as FDC3ApplicationConfig);
            } else {
                isValid = this.validateGlue42CoreApplicationConfig(application as Glue42CoreApplicationConfig);
            }

            if (!isValid) {
                // tslint:disable-next-line:no-console
                console.warn(`Validation failed for application "${application.name}"!`);
            }

            return isValid;
        });

        return verifiedApplications;
    }

    private subscribeForRemoteApplications(remoteSources: RemoteSource[]): void {
        for (const remoteSource of remoteSources) {
            const url = remoteSource.url;

            const fetchApps = (): void => {
                fetchTimeout(url)
                    .then((response) => {
                        return response.json();
                    })
                    .then((json: { message: string; applications: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig> }) => {
                        if (json.message === this.OKAY_MESSAGE) {
                            const validatedApplications = this.getValidatedApplications(json.applications);

                            this.addApplications(validatedApplications, url);
                        }
                    })
                    .catch((error) => {
                        // tslint:disable-next-line:no-console
                        console.warn(error);
                    });
            };

            fetchApps();

            setInterval(fetchApps, remoteSource.pollingInterval || this.DEFAULT_POLLING_INTERVAL);
        }
    }

    private getAppProps(application: Glue42CoreApplicationConfig | FDC3ApplicationConfig): AppProps {
        const requiredProps = ["name", "title", "version"];

        const userProperties = Object.fromEntries(Object.entries(application).filter(([key]) => !requiredProps.includes(key)));

        return {
            name: application.name,
            title: application.title,
            version: application.version,
            userProperties
        };
    }

    private handleAppsChanged(newlyAddedApplications: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>, source?: string): void {
        for (const newlyAddedApplication of newlyAddedApplications) {
            const currentApplicationWithTheSameNameAndSource = Object.keys(this._apps).find((appName) => {
                return appName === newlyAddedApplication.name && this._apps[appName].source === source;
            });
            const currentApplicationWithTheSameNameButDifferentSource = Object.keys(this._apps).find((appName) => {
                return appName === newlyAddedApplication.name && this._apps[appName].source !== source;
            });

            if (currentApplicationWithTheSameNameAndSource) {
                const currentApplication = this._apps[currentApplicationWithTheSameNameAndSource];

                const appProps = this.getAppProps(newlyAddedApplication);

                if (JSON.stringify(currentApplication.appProps) !== JSON.stringify(appProps)) {
                    const newlyAddedApplicationInstance = new Application(this, appProps, this.windows);

                    this.registry.execute("appChanged", newlyAddedApplicationInstance);

                    this._apps[newlyAddedApplication.name] = {
                        source: currentApplication.source,
                        application: newlyAddedApplicationInstance,
                        appProps
                    };
                }
            } else if (currentApplicationWithTheSameNameButDifferentSource) {
                // tslint:disable-next-line:no-console
                console.warn(`Application "${newlyAddedApplication.name}" already defined by source "${this._apps[currentApplicationWithTheSameNameButDifferentSource].source}". Skipping application definition from source ${source}.`);
            }
        }
    }

    private handleAppsAdded(newlyAddedApplications: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>, source?: string): void {
        const currentAppNames = Object.keys(this._apps);
        const newApplications = newlyAddedApplications.filter((newlyAddedApplication) => {
            return !currentAppNames.includes(newlyAddedApplication.name);
        });

        for (const newApplication of newApplications) {
            const appProps = this.getAppProps(newApplication);

            const newApplicationInstance = new Application(this, appProps, this.windows);

            this.registry.execute("appAdded", newApplicationInstance);

            this._apps[newApplication.name] = {
                source: source || this.LOCAL_SOURCE,
                application: newApplicationInstance,
                appProps
            };
        }
    }

    private handleAppsRemoved(newlyAddedApplications: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>, source?: string): void {
        const currentApplicationsFromThisSource = Object.keys(this._apps)
            .filter((appName) => {
                return this._apps[appName].source === source;
            })
            .map((appName) => {
                return this._apps[appName].application;
            });
        const newlyAddedApplicationNames = newlyAddedApplications.map((newlyAddedApplication) => {
            return newlyAddedApplication.name;
        });
        const removedApplications = currentApplicationsFromThisSource.filter((currentApplicationFromThisSource) => {
            return !newlyAddedApplicationNames.includes(currentApplicationFromThisSource.name);
        });

        for (const removedApplication of removedApplications) {
            this.registry.execute("appRemoved", removedApplication);
            delete this._apps[removedApplication.name];
        }
    }

    private populateMyInstance(): void {
        if (this.appName && this._apps[this.appName] && this._apps[this.appName].application) {
            const myId = this.interop.instance.instance as string;

            const myApp = this._apps[this.appName].application;

            if (myApp.title) {
                document.title = myApp.title;
            }

            this._myInstance = new LocalInstance(myId, myApp, this.control, this);
        }
    }

    private addApplications(newlyAddedApplications: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>, source?: string): void {
        // Changed.
        this.handleAppsChanged(newlyAddedApplications, source);

        // Added.
        this.handleAppsAdded(newlyAddedApplications, source);

        // Removed.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.handleAppsRemoved(newlyAddedApplications, source);

        if (!this._myInstance) {
            this.populateMyInstance();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private replay(items: { [key: string]: any } | any[], callback: (item: any) => any): void {
        const itemsToReplay = Array.isArray(items) ? items : Object.values(items);

        itemsToReplay.forEach((item) => callback(item));
    }

    private async remoteFromServer(server: Glue42Web.Interop.Instance): Promise<RemoteInstance | undefined> {
        const serverApp = server.application;

        if (!server.instance || !serverApp || !this._apps[serverApp]) {
            return undefined;
        }

        const id = server.instance;
        const app = this._apps[serverApp].application;
        const appWindow = this.windows.list().find((window) => window.id === server.windowId);
        const context = await appWindow?.getContext();

        return new RemoteInstance(id, app, this.control, context);
    }

    private trackInstanceLifetime(): void {
        // Whenever a new control method appears we have a new Glue42 Core instance in our environment.
        this.interop.serverMethodAdded(async ({ server, method }) => {
            if (method.name !== Control.CONTROL_METHOD) {
                return;
            }

            const remoteInstance = await this.remoteFromServer(server);

            if (remoteInstance) {
                this._instances.push(remoteInstance);
                this.registry.execute("instanceStarted", remoteInstance);
            }
        });

        // Whenever a control method is removed we have a removed Glue42 Core instance from our environment.
        this.interop.serverRemoved(async (server) => {
            const remoteInstance = await this.remoteFromServer(server);

            if (remoteInstance) {
                this._instances = this._instances.filter((instance) => instance.id !== remoteInstance.id);
                this.registry.execute("instanceStopped", remoteInstance);
            }
        });
    }
}
