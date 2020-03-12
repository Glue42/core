import { Protocol } from "../types";
import { ServerMethodInfo, RequestContext, ServerSubscriptionInfo } from "./types";
import ServerSubscription from "./subscription";
import Server from "./server";
import Request from "./request";

/*
 The streaming module defines the user objects relevant to the streaming api, and
 attaches to relevant events exposed by the protocol.
 */
export default class ServerStreaming {
    constructor(public protocol: Protocol, private server: Server) {

        /** Attach to stream 'events' */
        protocol.server.onSubRequest((rc, rm) => this.handleSubRequest(rc, rm));

        protocol.server.onSubAdded((sub, rm) => this.handleSubAdded(sub, rm));

        protocol.server.onSubRemoved((sub, rm) => this.handleSubRemoved(sub, rm));
    }

    private handleSubRequest(requestContext: RequestContext, repoMethod: ServerMethodInfo) {

        if (!(repoMethod &&
            repoMethod.streamCallbacks &&
            typeof repoMethod.streamCallbacks.subscriptionRequestHandler === "function")) {
            return;
        }

        const request = new Request(this.protocol, repoMethod, requestContext);
        repoMethod.streamCallbacks.subscriptionRequestHandler(request);
    }

    private handleSubAdded(subscription: ServerSubscriptionInfo, repoMethod: ServerMethodInfo) {
        if (!(repoMethod &&
            repoMethod.streamCallbacks &&
            typeof repoMethod.streamCallbacks.subscriptionAddedHandler === "function")) {
            return;
        }

        const sub = new ServerSubscription(this.protocol, repoMethod, subscription);
        repoMethod.streamCallbacks.subscriptionAddedHandler(sub);
    }

    private handleSubRemoved(subscription: ServerSubscriptionInfo, repoMethod: ServerMethodInfo) {
        if (!(repoMethod &&
            repoMethod.streamCallbacks &&
            typeof repoMethod.streamCallbacks.subscriptionRemovedHandler === "function")) {
            return;
        }

        const sub = new ServerSubscription(this.protocol, repoMethod, subscription);
        repoMethod.streamCallbacks.subscriptionRemovedHandler(sub);
    }
}
