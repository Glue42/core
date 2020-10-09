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
import { fdc3ApplicationConfigDecoder, glue42CoreApplicationConfigDecoder } from "../shared/decoders/app-manager";

export class AppManager implements Glue42Web.AppManager.API {
    private _apps: {
        [key: string]: {
            source: string;
            application: Glue42Web.AppManager.Application;
            appProps: AppProps;
        };
    } = {};
    private _myInstance: LocalInstance;
    private _instances: RemoteInstance[] = [];
    private registry: CallbackRegistry = CallbackRegistryFactory();

    private DEFAULT_POLLING_INTERVAL = 3000;
    private OKAY_MESSAGE = "OK";
    private LOCAL_SOURCE = "LOCAL_SOURCE";
    private readyPromise: Promise<void>;

    constructor(private windows: Windows, private interop: Glue42Web.Interop.API, private control: Control, private config?: AppManagerConfig, private appName?: string) {
        const myId = interop.instance.instance as string;

        this._myInstance = new LocalInstance(myId, this.control, this, this.interop.instance);

        if (this.config?.remoteSources) {
            this.readyPromise = this.subscribeForRemoteApplications(this.config.remoteSources);
        }
        if (this.config?.localApplications) {
            const validatedApplications = this.getValidatedApplications(this.config.localApplications);

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
        if (typeof name !== "string") {
            throw new Error("Please provide the name as a string!");
        }

        return this._apps[name]?.application;
    }

    public applications(): Glue42Web.AppManager.Application[] {
        return Object.keys(this._apps).map((appName) => this._apps[appName].application);
    }

    public instances(): Glue42Web.AppManager.Instance[] {
        return this._instances;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onAppAdded(callback: (app: Glue42Web.AppManager.Application) => any): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }

        const applications = Object.keys(this._apps).map((appName) => {
            return this._apps[appName].application;
        });

        return this.registry.add("appAdded", callback, applications);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onAppRemoved(callback: (app: Glue42Web.AppManager.Application) => any): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }

        return this.registry.add("appRemoved", callback);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onAppChanged(callback: (app: Glue42Web.AppManager.Application) => any): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }

        return this.registry.add("appChanged", callback);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onInstanceStarted(callback: (app: Glue42Web.AppManager.Instance) => any): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }

        return this.registry.add("instanceStarted", callback, this._instances);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onInstanceStopped(callback: (app: Glue42Web.AppManager.Instance) => any): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }

        return this.registry.add("instanceStopped", callback);
    }

    // Resolve the AppManager API once all remote sources of applications have been fetched. If any of the fetches fail swallow the error and resolve.
    public async ready(): Promise<void> {
        try {
            await this.readyPromise;
            // tslint:disable-next-line:no-console
        } catch (error) {
            // Swallow the error.
        }
    }

    private getValidatedApplications(applications: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>): Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig> {
        const verifiedApplications = applications.filter((application) => {
            const isFDC3App = typeof (application as FDC3ApplicationConfig).manifest !== "undefined";

            let isValid: boolean;

            if (isFDC3App) {
                isValid = fdc3ApplicationConfigDecoder.run(application as FDC3ApplicationConfig).ok;
            } else {
                isValid = glue42CoreApplicationConfigDecoder.run(application as Glue42CoreApplicationConfig).ok;
            }

            if (!isValid) {
                // tslint:disable-next-line:no-console
                console.warn(`Validation failed for application "${application.name}"!`);
            }

            return isValid;
        });

        return verifiedApplications;
    }

    private async subscribeForRemoteApplications(remoteSources: RemoteSource[]): Promise<void> {
        const initialFetchAppsPromises = [];

        for (const remoteSource of remoteSources) {
            const url = remoteSource.url;

            const appsFetch = async () => {
                const response = await fetchTimeout(url, 1000);
                const json = (await response.json()) as { message: string; applications: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig> };

                if (json.message === this.OKAY_MESSAGE) {
                    const validatedApplications = this.getValidatedApplications(json.applications);

                    this.addApplications(validatedApplications, url);
                }
            };

            initialFetchAppsPromises.push(appsFetch());

            // tslint:disable-next-line:no-console
            setInterval(() => appsFetch().catch(console.warn), remoteSource.pollingInterval || this.DEFAULT_POLLING_INTERVAL);
        }

        await Promise.all(initialFetchAppsPromises);
    }

    private getAppProps(application: Glue42CoreApplicationConfig | FDC3ApplicationConfig): AppProps {
        const glue42CoreAppProps = ["name", "title", "version", "customProperties", "icon", "caption"];

        const userProperties = Object.fromEntries(Object.entries(application).filter(([key]) => !glue42CoreAppProps.includes(key)));

        return {
            name: application.name,
            title: application.title,
            version: application.version,
            icon: (application as Glue42CoreApplicationConfig).icon,
            caption: (application as Glue42CoreApplicationConfig).caption,
            userProperties: {
                ...userProperties,
                ...(application as Glue42CoreApplicationConfig).customProperties
            }
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

    private tryPopulateMyInstanceApplication(): void {
        if (this.appName) {
            const myApp = Object.values(this._apps).find((app) => app.application.name === this.appName)?.application;

            if (myApp) {
                if (myApp.title) {
                    document.title = myApp.title;
                }

                this._myInstance.application = myApp;
            }
        }
    }

    private addApplications(newlyAddedApplications: Array<Glue42CoreApplicationConfig | FDC3ApplicationConfig>, source?: string): void {
        // Changed.
        this.handleAppsChanged(newlyAddedApplications, source);

        // Added.
        this.handleAppsAdded(newlyAddedApplications, source);

        // Removed.
        this.handleAppsRemoved(newlyAddedApplications, source);

        if (!this._myInstance.application) {
            this.tryPopulateMyInstanceApplication();
        }
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

        return new RemoteInstance(id, app, this.control, context, server);
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
