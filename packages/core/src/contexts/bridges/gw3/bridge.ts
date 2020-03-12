import { Glue42Core } from "../../../../glue";
import { ContextBridge } from "../../contextBridge";
import { GW3ContextData as ContextData } from "./contextData";
import { applyContextDelta, deepEqual, deepClone } from "../../helpers";
import * as msg from "./messages";
import { ContextMessage } from "./contextMessage";
import { ContextMessageReplaySpec } from "../../contextMessageReplaySpec";
import { Logger } from "../../../logger/logger";
import Connection from "../../../connection/connection";
import { ContextsConfig } from "../../contextsModule";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// GW3Bridge implementation notes
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// ===========================
// Terminology used
// ===========================
//
// - gw-subscribe (verb):
//      send SUBSCRIBE CONTEXT to GW se we see CONTEXT UPDATED messages,
//      or
//      get implicitly subscribed as consequence of joining activity
//      sending the SUBSCRIBE CONTEXT message is done internally by this
//      class whenever a ContextData item in _contextNameToData reaches
//      state (3) (see 'States of a context' in gw3ContextData.ts)
// - bridge-subscribe (verb):
//      call gw3Bridge.subscribe method; we need to make sure we've
//      gw-subscribed if/as soon as the target context is announced
//      this is what consumers of this class do
// - bridge-subscription (noun):
//      the result of bridge-subscribe, and the state of having a handler
//      subscribed to a context
// - active subscription: bridge-subscription which will cause the handler
//      to observe context changes until someone calls unsubscribe() here
//      or the subscription becomes 'inactive'
// - inactive subscription: bridge-subscription which will NOT cause the
//      handler to observe context changes; this happens to
//      bridge-subscriptions on activity contexts if we leave the activity.
//      There is NO way to check if a subscription is active or not and it's
//      not reflected in the contextData state.
//
// ===========================
// General information
// ===========================
//
// This class exposes the GW context subscription and updating features
// using the subscribe/unsubscribe/update/createContext methods.
//
// The main logic is related to tracking the states of contexts (shared or
// activity), represented by ContextData entries in _contextNameToData, and
// reacting to gateway messages accordingly.
//
// ===========================
// States of an ContextData object
// ===========================
//
// (0) nothing (not defined, or deleted) - such entries are NOT kept in collections
// (1) unknown but bridge-subscribed to
// (2) announced but not bridge-subscribed to
// (3) both announced and bridge-subscribed to (so also gw-subscribed)
//
//       sub/unsub   GW ann
//      +-------->(1)-----+
//      |                 |
//      |                 |
//      V       destroy   v
// *-->(0)<--------------(3)
//      |^---------+      ^
//      |  destroy |      |
//      |          |      |
//      +-------->(2)<----+
//        GW ann    subscribe/unsub
//
// You can look for the states and transitions in the code below, e.g.
// (0) -> (1)
//
// Note: if it's not our activity context, we need to gw-(un)subscribe to the
// GW update messages on certain transitions:
// - on changes from { (1), (2) } -> (3) we send a subscribe message
// - on changes from (3) -> (2) we send an unsubscribe message
// - on destruction, we drop all the information about the context; let
// anyone subscribe to it and create a new contextData in state (1), we don't
// care - these subscriptions are inactive from the get go, since the context
// can't be created again.
//
// The contextData also contains the current snapshot of the context if it's
// currently gw-subscribed to (so states (2"') and (3) below).
//
// Note: We're mostly going to the trouble of keeping unannounced contexts
// (state (1)) in order to allow other GW message subscribers to see a new
// context being created and subscribe to it before the message has reached
// our handler. Also, only sending a CONTEXT SUBSCRIBE on state (3) instead
// of on GW announce means no unnecessary updates are being distributed to
// every instance of this library.
//
// Also, in the HC subscribing to an unknown context is OK as well so we're
// keeping this behavior.
//
// Note: above is an abridged version of the state machine; states (2) and (3)
// have three substates depending on whether the context is a global context,
// our own activity context, or a foreign activity's context. Subscription
// messages are only sent on { (1), (2'), (2") } -> { (3'), (3") }, with the
// unsubscribe message sent on { (3'), (3"), (3"') } -> { (1), (2'), (2") }
// if a  subscribe was sent previously (so we'll send a final unsubscribe if
// we subscribe to a foreign activity's context, then join the activity, then
// unsubscribe - this is to avoid still potentially receiving unwanted updates
// if we leave the activity).
//
// Full state diagram (not showing 'destroy' transitions):
//
//        join activity
//      +------------------>(3"')<------+
//      |                    ^          |
//      |                    | join     |
//      |                    | activity |
//      | activity created   |          |
//      +------------------>(3")<----+  |
//      |                            |  |
//      | global ctx ann             |  |
//      +------------------>(3')<-+  |  |
//      |                         |  |  |
//      |                         |  |  |
//     (1)                        |  |  |
//      ^                         |  |  |
//      | bridge-(un)subscribe   bridge-(un)subscribe
//      |                         |  |  |
//      V                         |  |  |
// *-->(0)                        |  |  |
//      |                         |  |  |
//      | global ctx ann          |  |  |
//      +------------------>(2')<-+  |  |
//      |                            |  |
//      | activity created           |  |
//      +------------------>(2")<----+  |
//      |                    |          |
//      |                    | join     |
//      |                    | activity |
//      | join activity      V          |
//      +------------------>(2"')<------+
//
// ===========================
// Supported use cases
// ===========================
//
// - bridge-(un)subscribe to shared context by name
// - bridge-(un)subscribe to activity context for activity we ARE a member of
//      - the context name is the activity id
//      - here the subscriptions become inactive if we leave the activity
//      - HOWEVER these subscriptions will become inactive if we leave the
//      activity, and any further subscriptions to the activity's context
//      will be inactive.
//          The protocol provides no way for us to know other than through
//      the LEAVE ACTIVITY success message which is sent by our peer and we
//      can't observe it here, so we have no way to know to send an explicit
//      subscription in order to reactivate the bridge-subscription.
//          We could deal with this by extending the GW connection to allow
//      us to inspect outgoing messages and react to the LEAVE ACTIVITY, but
//      keeping a few stale objects around isn't worth the code complexity.
//          This transition would be represented by (2"') -> (2") and
//      (3"') -> (3") in the state diagram, where (3"') -> (3") would prompt
//      a subscribe message.
// - bridge-(un)subscribe to context of activity we're NOT in
//      - the context name is the activity id
//      - the subscription will stay active even if we join the activity later
//      - again, these subscriptions will become inactive if we leave the
//      activity
//
// Also note that unsubscribing from destroyed contexts is not required,
// as the data is cleared up automatically (but it doesn't hurt).
// Unsubscriptions are guaranteed to be safe and idempotent.
export class GW3Bridge implements ContextBridge {
    private _logger: Logger;
    private _connection: Connection;
    // used for sending messages as it provides a promise-based interface
    private _gw3Session: Glue42Core.Connection.GW3DomainSession;

