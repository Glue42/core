import generate from "shortid";
import { Glue42Core } from "./../../glue";

export class InstanceWrapper {
    public static API: Glue42Core.AGM.API;

    private wrapped: Glue42Core.Interop.Instance = {
        getMethods,
        getStreams,
    };

    constructor(instance?: Glue42Core.AGM.Instance, connection?: Glue42Core.Connection.API) {
        if (instance) {
            this.refreshWrappedObject(instance);
        }
        if (connection) {
            connection.loggedIn(() => {
                this.refresh(connection);
            });
            this.refresh(connection);
        }
    }

    public unwrap(): Glue42Core.Interop.Instance {
        return this.wrapped;
    }

    private refresh(connection: Glue42Core.Connection.API) {
        if (!connection) {
            return;
        }

        // Apply resolved identity (GW3 case)
        const resolvedIdentity = connection?.resolvedIdentity;
        const instance = Object.assign({}, resolvedIdentity ?? {}, { peerId: connection?.peerId });
        this.refreshWrappedObject(instance);
    }

    private refreshWrappedObject(resolvedIdentity: Glue42Core.Interop.Instance) {
        this.wrapped.user = resolvedIdentity.user;
        this.wrapped.instance = resolvedIdentity.instance;
        this.wrapped.application = resolvedIdentity.application ?? generate();
        this.wrapped.applicationName = resolvedIdentity.applicationName;
        this.wrapped.pid = resolvedIdentity.pid ?? (resolvedIdentity as any).process ?? Math.floor(Math.random() * 10000000000);
        this.wrapped.machine = resolvedIdentity.machine;
        this.wrapped.environment = resolvedIdentity.environment;
        this.wrapped.region = resolvedIdentity.region;
        this.wrapped.windowId = resolvedIdentity.windowId;
        this.wrapped.isLocal = true;
        this.wrapped.api = resolvedIdentity.api;
        this.wrapped.service = resolvedIdentity.service;
        this.wrapped.peerId = resolvedIdentity.peerId;
    }
}

function getMethods(this: any): Glue42Core.Interop.MethodDefinition[] {
    return InstanceWrapper.API?.methodsForInstance(this);
}

function getStreams(this: any): Glue42Core.Interop.MethodDefinition[] {
    return InstanceWrapper.API?.methodsForInstance(this).filter((m) => m.supportsStreaming);
}
