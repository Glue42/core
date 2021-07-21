import { Glue42Core } from "../../../glue";
import { default as CallbackRegistryFactory, CallbackRegistry } from "callback-registry";
import generate from "shortid";
import { Logger } from "../../logger/logger";
import Connection from "../connection";

interface GW3Message {
    request_id?: string;
    domain?: string;
    peer_id?: string;
    _tag?: object;
}

/**
 * Handles domain session lifetime and events for a given connection/domain pair
 */
export default function (domain: string, connection: Connection, logger: Logger, successMessages?: string[], errorMessages?: string[]): Glue42Core.Connection.GW3DomainSession {

    if (domain == null) {
        domain = "global";
    }

    successMessages = successMessages || ["context-created", "success", "subscribed-context"];
    errorMessages = errorMessages || ["error"];

    let isJoined = false;
    let tryReconnecting = false;
    /** holds latest options passed to join - used when doing reconnects */
    let _latestOptions: object | undefined;
    // #deleteme TODO: verify this gets properly set to true
    let _connectionOn: boolean = false;

    const callbacks: CallbackRegistry = CallbackRegistryFactory();

    // attach event handlers to connection
    connection.disconnected(handleConnectionDisconnected);
    connection.loggedIn(handleConnectionLoggedIn);
    connection.on("success", (msg: GW3Message) => handleSuccessMessage(msg));
    connection.on("error", (msg: GW3Message) => handleErrorMessage(msg));
    connection.on("result", (msg: GW3Message) => handleSuccessMessage(msg));

    if (successMessages) {
        successMessages.forEach((sm) => {
            connection.on(sm, (msg: GW3Message) => handleSuccessMessage(msg));
        });
    }
    if (errorMessages) {
        errorMessages.forEach((sm) => {
            connection.on(sm, (msg: GW3Message) => handleErrorMessage(msg));
        });
    }

    interface RequestHandler {
        success: (success: { _tag?: object }) => void;
        error: (error: { _tag?: object, err?: string }) => void;
    }

    const requestsMap: { [key: string]: RequestHandler } = {};

    function join(options?: object): Promise<{}> {
        _latestOptions = options;

        return new Promise((resolve, reject) => {

            if (isJoined) {
                resolve();
                return;
            }
            let joinPromise: Promise<{}>;

            if (domain === "global") {
                joinPromise = _connectionOn ? Promise.resolve<{}>({}) : Promise.reject<{}>("not connected to gateway");
            } else {
                logger.debug(`joining domain ${domain}`);

                const joinMsg = {
                    type: "join",
                    destination: domain,
                    domain: "global",
                    options,
                };

                // #deleteme TODO: what happens if multiple clients try to open the same domain?
                // e.g. contexts
                joinPromise = send(joinMsg);
            }
            joinPromise
                .then(() => {
                    handleJoined();
                    resolve();
                })
                .catch((err) => {
                    logger.debug("error joining " + domain + " domain: " + JSON.stringify(err));
                    reject(err);
                });
        });
    }

    // terminology: join vs leave (domain), connect vs login vs disconnect (to/from GW)
    function leave(): Promise<void> {
        if (domain === "global") {
            return Promise.resolve();
        }

        logger.debug("stopping session " + domain + "...");
        const leaveMsg = {
            type: "leave",
            destination: domain,
            domain: "global",
        };
        tryReconnecting = false;
        // #deleteme - handling
        return send(leaveMsg).then(() => {
            isJoined = false;
            callbacks.execute("onLeft");
        });
    }

    function handleJoined() {
        logger.debug("did join " + domain);

        isJoined = true;
        const wasReconnect = tryReconnecting;
        tryReconnecting = false;
        callbacks.execute("onJoined", wasReconnect);
    }

    function handleConnectionDisconnected() {
        _connectionOn = false;
        logger.debug("connection is down");
        isJoined = false;
        tryReconnecting = true;
        callbacks.execute("onLeft", { disconnected: true });
    }

    function handleConnectionLoggedIn() {
        _connectionOn = true;
        if (tryReconnecting) {
            logger.debug("connection is now up - trying to reconnect...");
            join(_latestOptions);
        }
    }

    function onJoined(callback: (wasReconnect: boolean) => void) {
        if (isJoined) {
            callback(false);
        }

        return callbacks.add("onJoined", callback);
    }

    function onLeft(callback: () => void) {
        if (!isJoined) {
            callback();
        }

        return callbacks.add("onLeft", callback);
    }

    function handleErrorMessage(msg: GW3Message) {
        if (domain !== msg.domain) {
            return;
        }

        const requestId = msg.request_id;
        if (!requestId) {
            return;
        }
        const entry = requestsMap[requestId];
        if (!entry) {
            return;
        }

        entry.error(msg);
    }

    function handleSuccessMessage(msg: GW3Message) {
        if (msg.domain !== domain) {
            return;
        }
        const requestId = msg.request_id;
        if (!requestId) {
            return;
        }
        const entry = requestsMap[requestId];
        if (!entry) {
            return;
        }
        entry.success(msg);
    }

    function getNextRequestId() {
        return generate();
    }

    /**
     * Send a message
     * @param msg message to send
     * @param tag a custom object (tag) - it will be transferred to success/error callback
     * @param success
     * @param error
     */
    function send<T>(msg: GW3Message, tag?: object, options?: Glue42Core.Connection.SendMessageOptions): Promise<T> {
        options = options || {};
        // Allows function caller to override request_id
        msg.request_id = msg.request_id || getNextRequestId();
        // Allows function caller to override domain (join/leave messages are in global domain)
        msg.domain = msg.domain || domain;
        if (!options.skipPeerId) {
            msg.peer_id = connection.peerId;
        }

        const requestId = msg.request_id;

        return new Promise((resolve, reject) => {
            requestsMap[requestId] = {
                success: (successMsg: any) => {
                    delete requestsMap[requestId];
                    successMsg._tag = tag;
                    resolve(successMsg);
                },
                error: (errorMsg: { _tag?: any, error?: string }) => {
                    logger.warn(`GW error - ${JSON.stringify(errorMsg)} for request ${JSON.stringify(msg)}`);
                    delete requestsMap[requestId];
                    errorMsg._tag = tag;
                    reject(errorMsg);
                },
            };
            connection
                .send(msg, options)
                .catch((err: string) => {
                    requestsMap[requestId].error({ err });
                });
        });
    }

    function sendFireAndForget(msg: GW3Message): Promise<void> {
        // Allows function caller to override request_id
        msg.request_id = msg.request_id ? msg.request_id : getNextRequestId();
        // Allows function caller to override domain (join/leave messages are in global domain)
        msg.domain = msg.domain || domain;
        msg.peer_id = connection.peerId;

        return connection.send(msg);
    }

    return {
        join,
        leave,
        onJoined,
        onLeft,
        send,
        sendFireAndForget,
        on: <T>(type: string, callback: (msg: T) => void) => {
            connection.on(type, (msg: any) => {
                if (msg.domain !== domain) {
                    return;
                }

                try {
                    callback(msg);
                } catch (e) {
                    logger.error(`Callback  failed: ${e} \n ${e.stack} \n msg was: ${JSON.stringify(msg)}`, e);
                }
            });
        },
        loggedIn: (callback: () => void) => connection.loggedIn(callback),
        connected: (callback: (server: string) => void) => connection.connected(callback),
        disconnected: (callback: () => void) => connection.disconnected(callback),
        get peerId() {
            return connection.peerId;
        },
        get domain() {
            return domain;
        },
    };
}
