import { Glue42Core } from "@glue42/core";
import { Glue42Web } from "../../web";
import { LibController } from "../shared/types";

export class NotificationsController implements LibController {
    private logger!: Glue42Web.Logger.API;
    private interop!: Glue42Core.AGM.API;

    public async start(coreGlue: Glue42Core.GlueCore): Promise<void> {
        this.logger = coreGlue.logger.subLogger("notifications.controller.web");

        this.logger.trace("starting the web notifications controller");

        this.interop = coreGlue.interop;

        const api = this.toApi();

        (coreGlue as Glue42Web.API).notifications = api;

        this.logger.trace("notifications are ready");
    }

    public async handleBridgeMessage(): Promise<void> {
        // noop
    }

    private toApi(): Glue42Web.Notifications.API {
        const api: Glue42Web.Notifications.API = {
            raise: this.raise.bind(this)
        };

        return Object.freeze(api);
    }

    private async raise(options: Glue42Web.Notifications.Glue42NotificationOptions): Promise<Notification> {

        if (!("Notification" in window)) {
            throw new Error("this browser does not support desktop notification");
        }
        let permissionPromise: Promise<NotificationPermission>;
        if (Notification.permission === "granted") {
            permissionPromise = Promise.resolve("granted");
        } else if (Notification.permission === "denied") {
            permissionPromise = Promise.reject("no permissions from user");
        } else {
            permissionPromise = Notification.requestPermission();
        }

        await permissionPromise;

        const notification = this.raiseUsingWebApi(options);

        if (options.clickInterop) {
            const interopOptions = options.clickInterop;
            notification.onclick = (): void => {
                this.interop.invoke(interopOptions.method, interopOptions?.arguments ?? {}, interopOptions?.target ?? "best");
            };
        }

        return notification;
    }

    private raiseUsingWebApi(options: Glue42Web.Notifications.Glue42NotificationOptions): Notification {
        return new Notification(options.title);
    }
}