    // contexts in state { (1), (2), (3) }
    private _contextNameToData: { [contextName: string]: ContextData } = {};

    // for disposing purposes only
    private _gw3Subscriptions: any[] = [];

    // increment for every bridge-subscribe; used to unsubscribe()
    private _nextCallbackSubscriptionNumber = 0;

    // mapping announced contexts' name <-> id
    private _contextNameToId: { [contextName: string]: string } = {};
    private _contextIdToName: { [contextId: string]: string } = {};

    public constructor(config: ContextsConfig) {
        this._connection = config.connection;
        this._logger = config.logger;
        this._gw3Session = this._connection.domain(
            "global",
            [
                msg.GW_MESSAGE_CONTEXT_CREATED,
                msg.GW_MESSAGE_SUBSCRIBED_CONTEXT,
                msg.GW_MESSAGE_CONTEXT_DESTROYED,
                msg.GW_MESSAGE_CONTEXT_UPDATED,
            ]);

        // TODO: logging, validation and error handling

        this.subscribeToContextCreatedMessages();

        this.subscribeToContextUpdatedMessages();

        this.subscribeToContextDestroyedMessages();

        this._connection.replayer?.drain(
            ContextMessageReplaySpec.name,
            (message) => {
                const type = (message as any).type;
                if (!type) {
                    return;
                }

                if (type === msg.GW_MESSAGE_CONTEXT_CREATED ||
                    type === msg.GW_MESSAGE_CONTEXT_ADDED ||
                    type === msg.GW_MESSAGE_ACTIVITY_CREATED) {
                    this.handleContextCreatedMessage(message as ContextMessage);
                } else if (type === msg.GW_MESSAGE_SUBSCRIBED_CONTEXT ||
                    type === msg.GW_MESSAGE_CONTEXT_UPDATED ||
                    type === msg.GW_MESSAGE_JOINED_ACTIVITY) {
                    this.handleContextUpdatedMessage(message as ContextMessage);
                } else if (type === msg.GW_MESSAGE_CONTEXT_DESTROYED ||
                    type === msg.GW_MESSAGE_ACTIVITY_DESTROYED) {
                    this.handleContextDestroyedMessage(message as ContextMessage);
                }
            });
    }

