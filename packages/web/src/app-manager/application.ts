import { Glue42Web } from "../../web";
import { Windows } from "../windows/main";
import { default as CallbackRegistryFactory, CallbackRegistry, UnsubscribeFunction } from "callback-registry";
import { AppProps } from "./types";

export class Application implements Glue42Web.AppManager.Application {
    public _url: string | undefined;
    private _registry: CallbackRegistry = CallbackRegistryFactory();

    constructor(private _appManager: Glue42Web.AppManager.API, private _props: AppProps, private _windows: Windows) {
        const url = typeof _props?.userProperties?.manifest !== "undefined" ? JSON.parse(_props?.userProperties.manifest).url : _props?.userProperties?.details.url;

        this._url = url;

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

    get userProperties(): Glue42Web.AppManager.PropertiesObject {
        return this._props.userProperties || {};
    }

    get instances(): Glue42Web.AppManager.Instance[] {
        return this._appManager.instances().filter((instance: Glue42Web.AppManager.Instance) => instance.application.name === this.name);
    }

    public start(context?: object, options?: Glue42Web.Windows.Settings): Promise<Glue42Web.AppManager.Instance> {
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line prefer-const
            let unsubscribeFunc: UnsubscribeFunction;

            const timeoutId = setTimeout(() => {
                unsubscribeFunc();
                reject(`Application "${this.name}" start timeout!`);
            }, 3000);

            unsubscribeFunc = this._appManager.onInstanceStarted((instance) => {
                if (instance.application.name === this.name) {
                    clearTimeout(timeoutId);
                    unsubscribeFunc();
                    resolve(instance);
                }
            });

            const openOptions = {
                ...this._props?.userProperties?.details,
                ...options,
                context: context || options?.context
            };

            if (!this._url) {
                throw new Error(`Application ${this.name} doesn't have a URL.`);
            }

            this._windows.open(this.name, this._url, openOptions as Glue42Web.Windows.CreateOptions);
        });
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    public onInstanceStarted(callback: (instance: Glue42Web.AppManager.Instance) => any): void {
        this._registry.add("instanceStarted", callback);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    public onInstanceStopped(callback: (instance: Glue42Web.AppManager.Instance) => any): void {
        this._registry.add("instanceStopped", callback);
    }

    public updateFromProps(props: AppProps): void {
        const url = typeof props?.userProperties?.manifest !== "undefined" ? JSON.parse(props?.userProperties.manifest).url : props?.userProperties?.details.url;

        this._url = url;

        Object.keys(props).forEach((key) => {
            (this._props as any)[key] = (props as any)[key];
        });
    }
}
