import { Glue42Core } from "../glue";
import { InternalConfig, GDObject, GDStaringContext } from "./types";
import generate from "shortid";
import Utils from "./utils/utils";
import { ContextMessageReplaySpec } from "./contexts/contextMessageReplaySpec";
import { version as pjsonVersion } from "../package.json";
import { ConnectionSettings } from "./connection/types";

export default function (configuration: Glue42Core.Config, ext: Glue42Core.Extension, glue42gd: GDObject | undefined): InternalConfig {

    let nodeStartingContext: GDStaringContext;
    if (Utils.isNode()) {
        const startingContextString = process.env._GD_STARTING_CONTEXT_;
        if (startingContextString) {
            try {
                nodeStartingContext = JSON.parse(startingContextString);
            } catch {
                // Do nothing - we will continue with the flow as if there is no starting context
            }
        }
    }

    function getConnection(): ConnectionSettings {

        const gwConfig = configuration.gateway;

        const protocolVersion = gwConfig?.protocolVersion ?? 3;
        const reconnectInterval = gwConfig?.reconnectInterval;
        const reconnectAttempts = gwConfig?.reconnectAttempts;

        const defaultWs = "ws://localhost:8385";
        let ws = gwConfig?.ws;
        const sharedWorker = gwConfig?.sharedWorker;
        const inproc = gwConfig?.inproc;

        // If running in GD use the injected ws URL
        if (glue42gd) {
            // GD3
            ws = glue42gd.gwURL;
        }
        // if running in Node app, started from GD, use the ws from starting context
        if (Utils.isNode() && nodeStartingContext && nodeStartingContext.gwURL) {
            ws = nodeStartingContext.gwURL;
        }

        // if nothing specified use default WS
        if (!ws && !sharedWorker && !inproc) {
            ws = defaultWs;
        }

        let instanceId: string | undefined;
        let windowId: string | undefined;
        let pid: number | undefined;
        let environment: string | undefined;
        let region: string | undefined;
        const appName = getApplication();
        let uniqueAppName = appName;
        if (typeof glue42gd !== "undefined") {
            windowId = glue42gd.windowId;
            pid = glue42gd.pid;
            if (glue42gd.env) {
                environment = glue42gd.env.env;
                region = glue42gd.env.region;
            }
            // G4E-1668
            uniqueAppName = glue42gd.application ?? "glue-app";
            instanceId = glue42gd.appInstanceId;
        } else if (Utils.isNode()) {
            pid = process.pid;
            if (nodeStartingContext) {
                environment = nodeStartingContext.env;
                region = nodeStartingContext.region;
                instanceId = nodeStartingContext.instanceId;
            }
        } else {
            // generate windowId, this is useful in glue0 case, when we're started
            // from shortcut, not another window; ignored in the other cases
            windowId = window.name || generate();
        }

        // replay specs for core connection
        const replaySpecs = configuration.gateway?.replaySpecs ?? [];
        // inject Context message replay
        replaySpecs.push(ContextMessageReplaySpec);

        return {
            identity: {
                application: uniqueAppName,
                applicationName: appName,
                windowId,
                instance: instanceId,
                process: pid,
                region,
                environment,
                api: ext.version || pjsonVersion
            },
            reconnectInterval,
            ws,
            sharedWorker,
            inproc,
            protocolVersion,
            reconnectAttempts,
            replaySpecs,
        };
    }

    function getApplication() {
        if (configuration.application) {
            return configuration.application;
        }

        if (glue42gd) {
            return glue42gd.applicationName;
        }

        const uid = generate();
        if (Utils.isNode()) {
            if (nodeStartingContext) {
                return nodeStartingContext.applicationConfig.name;
            }

            return "NodeJS" + uid;
        }

        if (typeof window !== "undefined" && typeof document !== "undefined") {
            return document.title + ` (${uid})`;
        }

        return uid;
    }

    function getAuth(): Glue42Core.Auth | undefined {
        if (typeof configuration.auth === "string") {
            return {
                token: configuration.auth
            };
        }

        if (configuration.auth) {
            return configuration.auth;
        }

        if (Utils.isNode() && nodeStartingContext && nodeStartingContext.gwToken) {
            return {
                gatewayToken: nodeStartingContext.gwToken
            };
        }

        if (configuration.gateway?.inproc || configuration.gateway?.sharedWorker) {
            return {
                username: "glue42", password: "glue42"
            };
        }
    }

    function getLogger(): { console: Glue42Core.LogLevel; publish: Glue42Core.LogLevel } {
        let config = configuration.logger;
        const defaultLevel = "error";
        if (!config) {
            config = defaultLevel;
        }

        if (typeof config === "string") {
            return { console: config, publish: defaultLevel };
        }

        return {
            console: config.console ?? defaultLevel,
            publish: config.publish ?? defaultLevel
        };
    }

    const connection = getConnection();

    return {
        bus: configuration.bus ?? false,
        auth: getAuth(),
        logger: getLogger(),
        connection,
        metrics: configuration.metrics ?? true,
        contexts: configuration.contexts ?? true,
        version: ext.version || pjsonVersion,
        libs: ext.libs ?? [],
        customLogger: configuration.customLogger
    };
}