    public dispose(): void {
        for (const sub of this._gw3Subscriptions) {
            this._connection.off(sub);
        }
        this._gw3Subscriptions.length = 0;
        for (const contextName in this._contextNameToData) {
            if (this._contextNameToId.hasOwnProperty(contextName)) {
                delete this._contextNameToData[contextName];
            }
        }
    }

    public createContext(name: Glue42Core.Contexts.ContextName, data: any): Promise<string> {
        return this._gw3Session
            .send<ContextMessage>({
                type: msg.GW_MESSAGE_CREATE_CONTEXT,
                domain: "global",
                name,
                data,
                lifetime: "retained",
            })
            .then((createContextMsg: ContextMessage) => {
                this._contextNameToId[name] = createContextMsg.context_id;
                if (!this._contextIdToName[createContextMsg.context_id]) {
                    this._contextIdToName[createContextMsg.context_id] = name;
                    const contextData = this._contextNameToData[name] || new ContextData(createContextMsg.context_id, name, true, undefined);
                    contextData.isAnnounced = true;
                    contextData.name = name;
                    contextData.contextId = createContextMsg.context_id;
                    this._contextNameToData[name] = contextData;
                    contextData.context = createContextMsg.data;
                    contextData.sentExplicitSubscription = true;
                    if (contextData.context) {
                        this.invokeUpdateCallbacks(contextData, contextData.context, undefined);
                    }
                    return this.update(name, data).then(() => createContextMsg.context_id);
                }
                return createContextMsg.context_id;
            });
    }

    public all(): Glue42Core.Contexts.ContextName[] {
        return Object.keys(this._contextNameToData)
            .filter((name) => this._contextNameToData[name].isAnnounced);
    }

    public async update(name: Glue42Core.Contexts.ContextName, delta: any): Promise<void> {

        // - send context update message
        //
        // - on success, apply delta to context currently in contextData

        // should we implicitly create the context?

        const contextData = this._contextNameToData[name];

        if (!contextData || !contextData.isAnnounced) {
            return this.createContext(name, delta) as any as Promise<void>;
        }

        // TODO: explain why --> because this
        let currentContext = contextData.context;
        if (!contextData.hasCallbacks()) {
            currentContext = await this.get(contextData.name, false);
        }

        const calculatedDelta = this.calculateContextDelta(currentContext , delta);

        if (!Object.keys(calculatedDelta.added).length
            && !Object.keys(calculatedDelta.updated).length
            && !calculatedDelta.removed.length) {
            return Promise.resolve();
        }

        return this._gw3Session
            .send({
                type: msg.GW_MESSAGE_UPDATE_CONTEXT,
                domain: "global",
                context_id: contextData.contextId,
                delta: calculatedDelta,
            }, {}, { skipPeerId: false })
            .then((gwResponse: any) => {
                this.handleUpdated(contextData, calculatedDelta, {
                    updaterId: gwResponse.peer_id
                });
            });
    }

