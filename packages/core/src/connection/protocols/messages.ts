import { Identity } from "../types";

export interface CreateTokenReq {
    domain?: "global";
    type: "create-token";
    peer_id?: string;
    request_id?: string;
}

export interface CreateTokenRes {
    domain: "global";
    type: "token";
    request_id: string;
    token: string;
}

export interface WelcomeMessage {
    peer_id: string;
    options: { info: object, access_token: string };
    resolved_identity: Identity;
    available_domains: object[];
}
