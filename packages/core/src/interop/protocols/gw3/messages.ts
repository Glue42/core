import { Glue42Core } from "../../../../glue";
import { Identity } from "../../../connection/types";

export interface AddInterestMessage {
    caller_id: string;
    method_id: string;
    subscription_id: string;
    arguments_kv: object;
}

export interface RemoveInterestMessage {
    type: "remove-interest";
    method_id: string;
    subscription_id: string;
}

export interface InvokeMessage {
    type: "invoke";
    invocation_id: string;
    caller_id: string;
    method_id: string;
    arguments_kv: object;
}

export interface RegisterMethodMessage {
    type: "register";
    methods: MethodInfoMessage[];
}

export interface MethodInfoMessage {
    id: string;
    name: string;
    display_name?: string;
    description?: string;
    version?: number;
    flags: { [key: string]: any };
    object_types: string[];
    input_signature?: string;
    result_signature?: string;
    restrictions?: string;
}

export interface PeerAddedMessage {
    type: "peer-added";
    new_peer_id: string;
    meta: { local: boolean };
    identity: Identity;
}

export interface PeerRemovedMessage {
    type: "peer-removed";
    removed_id: string;
    reason: string;
}

export interface MethodsAddedMessage {
    type: "methods-added";
    peer_id: string;
    server_id: string;
    methods: MethodInfoMessage[];
}

export interface MethodsRemovedMessage {
    type: "methods-removed";
    peer_id: string;
    server_id: string;
    methods: string[];
}

export interface CallMessage {
    type: "call";
    server_id: string;
    method_id: string;
    arguments_kv: object;
}

export interface TaggedMessage {
    _tag?: any;
}

export interface ResultMessage extends TaggedMessage {
    type: "result";
    request_id: string;
    peer_id: string;
    result: object;
}

export interface ErrorMessage extends TaggedMessage {
    type: "error";
    peer_id?: string;
    request_id: string;
    reason: string;
    reason_uri: string;
    context: object;
}

export interface YieldMessage {
    type: "yield";
    invocation_id: string;
    peer_id: string;
    result: object;
    request_id?: string;
}

export interface UnregisterMessage {
    type: "unregister";
    methods: string[];
}

export interface SubscribeMessage {
    type: "subscribe";
    server_id: string;
    method_id: string;
    arguments_kv?: object;
}

export interface PublishMessage {
    type: "publish";
    stream_id: string;
    data: object;
}

export interface PostMessage {
    type: "post";
    subscription_id: string;
    data: object;
}

export interface DropSubscriptionMessage {
    type: "drop-subscription";
    subscription_id: string;
    reason: string;
}

export interface SubscriptionCancelledMessage {
    subscription_id: string;
}

export interface EventMessage {
    subscription_id: string;
    oob: boolean;
    snapshot: boolean;
    data: object;
}

export interface SubscribedMessage extends TaggedMessage {
    subscription_id: string;
}

export interface ErrorSubscribingMessage extends TaggedMessage {
    reason: string;
}