    public set(name: Glue42Core.Contexts.ContextName, data: any): Promise<void> {

        const contextData = this._contextNameToData[name];

        if (!contextData || !contextData.isAnnounced) {
            return this.createContext(name, data) as any as Promise<void>;
        }

        // SBGW_D-194
        return this._gw3Session
            .send({
                type: msg.GW_MESSAGE_UPDATE_CONTEXT,
                domain: "global",
                context_id: contextData.contextId,
                delta: { reset: data },
            }, {}, { skipPeerId: false })
            .then((gwResponse: any) => {
                this.handleUpdated(contextData, { reset: data, added: {}, removed: [], updated: {} }, { updaterId: gwResponse.peer_id });
            });
    }

    /**
     * Return a context's data asynchronously as soon as any becomes available
     */
    public get(name: Glue42Core.Contexts.ContextName, resolveImmediately: boolean): Promise<any> {

        if (resolveImmediately === undefined) {
            resolveImmediately = true;
        }

        const contextData = this._contextNameToData[name];
        if (!contextData ||
            !contextData.isAnnounced ||
            !contextData.hasCallbacks()) {

            if (!resolveImmediately) {
                return new Promise<any>(async (resolve, reject) => {
                    this.subscribe(name, (data: any, delta: any, removed: string[], un: Glue42Core.Contexts.ContextSubscriptionKey) => {
                        this.unsubscribe(un);
                        resolve(data);
                    });
                });
            }
        }

        return Promise.resolve(contextData && contextData.context);
    }

    /**
     * Creates a subscription to a given context which may or may not exist/be
     * announced as of yet.
     *
     * NB: This method publishes an initial snapshot on subscription. Note that
     * at this point the method itself may not have returned and the returned
     * ContextSubscriptionKey is not saved in the return variable; if you want
     * to unsubscribe from within the subscription callback, use the key argument
     * of the callback.
     */
    public subscribe(
        name: Glue42Core.Contexts.ContextName,
        callback: (
            data: any,
            delta: any,
            removed: string[],
            key: Glue42Core.Contexts.ContextSubscriptionKey,
            extraData?: any) => void)
        : Promise<Glue42Core.Contexts.ContextSubscriptionKey> {

        // - populate contextData's updateCallbacks with new entry
        //
        // - examine contextData and determine if we need to send a subscribe
        //
        // - if the context is announced, ensure handler gets snapshot

        const thisCallbackSubscriptionNumber = this._nextCallbackSubscriptionNumber;
        this._nextCallbackSubscriptionNumber += 1;

        let contextData = this._contextNameToData[name];

        if (!contextData ||
            !contextData.isAnnounced) {
            // (0) -> (1)
            contextData = contextData || new ContextData(undefined, name, false, undefined);
            this._contextNameToData[name] = contextData;
            contextData.updateCallbacks[thisCallbackSubscriptionNumber] = callback;

            // this will end up in handleContextUpdate which will cause a snapshot to get sent
            // return this.createContext(name, {})
            // 	.then(() => thisCallbackSubscriptionNumber);
            return Promise.resolve(thisCallbackSubscriptionNumber);
        }

        const hadCallbacks = contextData.hasCallbacks();

        contextData.updateCallbacks[thisCallbackSubscriptionNumber] = callback;

        if (!hadCallbacks) {
            // first subscriber: (2) -> (3)

            if (!contextData.joinedActivity) {

                // if we've created the context ourselves using
                // createContext
                if (contextData.context &&
                    contextData.sentExplicitSubscription) {
                    callback(contextData.context, contextData.context, [], thisCallbackSubscriptionNumber);
                    return Promise.resolve(thisCallbackSubscriptionNumber);
                }

                // (2') -> (3') or (2") -> (3")
                // shared context or not our activity;
                // we need to gw-subscribe

                // OTOH, no need to explicitly push a snapshot here,
                // the GW will reply with a SUBSCRIBED CONTEXT with a snapshot
                // which we'll push through subscribeToContextUpdatedMessages
                // (not that we have a snapshot right now - it's not our activity,
                // and we haven't subscribed already so we can't have received updates)

                return this.sendSubscribe(contextData)
                    .then(() => thisCallbackSubscriptionNumber);
            } else {

                // (2"') -> (3"')
                // our activity, which we're tracking anyway
                // no need to gw-subscribe, just push the snapshot to the new subscriber

                callback(contextData.context, contextData.context, [], thisCallbackSubscriptionNumber);
                return Promise.resolve(thisCallbackSubscriptionNumber);
            }
        } else {
            // not first subscriber; no need to gw-subscribe, just push snapshot
            // (3) -> (3)

            callback(contextData.context, contextData.context, [], thisCallbackSubscriptionNumber);
            return Promise.resolve(thisCallbackSubscriptionNumber);
        }
    }

