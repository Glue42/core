import { Glue42Core } from "../../glue";
import { Logger } from "../logger/logger";

/**
 * This file contains a set of internal types used across the API codebase.
 * These are not part of api.ts because they should not be visible for the library user
 */

export interface ConnectionSettings {
    identity?: Identity;
    logger?: Logger;
    protocolVersion?: number;
    ws?: string;
    sharedWorker?: string;
    inproc?: Glue42Core.InprocGWSettings;
    /** If connection is lost, try reconnecting on some interval */
    reconnectInterval?: number;
    /** If connection is lost, how many times to try */
    reconnectAttempts?: number;
    replaySpecs?: Glue42Core.Connection.MessageReplaySpec[];
}

export interface Identity {
    /* unique application name  */
    application?: string;
    /* the application name */
    applicationName?: string;
    instance?: string;
    region?: string;
    environment?: string;
    machine?: string;
    process?: number;
    system?: string;
    service?: string;
    user?: string;
    windowId?: string;
    api?: string;
}

/**
 * GW3 protocol
 */
export interface GW3Protocol {
    protocolVersion: number;
    isLoggedIn: boolean;
    domain(
        domain: string,
        logger: Logger,
        successMessages?: string[],
        errorMessages?: string[]): Glue42Core.Connection.GW3DomainSession;

    authToken(): Promise<string>;
    processStringMessage(message: string): { msg: object, msgType: string };
    createStringMessage(message: object): string;

    processObjectMessage(message: object): { msg: object, msgType: string };
    createObjectMessage(message: object): object;

    login(message: Glue42Core.Auth, reconnect?: boolean): Promise<Identity>;
    logout(): Promise<void>;
    loggedIn(callback: (() => void)): () => void;
}

export interface Transport {
    isObjectBasedTransport?: boolean;

    sendObject?: (msg: object, options?: Glue42Core.Connection.SendMessageOptions) => Promise<void>;

    send(msg: string, options?: Glue42Core.Connection.SendMessageOptions): Promise<void>;

    onMessage(callback: (msg: string | object) => void): void;

    onConnectedChanged(callback: (connected: boolean, reason?: string) => void): void;

    open(): Promise<void>;

    close(): Promise<void>;

    name(): string;

    reconnect(): Promise<void>;
}
