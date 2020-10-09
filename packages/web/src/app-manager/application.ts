import { Glue42Web } from "../../web";
import { Windows } from "../windows/main";
import { default as CallbackRegistryFactory, CallbackRegistry, UnsubscribeFunction } from "callback-registry";
import { AppProps } from "./types";
import { promisePlus } from "../shared/promise-plus";

export class Application implements Glue42Web.AppManager.Application {
    public _url: string;
    private _registry: CallbackRegistry = CallbackRegistryFactory();

    constructor(private _appManager: Glue42Web.AppManager.API, private _props: AppProps, private _windows: Windows) {
        if (typeof _props?.userProperties?.manifest === "undefined") {
            // Glue42 Core application definition.
            this._url = _props?.userProperties?.details?.url;
        } else {
            // FDC3 application definition.
            const parsedManifest = JSON.parse(_props.userProperties.manifest);

            // Allow for details.url ("Glue42" manifestType) as well as top level url.
            this._url = parsedManifest.details?.url || parsedManifest.url;
        }

        _appManager.onInstanceStarted((instance) => {
            if (instance.application.name === this.name) {
                this._registry.execute("instanceStarted", instance);
            }
        });

        _appManager.onInstanceStopped((instance) => {
            if (instance.application.name === this.name) {
                this._registry.execute("instanceStopped", instance);
            }
        });
    }

    get name(): string {
        return this._props.name;
    }

    get title(): string {
        return this._props.title || "";
    }

    get version(): string {
        return this._props.version || "";
    }

    get icon(): string {
        return this._props.icon || "";
    }

    get caption(): string {
        return this._props.caption || "";
    }

    get userProperties(): Glue42Web.AppManager.PropertiesObject {
        return this._props.userProperties || {};
    }

    get instances(): Glue42Web.AppManager.Instance[] {
        return this._appManager.instances().filter((instance: Glue42Web.AppManager.Instance) => instance.application.name === this.name);
    }

    public start = (context?: object, options?: Glue42Web.Windows.Settings): Promise<Glue42Web.AppManager.Instance> => {
        return promisePlus(() => this.startWithoutTimeout(context, options), 3000, `Application "${this.name}" start timeout!`);
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    public onInstanceStarted(callback: (instance: Glue42Web.AppManager.Instance) => any): void {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }

        this._registry.add("instanceStarted", callback);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    public onInstanceStopped(callback: (instance: Glue42Web.AppManager.Instance) => any): void {
        if (typeof callback !== "function") {
            throw new Error("Please provide the callback as a function!");
        }

        this._registry.add("instanceStopped", callback);
    }

    public updateFromProps(props: AppProps): void {
        const url = typeof props?.userProperties?.manifest !== "undefined" ? JSON.parse(props?.userProperties.manifest).url : props?.userProperties?.details.url;

        this._url = url;

        Object.keys(props).forEach((key) => {
            (this._props as any)[key] = (props as any)[key];
        });
    }

    private async startWithoutTimeout(context?: object, options?: Glue42Web.Windows.Settings): Promise<Glue42Web.AppManager.Instance> {
        const openOptions = {
            ...this._props?.userProperties?.details,
            ...options,
            context: context || options?.context
        };

        if (!this._url) {
            throw new Error(`Application ${this.name} doesn't have a URL.`);
        }

        let appWindow: Glue42Web.Windows.WebWindow;
        let unsubscribeFunc: UnsubscribeFunction;
        let resolveCallback: (value?: Glue42Web.AppManager.Instance | PromiseLike<Glue42Web.AppManager.Instance>) => void;
        const startedAppsWindowIdsToInstances: Record<string, Glue42Web.AppManager.Instance> = {};

        const checkResolveCondition = () => {
            if (typeof appWindow !== "undefined") {
                const instance = startedAppsWindowIdsToInstances[appWindow.id];
                if (typeof instance !== "undefined") {
                    unsubscribeFunc();
                    return resolveCallback(instance);
                }
            }
        };

        const appInstanceStartedPromise: Promise<Glue42Web.AppManager.Instance> = new Promise((resolve) => {
            resolveCallback = resolve;

            // `appManager.onInstanceStarted()` could be called before or after `windows.open()` resolves.
            unsubscribeFunc = this._appManager.onInstanceStarted((startedInstance) => {
                const windowId = startedInstance.agm.windowId;
                if (typeof windowId !== "undefined") {
                    startedAppsWindowIdsToInstances[windowId] = startedInstance;
                    // Handles the case when `appManager.onInstanceStarted()` is fired AFTER `windows.open()` resolves.
                    checkResolveCondition();
                }
            });
        });

        appWindow = await this._windows.open(this.name, this._url, openOptions as Glue42Web.Windows.CreateOptions);
        // Handles the case when `appManager.onInstanceStarted()` is fired BEFORE `windows.open()` resolves.
        checkResolveCondition();

        return appInstanceStartedPromise;
    }
}
