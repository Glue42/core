import domainSession from "./gw3Domain";
import { Glue42Core } from "../../../glue";
import { default as CallbackRegistryFactory, CallbackRegistry } from "callback-registry";
import { GW3Protocol, Identity, ConnectionSettings } from "../types";
import Connection from "../connection";
import { Logger } from "../../logger/logger";
import { WelcomeMessage, CreateTokenReq, CreateTokenRes } from "./messages";
export default class GW3ProtocolImpl implements GW3Protocol {
    public protocolVersion: number = 3;

    private datePrefix = "#T42_DATE#";
    private datePrefixLen = this.datePrefix.length;
    private dateMinLen = this.datePrefixLen + 1; // prefix + at least one char (1970/01/01 = 0)
    private datePrefixFirstChar = this.datePrefix[0];
    private registry: CallbackRegistry = CallbackRegistryFactory();

    private globalDomain: Glue42Core.Connection.GW3DomainSession | undefined;

    /* Flag indicating if the user is currently logged in */
    private _isLoggedIn = false;

    /*
     * If true(default) the user wants to be connected.
     * If the user explicitly calls logout this will become false.
     * This is used to determine if it should retry trying to login.
     */
    private shouldTryLogin = true;

    /* True only if this is the initial login attempt. */
    private initialLogin = true;
    private initialLoginAttempts = 3;
    private pingTimer: any;
    private sessions: Glue42Core.Connection.GW3DomainSession[] = [];
    private loginConfig: Glue42Core.Auth | undefined;

    constructor(private connection: Connection, private settings: ConnectionSettings, private logger: Logger) {
        connection.disconnected(() => {
            this.handleDisconnected();
        });

        this.ping();
    }

    public get isLoggedIn() {
        return this._isLoggedIn;
    }

    public processStringMessage(message: string): { msg: object, msgType: string } {
        const msg: { type: string } = JSON.parse(message, (key, value) => {

            // check for date - we have custom protocol for dates
            if (typeof value !== "string") {
                return value;
            }
            if (value.length < this.dateMinLen) {
                return value;
            }
            if (value[0] !== this.datePrefixFirstChar) {
                return value;
            }
            if (value.substring(0, this.datePrefixLen) !== this.datePrefix) {
                return value;
            }
            try {
                const milliseconds = parseInt(value.substring(this.datePrefixLen, value.length), 10);
                if (isNaN(milliseconds)) {
                    return value;
                }
                return new Date(milliseconds);
            } catch (ex) {
                return value;
            }
        });

        return {
            msg,
            msgType: msg.type,
        };
    }

    public createStringMessage(message: object): string {
        const oldToJson = Date.prototype.toJSON;
        try {
            const datePrefix = this.datePrefix;
            Date.prototype.toJSON = function () {
                return datePrefix + this.getTime();
            };
            const result = JSON.stringify(message);
            return result;
        } finally {
            Date.prototype.toJSON = oldToJson;
        }
    }

    public processObjectMessage(message: { type: string }): { msg: object, msgType: string } {
        if (!message.type) {
            throw new Error("Object should have type property");
        }
        return {
            msg: message,
            msgType: message.type,
        };
    }

    public createObjectMessage(message: object): object {
        return message;
    }

