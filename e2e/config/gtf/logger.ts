import { Glue42Web } from "../../../packages/web/web.d";
import { Gtf } from "./types";

export class GtfLogger implements Gtf.Logger {
    private readonly loggerMethodName = "G42Core.E2E.Logger";

    constructor(private readonly glue: Glue42Web.API) {
    }

    public patchLogMessages(): void {
        const stringifyMessages = (messages: any[]) => {
            return messages.map((message) => {
                let stringifiedMessage = message;

                if (typeof message === "object") {
                    try {
                        stringifiedMessage = JSON.stringify(message);
                    }
                    catch (error) {
                        stringifiedMessage = "Failed to stringify message (most likely a circular structure).";
                    }
                }

                return stringifiedMessage;
            });
        };

        const oldConsoleLog = console.log;
        const oldConsoleWarn = console.warn;
        const oldConsoleError = console.error;

        window.console.log = (...args: any[]): void => {
            oldConsoleLog(...stringifyMessages(args));
        };

        window.console.warn = (...args: any[]): void => {
            // Ignore warning messages coming from the Platform. TODO: Make configurable.
            // oldConsoleWarn(...stringifyMessages(args));
        };
        console.log('[logger.ts] Ignoring all console.warn messages coming from the Platform!');

        window.console.error = (...args: any[]): void => {
            oldConsoleError(...stringifyMessages(args));
        };

        const stringifyEvent = (event: object) => {
            return JSON.stringify(event, (_, value) => {
                if (value instanceof Node) return "Node";
                if (value instanceof Window) return "Window";
                return value;
            }, " ");
        };
        const callback = (event: any) => {
            console.warn(stringifyEvent(event));
        };
        window.addEventListener("unhandledrejection", callback);
        window.addEventListener("error", callback);
    }

    public async register(): Promise<void> {
        this.glue.interop.register(this.loggerMethodName, ({ type, message }, caller) => {
            // Ignore warning messages coming from other applications. TODO: Make configurable.
            if (type === "log" || type === "error") {
                console.log(`[${caller.application}|${caller.peerId}] ${message}`);
            }
        });
        console.log('[logger.ts] Ignoring all console.warn messages coming from the other applications!');
    }
}
