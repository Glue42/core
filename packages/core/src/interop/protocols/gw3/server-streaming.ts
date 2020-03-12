import { default as CallbackRegistryFactory, CallbackRegistry } from "callback-registry";
import { RequestContext, ServerMethodInfo, ServerSubscriptionInfo } from "../../server/types";
import ClientRepository from "../../client/repository";
import ServerRepository from "../../server/repository";
import {
    AddInterestMessage,
    PublishMessage,
    PostMessage,
    DropSubscriptionMessage,
    RemoveInterestMessage
} from "./messages";
import { Glue42Core } from "../../../../glue";
import { Logger } from "../../../logger/logger";

const SUBSCRIPTION_REQUEST = "onSubscriptionRequest";
const SUBSCRIPTION_ADDED = "onSubscriptionAdded";
const SUBSCRIPTION_REMOVED = "onSubscriptionRemoved";

/**
 * Handles registering methods and sending data to clients
 */
export default class ServerStreaming {

    private ERR_URI_SUBSCRIPTION_FAILED = "com.tick42.agm.errors.subscription.failure";
    private callbacks = CallbackRegistryFactory();
    private nextStreamId = 0;

    constructor(private session: Glue42Core.Connection.GW3DomainSession, private repository: ClientRepository, private serverRepository: ServerRepository) {
        session.on("add-interest", (msg: AddInterestMessage) => {
            this.handleAddInterest(msg);
        });
        session.on("remove-interest", (msg: RemoveInterestMessage) => {
            this.handleRemoveInterest(msg);
        });
    }

    public acceptRequestOnBranch(requestContext: RequestContext, streamingMethod: ServerMethodInfo, branch: string) {
        if (typeof branch !== "string") {
            branch = "";
        }

        if (typeof streamingMethod.protocolState.subscriptionsMap !== "object") {
            throw new TypeError("The streaming method is missing its subscriptions.");
        }

        if (!Array.isArray(streamingMethod.protocolState.branchKeyToStreamIdMap)) {
            throw new TypeError("The streaming method is missing its branches.");
        }

        const streamId = this.getStreamId(streamingMethod, branch);

        // Add a new subscription to the method
        const key = requestContext.msg.subscription_id;

        const subscription: ServerSubscriptionInfo = {
            id: key,
            arguments: requestContext.arguments,
            instance: requestContext.instance,
            branchKey: branch,
            streamId,
            subscribeMsg: requestContext.msg,
        };

        streamingMethod.protocolState.subscriptionsMap[key] = subscription;

        // Inform the gw
        this.session.sendFireAndForget({
            type: "accepted",
            subscription_id: key,
            stream_id: streamId,
        });

        // Pass state above-protocol for user objects
        this.callbacks.execute(SUBSCRIPTION_ADDED, subscription, streamingMethod);
    }

    public rejectRequest(requestContext: RequestContext, streamingMethod: ServerMethodInfo, reason: string) {
        if (typeof reason !== "string") {
            reason = "";
        }

        this.sendSubscriptionFailed(
            "Subscription rejected by user. " + reason,
            requestContext.msg.subscription_id,
        );
    }

    public pushData(streamingMethod: ServerMethodInfo, data: object, branches: string | string[]) {
        if (typeof streamingMethod !== "object" || !Array.isArray(streamingMethod.protocolState.branchKeyToStreamIdMap)) {
            return;
        }

        // TODO validate data is a plain object
        if (typeof data !== "object") {
            throw new Error("Invalid arguments. Data must be an object.");
        }

        if (typeof branches === "string") {
            branches = [branches]; // user wants to push to single branch
        } else if (!Array.isArray(branches) || branches.length <= 0) {
            branches = [];
        }

        // get the StreamId's from the method's branch map
        const streamIdList = streamingMethod.protocolState.branchKeyToStreamIdMap
            .filter((br) => {
                if (!branches || branches.length === 0) {
                    return true;
                }
                return branches.indexOf(br.key) >= 0;
            }).map((br) => {
                return br.streamId;
            });

        // if (streamIdList.length === 0) {
        //     throw new Error("0 branches exist with the supplied name/s !");
        // }

        streamIdList.forEach((streamId) => {
            const publishMessage: PublishMessage = {
                type: "publish",
                stream_id: streamId,
                // sequence: null,  // the streamingMethod might be used for this
                // snapshot: false, // ...and this
                data,
            };

            this.session.sendFireAndForget(publishMessage);
        });
    }

