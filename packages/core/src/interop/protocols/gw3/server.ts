import { default as CallbackRegistryFactory, CallbackRegistry } from "callback-registry";
import ServerStreaming from "./server-streaming";
import {
    InvokeMessage,
    RegisterMethodMessage,
    ErrorMessage,
    YieldMessage,
    UnregisterMessage,
    TaggedMessage
} from "./messages";
import ServerRepository from "../../server/repository";
import { Glue42Core } from "../../../../glue";
import { ServerMethodInfo, ResultContext, ServerSubscriptionInfo, RequestContext } from "../../server/types";
import ClientRepository from "../../client/repository";
import { ServerProtocolDefinition } from "../../types";
import { Logger } from "../../../logger/logger";

export default class ServerProtocol implements ServerProtocolDefinition {
    private callbacks: CallbackRegistry = CallbackRegistryFactory();
    private streaming: ServerStreaming;

    constructor(private session: Glue42Core.Connection.GW3DomainSession, private clientRepository: ClientRepository, private serverRepository: ServerRepository, private logger: Logger) {
        this.streaming = new ServerStreaming(session, clientRepository, serverRepository);
        this.session.on("invoke", (msg: InvokeMessage) => this.handleInvokeMessage(msg));
    }

    public createStream(repoMethod: ServerMethodInfo): Promise<void> {
        // Utility things for this protocol
        repoMethod.protocolState.subscriptionsMap = {}; // ~subscription_id~ : {id:~, branchKey: '~', arguments: {~}, instance:{~}, etc.}
        repoMethod.protocolState.branchKeyToStreamIdMap = []; // [ {branchKey: '', streamId: 7}, {...}, ...]

        return this.register(repoMethod, true);
    }

    public register(repoMethod: ServerMethodInfo, isStreaming?: boolean): Promise<void> {
        const methodDef = repoMethod.definition;
        const flags = { streaming: isStreaming || false };

        const registerMsg: RegisterMethodMessage = {
            type: "register",
            methods: [{
                id: repoMethod.repoId,
                name: methodDef.name,
                display_name: methodDef.displayName,
                description: methodDef.description,
                version: methodDef.version,
                flags,
                object_types: methodDef.objectTypes || (methodDef as any).object_types, // object_type for backward compatibility
                input_signature: methodDef.accepts,
                result_signature: methodDef.returns,
                restrictions: undefined,
            }],
        };

        return this.session.send(registerMsg, { methodId: repoMethod.repoId })
            .then(() => {
                this.logger.debug("registered method " + repoMethod.definition.name + " with id " + repoMethod.repoId);
            })
            .catch((msg: ErrorMessage) => {
                this.logger.warn(`failed to register method ${repoMethod.definition.name} with id ${repoMethod.repoId} - ${JSON.stringify(msg)}`);
                throw msg;
            });
    }

    public onInvoked(callback: (methodToExecute: ServerMethodInfo, invocationId: string, invocationArgs: ResultContext) => void) {
        this.callbacks.add("onInvoked", callback);
    }

    public methodInvocationResult(method: ServerMethodInfo, invocationId: string, err: string, result: object) {
        let msg: YieldMessage | ErrorMessage;
        if (err || err === "") {
            msg = {
                type: "error",
                request_id: invocationId,
                reason_uri: "agm.errors.client_error",
                reason: err,
                context: result,
                peer_id: undefined,
            };
        } else {
            msg = {
                type: "yield",
                invocation_id: invocationId,
                peer_id: this.session.peerId,
                result,
                request_id: undefined,
            };
        }
        this.session.sendFireAndForget(msg);
    }

    public async unregister(method: ServerMethodInfo): Promise<void> {
        const msg: UnregisterMessage = {
            type: "unregister",
            methods: [method.repoId],
        };

        await this.session.send(msg);
    }

    public getBranchList(method: ServerMethodInfo): string[] {
        return this.streaming.getBranchList(method);
    }

    public getSubscriptionList(method: ServerMethodInfo, branchKey?: string): ServerSubscriptionInfo[] {
        return this.streaming.getSubscriptionList(method, branchKey);
    }

    public closeAllSubscriptions(method: ServerMethodInfo, branchKey?: string): void {
        this.streaming.closeMultipleSubscriptions(method, branchKey);
    }

    public pushData(method: ServerMethodInfo, data: object, branches: string[]): void {
        this.streaming.pushData(method, data, branches);
    }

    public pushDataToSingle(method: ServerMethodInfo, subscription: ServerSubscriptionInfo, data: object): void {
        this.streaming.pushDataToSingle(method, subscription, data);
    }

    public closeSingleSubscription(method: ServerMethodInfo, subscription: ServerSubscriptionInfo): void {
        this.streaming.closeSingleSubscription(method, subscription);
    }

    public acceptRequestOnBranch(requestContext: RequestContext, method: ServerMethodInfo, branch: string): void {
        this.streaming.acceptRequestOnBranch(requestContext, method, branch);
    }

    public rejectRequest(requestContext: RequestContext, method: ServerMethodInfo, reason: string): void {
        this.streaming.rejectRequest(requestContext, method, reason);
    }

    public onSubRequest(callback: (requestContext: RequestContext, repoMethod: ServerMethodInfo) => void): void {
        this.streaming.onSubRequest(callback);
    }

    public onSubAdded(callback: (subscription: ServerSubscriptionInfo, repoMethod: ServerMethodInfo) => void): void {
        this.streaming.onSubAdded(callback);
    }

    public onSubRemoved(callback: (subscriber: ServerSubscriptionInfo, repoMethod: ServerMethodInfo) => void): void {
        this.streaming.onSubRemoved(callback);
    }

    private handleInvokeMessage(msg: InvokeMessage) {
        const invocationId = msg.invocation_id;
        const callerId = msg.caller_id;
        const methodId = msg.method_id;
        const args = msg.arguments_kv;
        const methodList = this.serverRepository.getList();

        const method = methodList.filter((m) => {
            return m.repoId === methodId;
        })[0];

        // Stop if the message isn't for us
        if (method === undefined) {
            return;
        }

        const client = this.clientRepository.getServerById(callerId).instance;
        const invocationArgs = { args, instance: client };

        this.callbacks.execute("onInvoked", method, invocationId, invocationArgs);
    }
}
