import { Glue42Core } from "../../glue";
import { ClientMethodInfo, ServerInfo, ServerMethodsPair } from "./client/types";
import { ServerMethodInfo, ResultContext, RequestContext, ServerSubscriptionInfo } from "./server/types";
import { InvokeResultMessage } from "./client/client";
import Connection from "../connection/connection";
import { Logger } from "../logger/logger";
import { UserSubscription } from "./protocols/gw3/subscription";

export interface InteropSettings {
    connection: Connection;
    logger: Logger;
    /** Default for how much to wait for method to appear when invoking. If not set 10000
     * @default 10000
     */
    waitTimeoutMs?: number;
    /** Default for how much to wait of the method to respond when invoking. If not set 10000
     * @default 10000
     */
    methodResponseTimeout?: number;
}

export interface ServerProtocolDefinition {
    onInvoked(callback: (methodToExecute: ServerMethodInfo, invocationId: string, invocationArgs: ResultContext) => void): void;
    methodInvocationResult(method: ServerMethodInfo, invocationId: string, err: string, result: object): void;
    register(info: ServerMethodInfo): Promise<void>;
    unregister(info: ServerMethodInfo): Promise<void>;

    createStream(info: ServerMethodInfo): Promise<void>;

    getBranchList(method: ServerMethodInfo): string[];
    getSubscriptionList(method: ServerMethodInfo, branchKey?: string): ServerSubscriptionInfo[];
    closeAllSubscriptions(method: ServerMethodInfo, branchKey?: string): void;
    pushData(method: ServerMethodInfo, data: object, branches: string[]): void;
    pushDataToSingle(method: ServerMethodInfo, subscription: ServerSubscriptionInfo, data: object): void;
    closeSingleSubscription(method: ServerMethodInfo, subscription: ServerSubscriptionInfo): void;
    acceptRequestOnBranch(requestContext: RequestContext, method: ServerMethodInfo, branch: string): void;
    rejectRequest(requestContext: RequestContext, method: ServerMethodInfo, reason: string): void;

    onSubRequest(callback: (requestContext: RequestContext, repoMethod: ServerMethodInfo) => void): void;
    onSubAdded(callback: (subscription: ServerSubscriptionInfo, repoMethod: ServerMethodInfo) => void): void;
    onSubRemoved(callback: (subscriber: ServerSubscriptionInfo, repoMethod: ServerMethodInfo) => void): void;
}

export interface ClientProtocolDefinition {
    invoke(invocationId: string, method: ClientMethodInfo, argumentsObj: object | undefined, target: ServerInfo, stuff: Glue42Core.AGM.InvokeOptions): Promise<InvokeResultMessage>;
    subscribe(stream: Glue42Core.AGM.MethodDefinition, args: Glue42Core.AGM.SubscriptionParams, targetServers: ServerMethodsPair[], successProxy: (sub: Glue42Core.AGM.Subscription) => void, errorProxy: (err: SubscribeError) => void, existingSub?: SubscriptionInner): void;
    drainSubscriptions(): SubscriptionInner[];
}

export interface Protocol {
    server: ServerProtocolDefinition;
    client: ClientProtocolDefinition;
}

export interface SubscribeError {
    method: Glue42Core.AGM.MethodDefinition;
    called_with: object | undefined;
    message: string;
}

export interface SubscriptionInner {
    localKey: number;
    status: string;
    method: Glue42Core.AGM.MethodDefinition;
    params: Glue42Core.AGM.SubscriptionParams;
    subscription?: UserSubscription;
    success: (sub: Glue42Core.AGM.Subscription) => void;
    error: (err: SubscribeError) => void;
    trackedServers: Array<{
        serverId: string;
        subscriptionId?: string
    }>;
    handlers: {
        onData: Array<(data: Glue42Core.AGM.StreamData) => void>;
        onClosed: Array<(data: {
            message: string,
            requestArguments: object | undefined,
            server: Glue42Core.AGM.Instance,
            stream: Glue42Core.AGM.MethodDefinition,
        }) => void>;
        onConnected: Array<(server: Glue42Core.AGM.Instance, reconnect: boolean) => void>;
        // onFailed: []
    };
    queued: {
        data: Glue42Core.AGM.StreamData[];
        closers: string[];
    };
    timeoutId: any;
    close: () => void;
}