    public async login(config: Glue42Core.Auth, reconnect?: boolean): Promise<Identity> {
        this.logger.debug("logging in...");
        this.loginConfig = config;

        if (!this.loginConfig) {
            // in case of no auth send empty username and password
            this.loginConfig = { username: "", password: "" };
        }
        this.shouldTryLogin = true;

        const authentication: {
            method?: string,
            token?: string,
            login?: string,
            secret?: string,
            provider?: string
        } = {};

        this.connection.gatewayToken = config.gatewayToken;
        if (config.gatewayToken) {
            // in case of re-connect try to refresh the GW token
            if (reconnect) {
                try {
                    const token = await this.getNewGWToken();
                    config.gatewayToken = token;
                } catch (e) {
                    this.logger.warn(`failed to get GW token when reconnecting ${e?.message || e}`);
                }
            }
            authentication.method = "gateway-token";
            authentication.token = config.gatewayToken;
            this.connection.gatewayToken = config.gatewayToken;
        } else if (config.flowName === "sspi") {
            authentication.provider = "win";
            authentication.method = "access-token";

            if (config.flowCallback && config.sessionId) {
                authentication.token =
                    (await config.flowCallback(config.sessionId, null))
                        .data
                        .toString("base64");
            } else {
                throw new Error("Invalid SSPI config");
            }
        } else if (config.token) {
            authentication.method = "access-token";
            authentication.token = config.token;
        } else if (config.username) {
            authentication.method = "secret";
            authentication.login = config.username;
            authentication.secret = config.password;
        } else {
            throw new Error("invalid auth message" + JSON.stringify(config));
        }

        const helloMsg: any = {
            type: "hello",
            identity: this.settings.identity,
            authentication
        };

        if (config.sessionId) {
            helloMsg.request_id = config.sessionId;
        }

        this.globalDomain = domainSession(
            "global",
            this.connection,
            this.logger.subLogger("global-domain"),
            [
                "welcome",
                "token",
                "authentication-request"
            ]);

        const sendOptions: Glue42Core.Connection.SendMessageOptions = { skipPeerId: true };
        if (this.initialLogin) {
            sendOptions.retryInterval = this.settings.reconnectInterval;
            sendOptions.maxRetries = this.settings.reconnectAttempts;
        }

        try {
            let welcomeMsg: WelcomeMessage;

            while (true) {
                const msg: any = await this.globalDomain.send(helloMsg, undefined, sendOptions);
                if (msg.type === "authentication-request") {
                    // respond to auth challenge
                    const token = Buffer.from(msg.authentication.token, "base64");
                    if (config.flowCallback && config.sessionId) {
                        helloMsg.authentication.token =
                            (await config.flowCallback(config.sessionId, token))
                                .data
                                .toString("base64");
                    }
                    helloMsg.request_id = config.sessionId;
                    continue;
                } else if (msg.type === "welcome") {
                    // we're in
                    welcomeMsg = msg as WelcomeMessage;
                    break;
                } else if (msg.type === "error") {
                    throw new Error("Authentication failed: " + msg.reason);
                } else {
                    throw new Error("Unexpected message type during authentication: " + msg.type);
                }
            }
            // we've logged in once - set this to false for the rest of the lifetime
            this.initialLogin = false;
            this.logger.debug("login successful with peerId " + welcomeMsg.peer_id);

            this.connection.peerId = welcomeMsg.peer_id;
            this.connection.resolvedIdentity = welcomeMsg.resolved_identity;
            this.connection.availableDomains = welcomeMsg.available_domains as any;
            if (welcomeMsg.options) {
                this.connection.token = welcomeMsg.options.access_token;
                this.connection.info = welcomeMsg.options.info;
            }
            this.setLoggedIn(true);
            return welcomeMsg.resolved_identity;
        } catch (err) {
            this.logger.error("error sending hello message - " + (err.message || err.msg || err.reason || err), err);
            throw err;
        } finally {
            if (config && config.flowCallback && config.sessionId) {
                config.flowCallback(config.sessionId, null);
            }
        }
    }

    public async logout(): Promise<void> {
        this.logger.debug("logging out...");
        this.shouldTryLogin = false;

        if (this.pingTimer) {
            clearTimeout(this.pingTimer);
        }

        // go through all sessions and leave the corresponding domain
        const promises = this.sessions.map((session) => {
            session.leave();
        });
        await Promise.all(promises);
    }

    public loggedIn(callback: (() => void)): () => void {
        if (this._isLoggedIn) {
            callback();
        }
        return this.registry.add("onLoggedIn", callback);
    }

    public domain(domainName: string, domainLogger: Logger, successMessages?: string[], errorMessages?: string[]): Glue42Core.Connection.GW3DomainSession {
        let session = this.sessions.filter((s) => s.domain === domainName)[0];
        if (!session) {
            session = domainSession(domainName, this.connection, domainLogger, successMessages, errorMessages);
            this.sessions.push(session);
        }
        return session;
    }

    public handleDisconnected() {
        this.setLoggedIn(false);
        const tryToLogin = this.shouldTryLogin;
        if (tryToLogin && this.initialLogin) {
            if (this.initialLoginAttempts <= 0) {
                return;
            }
            this.initialLoginAttempts--;
        }

        this.logger.debug("disconnected - will try new login?" + this.shouldTryLogin);
        if (this.shouldTryLogin) {
            if (!this.loginConfig) {
                throw new Error("no login info");
            }

            this.connection.login(this.loginConfig, true)
                .catch(() => {
                    setTimeout(this.handleDisconnected.bind(this), this.settings.reconnectInterval || 1000);
                });
        }
    }

    public setLoggedIn(value: boolean) {
        this._isLoggedIn = value;
        if (this._isLoggedIn) {
            this.registry.execute("onLoggedIn");
        }
    }

    public ping() {
        // if we don't want to be connected return
        if (!this.shouldTryLogin) {
            return;
        }

        // if logged in ping
        if (this._isLoggedIn) {
            this.connection.send({ type: "ping" });
        }

        // schedule next after 30 sec
        this.pingTimer = setTimeout(() => {
            this.ping();
        }, 30 * 1000);
    }

    public authToken(): Promise<string> {
        const createTokenReq: CreateTokenReq = {
            type: "create-token"
        };

        if (!this.globalDomain) {
            return Promise.reject(new Error("no global domain session"));
        }

        return this.globalDomain.send<CreateTokenRes>(createTokenReq)
            .then((res: CreateTokenRes) => {
                return res.token;
            });
    }

    private getNewGWToken(): Promise<string | undefined> {
        if (typeof window !== undefined) {
            // pull up a new token from gd
            const glue42gd = window.glue42gd;
            if (glue42gd) {
                return glue42gd.getGWToken();
            }
        }
        return Promise.reject(new Error("not running in GD"));
    }
}
