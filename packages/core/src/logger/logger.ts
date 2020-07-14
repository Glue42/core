import { Glue42Core } from "../../glue";

const order: Glue42Core.LogLevel[] = ["trace", "debug", "info", "warn", "error", "off"];

export class Logger implements Glue42Core.Logger.API {
    public static Interop: Glue42Core.Interop.API;
    public static InteropMethodName = "T42.AppLogger.Log";

    public static Instance: string;
    public readonly path: string;

    private subLoggers: Logger[] = [];
    private _consoleLevel: Glue42Core.LogLevel | undefined;
    private _publishLevel: Glue42Core.LogLevel | undefined;
    private loggerFullName: string;
    private includeTimeAndLevel: boolean;
    private logFn: Glue42Core.CustomLogger = console;
    private customLogFn: boolean = false;

    constructor(public readonly name: string, private parent?: Logger, logFn?: Glue42Core.CustomLogger) {
        this.name = name;

        if (parent) {
            this.path = `${parent.path}.${name}`;
        } else {
            this.path = name;
        }

        this.loggerFullName = `[${this.path}]`;
        this.includeTimeAndLevel = !logFn;
        if (logFn) {
            this.logFn = logFn;
            this.customLogFn = true;
        }
    }

    public subLogger(name: string): Logger {
        // Check if the sub-logger is already created
        const existingSub = this.subLoggers.filter((subLogger) => {
            return subLogger.name === name;
        })[0];

        if (existingSub !== undefined) {
            return existingSub;
        }

        // Check if the name isn't the same as one of the parent properties
        Object.keys(this).forEach((key) => {
            if (key === name) {
                throw new Error("This sub logger name is not allowed.");
            }
        });

        const sub = new Logger(name, this, this.customLogFn ? this.logFn : undefined);

        // add sub-logger to sub-loggers array
        this.subLoggers.push(sub);

        return sub;
    }

    public publishLevel(level?: Glue42Core.LogLevel): Glue42Core.LogLevel | undefined {
        if (level) {
            this._publishLevel = level;
        }

        return this._publishLevel || this.parent?.publishLevel();
    }

    public consoleLevel(level?: Glue42Core.LogLevel): Glue42Core.LogLevel | undefined {
        if (level) {
            this._consoleLevel = level;
        }

        return this._consoleLevel || this.parent?.consoleLevel();
    }

    public log(message: string, level?: Glue42Core.LogLevel, error?: Error) {
        this.publishMessage(level || "info", message, error);
    }

    public trace(message: string) {
        this.log(message, "trace");
    }

    public debug(message: string) {
        this.log(message, "debug");
    }

    public info(message: string) {
        this.log(message, "info");
    }

    public warn(message: string) {
        this.log(message, "warn");
    }

    public error(message: string, err?: Error) {
        this.log(message, "error");
    }

    public canPublish(level: Glue42Core.LogLevel, compareWith?: Glue42Core.LogLevel) {
        const levelIdx = order.indexOf(level);
        const restrictionIdx = order.indexOf(compareWith || this.consoleLevel() || "trace");

        return levelIdx >= restrictionIdx;
    }

    private publishMessage(level: Glue42Core.LogLevel, message: string, error?: Error) {
        // Retrieve logger name and levels
        const loggerName = this.loggerFullName;

        // Add stack trace if the message is an error
        if (level === "error" && !error) {
            const e = new Error();
            if (e.stack) {
                message =
                    message +
                    "\n" +
                    e.stack
                        .split("\n")
                        .slice(3)
                        .join("\n");
            }
        }

        if (this.canPublish(level, this.publishLevel())) {
            const interop = Logger.Interop;
            if (interop) {
                if (interop.methods({ name: Logger.InteropMethodName }).length > 0) {
                    interop.invoke(Logger.InteropMethodName, {
                        msg: `${message}`,
                        logger: loggerName,
                        level
                    });
                }
            }
        }

        // Publish in console
        if (this.canPublish(level)) {
            let prefix = "";
            if (this.includeTimeAndLevel) {
                const date = new Date();
                const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
                prefix = `[${time}] [${level}] `;
            }
            const toPrint = `${prefix}${loggerName}: ${message}`;
            switch (level) {
                case "trace":
                    // tslint:disable-next-line:no-console
                    this.logFn.debug(toPrint);
                    break;
                case "debug":
                    // tslint:disable-next-line:no-console
                    if (this.logFn.debug) {
                        // tslint:disable-next-line:no-console
                        this.logFn.debug(toPrint);
                    } else {
                        // tslint:disable-next-line:no-console
                        this.logFn.log(toPrint);
                    }
                    break;
                case "info":
                    // tslint:disable-next-line:no-console
                    this.logFn.info(toPrint);
                    break;
                case "warn":
                    // tslint:disable-next-line:no-console
                    this.logFn.warn(toPrint);
                    break;
                case "error":
                    // tslint:disable-next-line:no-console
                    this.logFn.error(toPrint, error);
                    break;
            }
        }
    }
}