    public pushDataToSingle(method: ServerMethodInfo, subscription: ServerSubscriptionInfo, data: object) {
        // TODO validate data is a plain object
        if (typeof data !== "object") {
            throw new Error("Invalid arguments. Data must be an object.");
        }

        const postMessage: PostMessage = {
            type: "post",
            subscription_id: subscription.id,
            // sequence: null,  // the streamingMethod might be used for this
            // snapshot: false, // ...and this
            data,
        };

        this.session.sendFireAndForget(postMessage);
    }

    public closeSingleSubscription(streamingMethod: ServerMethodInfo, subscription: ServerSubscriptionInfo) {

        if (streamingMethod.protocolState.subscriptionsMap) {
            delete streamingMethod.protocolState.subscriptionsMap[subscription.id];
        }

        const dropSubscriptionMessage: DropSubscriptionMessage = {
            type: "drop-subscription",
            subscription_id: subscription.id,
            reason: "Server dropping a single subscription",
        };

        this.session.sendFireAndForget(dropSubscriptionMessage);

        const subscriber = subscription.instance;

        this.callbacks.execute(SUBSCRIPTION_REMOVED, subscription, streamingMethod);
    }

    public closeMultipleSubscriptions(streamingMethod: ServerMethodInfo, branchKey?: string) {
        if (typeof streamingMethod !== "object" || typeof streamingMethod.protocolState.subscriptionsMap !== "object") {
            return;
        }
        if (!streamingMethod.protocolState.subscriptionsMap) {
            return;
        }

        const subscriptionsMap = streamingMethod.protocolState.subscriptionsMap;
        let subscriptionsToClose = Object.keys(subscriptionsMap)
            .map((key) => {
                return subscriptionsMap[key];
            });

        if (typeof branchKey === "string") {
            subscriptionsToClose = subscriptionsToClose.filter((sub) => {
                return sub.branchKey === branchKey;
            });
        }

        subscriptionsToClose.forEach((subscription) => {
            delete subscriptionsMap[subscription.id];

            const drop: DropSubscriptionMessage = {
                type: "drop-subscription",
                subscription_id: subscription.id,
                reason: "Server dropping all subscriptions on stream_id: " + subscription.streamId,
            };
            this.session.sendFireAndForget(drop);
        });
    }

    public getSubscriptionList(streamingMethod: ServerMethodInfo, branchKey?: string): ServerSubscriptionInfo[] {
        if (typeof streamingMethod !== "object") {
            return [];
        }

        let subscriptions = [];
        if (!streamingMethod.protocolState.subscriptionsMap) {
            return [];
        }
        const subscriptionsMap = streamingMethod.protocolState.subscriptionsMap;

        const allSubscriptions = Object.keys(subscriptionsMap)
            .map((key) => {
                return subscriptionsMap[key];
            });

        if (typeof branchKey !== "string") {
            subscriptions = allSubscriptions;
        } else {
            subscriptions = allSubscriptions.filter((sub) => {
                return sub.branchKey === branchKey;
            });
        }

        return subscriptions;
    }

    public getBranchList(streamingMethod: ServerMethodInfo): string[] {
        if (typeof streamingMethod !== "object") {
            return [];
        }

        if (!streamingMethod.protocolState.subscriptionsMap) {
            return [];
        }
        const subscriptionsMap = streamingMethod.protocolState.subscriptionsMap;

        const allSubscriptions =
            Object.keys(subscriptionsMap)
                .map((key) => {
                    return subscriptionsMap[key];
                });

        const result: string[] = [];
        allSubscriptions.forEach((sub) => {
            let branch = "";
            if (typeof sub === "object" && typeof sub.branchKey === "string") {
                branch = sub.branchKey;
            }

            if (result.indexOf(branch) === -1) {
                result.push(branch);
            }
        });

        return result;
    }