    public unsubscribe(subscriptionKey: Glue42Core.Contexts.ContextSubscriptionKey): void {
        for (const name of Object.keys(this._contextNameToData)) {
            const contextId = this._contextNameToId[name];
            const contextData = this._contextNameToData[name];

            if (!contextData) {
                return;
            }

            const hadCallbacks = contextData.hasCallbacks();

            delete contextData.updateCallbacks[subscriptionKey];

            if (contextData.isAnnounced &&
                hadCallbacks &&
                !contextData.hasCallbacks() &&
                contextData.sentExplicitSubscription) {
                // (3) -> (2)
                this.sendUnsubscribe(contextData);
            }

            if (!contextData.isAnnounced &&
                // (1) -> (0)
                !contextData.hasCallbacks()) {
                delete this._contextNameToData[name];
            }
        }
    }

    private handleUpdated(contextData: ContextData, delta: Glue42Core.Contexts.ContextDelta, extraData?: any) {
        // for correctness proof, see note about serialized context
        // updates in subscribeToContextUpdatedMessages

        const oldContext = contextData.context;
        contextData.context = applyContextDelta(contextData.context, delta);

        if (this._contextNameToData[contextData.name] === contextData &&
            !deepEqual(oldContext, contextData.context)) {
            this.invokeUpdateCallbacks(contextData, contextData.context, delta, extraData);
        }
    }

    private subscribeToContextCreatedMessages() {

        // when a new context is announced:
        //
        // - record the fact that it's announced, so when the first
        //      bridge-subscribers come in, we do a gw-subscribe
        //
        // - record its name/contextId association
        //
        // - record its activity information, and the fact that this
        //      activity exists and that we're not joined in it (yet?)
        //
        // - if any bridge-subscribers already present, do a gw-subscribe

        const createdMessageTypes =
            [
                msg.GW_MESSAGE_CONTEXT_ADDED,
                msg.GW_MESSAGE_CONTEXT_CREATED,
                msg.GW_MESSAGE_ACTIVITY_CREATED,
            ];

        for (const createdMessageType of createdMessageTypes) {
            const sub = this._connection.on(
                createdMessageType,
                this.handleContextCreatedMessage.bind(this));
            this._gw3Subscriptions.push(sub);
        }
    }

