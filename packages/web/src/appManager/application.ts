/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "../../web";
import { AppManagerController } from "./controller";
import { BaseApplicationData } from "./protocol";

export class ApplicationModel {
    private me!: Glue42Web.AppManager.Application;

    constructor(
        private readonly data: BaseApplicationData,
        private readonly instances: Glue42Web.AppManager.Instance[],
        private readonly controller: AppManagerController,
    ) { }

    public toApi(): Glue42Web.AppManager.Application {
        const api: Glue42Web.AppManager.Application = {
            name: this.data.name,
            title: this.data.title as string,
            version: this.data.version as string,
            icon: this.data.icon as string,
            caption: this.data.caption as string,
            userProperties: this.data.userProperties,
            instances: this.instances,
            start: this.start.bind(this),
            onInstanceStarted: this.onInstanceStarted.bind(this),
            onInstanceStopped: this.onInstanceStopped.bind(this)
        };

        this.me = api;

        return this.me;
    }

    private onInstanceStarted(callback: (instance: Glue42Web.AppManager.Instance) => any): void {

        if (typeof callback !== "function") {
            throw new Error("OnInstanceStarted requires a single argument of type function");
        }

        this.controller.onInstanceStarted((instance) => {
            if (instance.application.name === this.data.name) {
                callback(instance);
            }
        });
    }

    private onInstanceStopped(callback: (instance: Glue42Web.AppManager.Instance) => any): void {
        if (typeof callback !== "function") {
            throw new Error("OnInstanceStarted requires a single argument of type function");
        }

        this.controller.onInstanceStopped((instance) => {
            if (instance.application.name === this.data.name) {
                callback(instance);
            }
        });
    }

    private async start(context?: object, options?: Glue42Web.AppManager.ApplicationStartOptions): Promise<Glue42Web.AppManager.Instance> {
        // todo: validation
        return this.controller.startApplication(this.data.name, context, options);
    }
}