    public onSubAdded(callback: (subscription: ServerSubscriptionInfo, repoMethod: ServerMethodInfo) => void) {
        this.onSubscriptionLifetimeEvent(SUBSCRIPTION_ADDED, callback);
    }

    public onSubRequest(callback: (requestContext: RequestContext, repoMethod: ServerMethodInfo) => void) {
        this.onSubscriptionLifetimeEvent(SUBSCRIPTION_REQUEST, callback);
    }

    public onSubRemoved(callback: (subscriber: ServerSubscriptionInfo, repoMethod: ServerMethodInfo) => void) {
        this.onSubscriptionLifetimeEvent(SUBSCRIPTION_REMOVED, callback);
    }

    private handleRemoveInterest(msg: RemoveInterestMessage) {
        const streamingMethod = this.serverRepository.getById(msg.method_id);

        if (typeof msg.subscription_id !== "string" ||
            typeof streamingMethod !== "object") {
            return;
        }

        if (!streamingMethod.protocolState.subscriptionsMap) {
            return;
        }

        if (typeof streamingMethod.protocolState.subscriptionsMap[msg.subscription_id] !== "object") {
            return;
        }

        const subscription = streamingMethod.protocolState.subscriptionsMap[msg.subscription_id];

        delete streamingMethod.protocolState.subscriptionsMap[msg.subscription_id];

        this.callbacks.execute(SUBSCRIPTION_REMOVED, subscription, streamingMethod);
    }

    private onSubscriptionLifetimeEvent(eventName: string, handlerFunc: any) {
        this.callbacks.add(eventName, handlerFunc);
    }

    private getNextStreamId(): string {
        return this.nextStreamId++ + "";
    }

    /**
     * Processes a subscription request
     */
    private handleAddInterest(msg: AddInterestMessage) {

        const caller = this.repository.getServerById(msg.caller_id);
        const instance = caller.instance;

        // call subscriptionRequestHandler
        const requestContext: RequestContext = {
            msg,
            arguments: msg.arguments_kv || {},
            instance,
        };

        const streamingMethod = this.serverRepository.getById(msg.method_id);

        if (streamingMethod === undefined) {
            const errorMsg = "No method with id " + msg.method_id + " on this server.";
            this.sendSubscriptionFailed(errorMsg, msg.subscription_id);
            return;
        }

        if (streamingMethod.protocolState.subscriptionsMap &&
            streamingMethod.protocolState.subscriptionsMap[msg.subscription_id]) {
            this.sendSubscriptionFailed("A subscription with id " + msg.subscription_id + " already exists.",
                msg.subscription_id,
            );
            return;
        }

        this.callbacks.execute(SUBSCRIPTION_REQUEST, requestContext, streamingMethod);
    }

    private sendSubscriptionFailed(reason: string, subscriptionId: string) {
        const errorMessage = {
            type: "error",
            reason_uri: this.ERR_URI_SUBSCRIPTION_FAILED,
            reason,
            request_id: subscriptionId, // this overrides connection wrapper
        };

        this.session.sendFireAndForget(errorMessage);
    }

    private getStreamId(streamingMethod: ServerMethodInfo, branchKey: string) {
        if (typeof branchKey !== "string") {
            branchKey = "";
        }

        if (!streamingMethod.protocolState.branchKeyToStreamIdMap) {
            throw new Error(`streaming ${streamingMethod.definition.name} method without protocol state`);
        }

        const needleBranch = streamingMethod.protocolState.branchKeyToStreamIdMap.filter((branch) => {
            return branch.key === branchKey;
        })[0];

        let streamId = (needleBranch ? needleBranch.streamId : undefined);

        if (typeof streamId !== "string" || streamId === "") {
            streamId = this.getNextStreamId();
            streamingMethod.protocolState.branchKeyToStreamIdMap.push({ key: branchKey, streamId });
        }

        return streamId;
    }
}