    private handleContextCreatedMessage(contextCreatedMsg: ContextMessage): void {
        const createdMessageType = contextCreatedMsg.type;
        if (createdMessageType === msg.GW_MESSAGE_ACTIVITY_CREATED) {
            // activity context

            this._contextNameToId[contextCreatedMsg.activity_id] = contextCreatedMsg.context_id;
            this._contextIdToName[contextCreatedMsg.context_id] = contextCreatedMsg.activity_id;
        } else if (createdMessageType === msg.GW_MESSAGE_CONTEXT_ADDED) {
            // shared context

            this._contextNameToId[contextCreatedMsg.name] = contextCreatedMsg.context_id;
            this._contextIdToName[contextCreatedMsg.context_id] = contextCreatedMsg.name;
        } else if (createdMessageType === msg.GW_MESSAGE_CONTEXT_CREATED) {
            // created by us, data already populated

            // NB: the promise resolution from createContext is supposed to run *before*
            // we see the CONTEXT CREATED here, so _contextIdToName/_contextNameToId
            // are supposed to already be populated (this is because the gw connection
            // success handler is subscribed long before this one)
        }

        const name = this._contextIdToName[contextCreatedMsg.context_id];

        if (!name) {
            // we're supposed to have recorded the name
            throw new Error("Received created event for context with unknown name: " + contextCreatedMsg.context_id);
        }

        if (!this._contextNameToId[name]) {
            // we're also supposed to have recorded it in the opposite direction
            throw new Error("Received created event for context with unknown id: " + contextCreatedMsg.context_id);
        }

        let contextData = this._contextNameToData[name];

        if (contextData) {
            if (contextData.isAnnounced) {
                return;
            } else {
                // (1) -> (3') or (1) -> (3")

                // someone's already expressed interest in this context and now
                // it's being announced

                // you might think that since the activity context's id is
                // auto-generated no one could have already context-subscribed, but
                // there might be another ACTIVITY CREATED observer on the same
                // GW connection who saw this message before us and reacted by
                // subscribing to the context - so we need to handle this case

                if (!contextData.hasCallbacks()) {
                    throw new Error("Assertion failure: contextData.hasCallbacks()");
                }

                // update its state and send a gw-subscribe; we're expecting an update message

                contextData.isAnnounced = true;
                contextData.contextId = contextCreatedMsg.context_id;
                contextData.activityId = contextCreatedMsg.activity_id;

                // if we're observing the ACTIVITY CREATED message,
                // we're not one of its members and we need to gw-subscribe
                // explicitly; of course we could be getting joined to the activity
                // pretty soon which would subscribe us to context updates implicitly

                // long story short, if we're about to be joined to the activity
                // and an observer to ACTIVITY CREATED subscribes to the activity's context
                // before we get to this point, we'll send a needless SUBSCRIBE CONTEXT
                // but there's no harm done by beating that to the punch, and there's
                // no clean way to avoid this situation so we leave this as an artifact
                // of the implementation

                // whether activity or not, we'll push the initial snapshot in the
                // subscribeToContextUpdatedMessages handler

                if (!contextData.sentExplicitSubscription) {
                    this.sendSubscribe(contextData);
                }
            }
        } else {
            // (0) -> (2') or (0) -> (2")
            // first time we hear about this context
            // we're not subscribed to it in the GW so just create a placeholder
            // and wait for someone to subscribe to it - we'll THEN send a subscribe to the GW

            this._contextNameToData[name] = contextData =
                new ContextData(contextCreatedMsg.context_id, name, true, contextCreatedMsg.activity_id);
        }
    }

    private subscribeToContextUpdatedMessages() {

        // receiving a context update or snapshot
        //
        // if it's JOINED ACTIVITY, we may be a new peer as part of activity
        // creation, so it's the first time we've heard about it -
        // record the activity information in the contextData
        //
        // otherwise, this message is a response/consequence of our gw-subscribe
        // message sent on entering state (3)
        //
        // in any case, apply any deltas to the contextData.context, and
        // propagate the context data and delta to any bridge-subscription
        // handlers
        //
        // note that context updates are always performed when reacting to
        // a GW message, so the data over time is tied to the flow of
        // messages coming in through the gateway connection; the GW decides
        // which update comes before which and our view of the changes to
        // the context is consistent with it (i.e. the GW is the serializing
        // agent)

        const updatedMessageTypes =
            [
                msg.GW_MESSAGE_CONTEXT_UPDATED,
                msg.GW_MESSAGE_SUBSCRIBED_CONTEXT,
                msg.GW_MESSAGE_JOINED_ACTIVITY,
            ];

        for (const updatedMessageType of updatedMessageTypes) {
            const sub = this._connection.on(
                updatedMessageType,
                this.handleContextUpdatedMessage.bind(this));
            this._gw3Subscriptions.push(sub);
        }
    }

    private handleContextUpdatedMessage(contextUpdatedMsg: ContextMessage): void {
        const updatedMessageType = contextUpdatedMsg.type;
        const contextId = contextUpdatedMsg.context_id;
        let contextData = this._contextNameToData[this._contextIdToName[contextId]];
        // this flag is basically used to make sure we raise an update for a new activity
        // even if its initial context is empty
        // see "long analysis for callback behavior in GW3: several cases" comment in
        // activityMyApi.ts in js-activity, case 1-1-1
        // it serves a similar purpose for gw_message_subscribed_context
        const justSeen = !contextData || !contextData.isAnnounced;

        if (updatedMessageType === msg.GW_MESSAGE_JOINED_ACTIVITY) {
            if (!contextData) {
                // (0) -> (2"')

                // we're in the middle of activity creation
                contextData = new ContextData(contextId, contextUpdatedMsg.activity_id, true, contextUpdatedMsg.activity_id);
                this._contextNameToData[contextUpdatedMsg.activity_id] = contextData;
                this._contextIdToName[contextId] = contextUpdatedMsg.activity_id;
                this._contextNameToId[contextUpdatedMsg.activity_id] = contextId;
            } else {
                // (1) -> (3"'), (2") -> (2"') or (3") -> (3"')

                contextData.contextId = contextId;
                contextData.isAnnounced = true;
                contextData.activityId = contextUpdatedMsg.activity_id;
            }
            contextData.joinedActivity = true;
        } else {
            if (!contextData || !contextData.isAnnounced) {
                if (updatedMessageType === msg.GW_MESSAGE_SUBSCRIBED_CONTEXT) {
                    // we've tried to create a context that already exists
                    contextData = contextData || new ContextData(contextId, contextUpdatedMsg.name, true, undefined);
                    contextData.sentExplicitSubscription = true;
                    this._contextNameToData[contextUpdatedMsg.name] = contextData;
                    this._contextIdToName[contextId] = contextUpdatedMsg.name;
                    this._contextNameToId[contextUpdatedMsg.name] = contextId;
                } else {
                    this._logger.error(`Received 'update' for unknown context: ${contextId}`);
                }
                return;
            }
        }

        const oldContext = contextData.context;

        if (updatedMessageType === msg.GW_MESSAGE_SUBSCRIBED_CONTEXT) {
            contextData.context = contextUpdatedMsg.data || {};
        } else if (updatedMessageType === msg.GW_MESSAGE_JOINED_ACTIVITY) {
            contextData.context = contextUpdatedMsg.context_snapshot || {};
        } else if (updatedMessageType === msg.GW_MESSAGE_CONTEXT_UPDATED) {
            contextData.context = applyContextDelta(
                contextData.context,
                contextUpdatedMsg.delta as Glue42Core.Contexts.ContextDelta);
        } else {
            throw new Error("Unrecognized context update message " + updatedMessageType);
        }

        if (justSeen ||
            !deepEqual(contextData.context, oldContext) ||
            updatedMessageType === msg.GW_MESSAGE_SUBSCRIBED_CONTEXT) {
            this.invokeUpdateCallbacks(contextData, contextData.context, contextUpdatedMsg.delta, { updaterId: contextUpdatedMsg.updater_id });
        }
    }

    private invokeUpdateCallbacks(contextData: ContextData, data: any, delta?: Glue42Core.Contexts.ContextDelta, extraData?: any) {
        delta = delta || { added: {}, updated: {}, reset: {}, removed: [] };
        for (const updateCallbackIndex in contextData.updateCallbacks) {
            if (contextData.updateCallbacks.hasOwnProperty(updateCallbackIndex)) {
                try {
                    const updateCallback = contextData.updateCallbacks[updateCallbackIndex];
                    updateCallback(deepClone(data), Object.assign({}, delta.added || {}, delta.updated || {}, delta.reset || {}), delta.removed, parseInt(updateCallbackIndex, 10), extraData);
                } catch (err) {
                    this._logger.debug("callback error: " + JSON.stringify(err));
                }
            }
        }
    }

    private subscribeToContextDestroyedMessages() {
        // wipe all bookkeeping related to this context

        const destroyedMessageTypes =
            [
                msg.GW_MESSAGE_CONTEXT_DESTROYED,
                msg.GW_MESSAGE_ACTIVITY_DESTROYED,
            ];

        for (const destroyedMessageType of destroyedMessageTypes) {
            const sub = this._connection.on(
                destroyedMessageType,
                this.handleContextDestroyedMessage.bind(this));
            this._gw3Subscriptions.push(sub);
        }
    }

    private handleContextDestroyedMessage(destroyedMsg: ContextMessage): void {
        const destroyedMessageType = destroyedMsg.type;
        let contextId;
        let name;

        // (?) -> (0)

        if (destroyedMessageType === msg.GW_MESSAGE_ACTIVITY_DESTROYED) {
            name = destroyedMsg.activity_id;
            contextId = this._contextNameToId[name];
            if (!contextId) {
                this._logger.error(`Received 'destroyed' for unknown activity: ${destroyedMsg.activity_id}`);
                return;
            }
        } else {
            contextId = destroyedMsg.context_id;
            name = this._contextIdToName[contextId];
            if (!name) {
                this._logger.error(`Received 'destroyed' for unknown context: ${destroyedMsg.context_id}`);
                return;
            }
        }

        delete this._contextIdToName[contextId];
        delete this._contextNameToId[name];

        const contextData = this._contextNameToData[name];
        delete this._contextNameToData[name];

        if (!contextData || !contextData.isAnnounced) {
            this._logger.error(`Received 'destroyed' for unknown context: ${contextId}`);
            return;
        }
    }

    private sendSubscribe(contextData: ContextData): Promise<void> {
        contextData.sentExplicitSubscription = true;

        return this._gw3Session
            .send({
                type: msg.GW_MESSAGE_SUBSCRIBE_CONTEXT,
                domain: "global",
                context_id: contextData.contextId,
            }).then((_) => undefined);
    }

    private sendUnsubscribe(contextData: ContextData): Promise<void> {
        contextData.sentExplicitSubscription = false;

        return this._gw3Session
            .send({
                type: msg.GW_MESSAGE_UNSUBSCRIBE_CONTEXT,
                domain: "global",
                context_id: contextData.contextId,
            }).then((_) => undefined);
    }

    private calculateContextDelta(from: any, to: any): Glue42Core.Contexts.ContextDelta {
        const delta: Glue42Core.Contexts.ContextDelta = { added: {}, updated: {}, removed: [], reset: undefined };
        if (from) {
            for (const x of Object.keys(from)) {
                if (Object.keys(to).indexOf(x) !== -1
                    && to[x] !== null
                    && !deepEqual(from[x], to[x])) {
                    delta.updated[x] = to[x];
                }
            }
        }
        for (const x of Object.keys(to)) {
            if (!from || (Object.keys(from).indexOf(x) === -1)) {
                if (to[x] !== null) {
                    delta.added[x] = to[x];
                }
            } else if (to[x] === null) {
                delta.removed.push(x);
            }
        }
        return delta;
    }
}
