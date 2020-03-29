import { CliConfig, CliServerApp } from "../config/cli.config";
import { createServer, ServerOptions, Server as HttpServer } from "http";
import { join } from "path";
import { existsSync } from "fs";
import { Logger, connectLogger } from "log4js";
import express, { Express } from "express";
import request from "request";
import concat from "concat-stream";
import Server, { createProxyServer } from "http-proxy";
import { generate } from "shortid";
import { SharedAsset } from "../config/user.config";

type TracedRequest = express.Request & { id: string };

export class CoreDevServer {

    private server: HttpServer;
    private proxy: Server;
    private app: Express;
    private config: CliConfig;
    private logger: Logger;

    public async start(): Promise<void> {
        return new Promise((resolve) => {
            this.server.listen(this.config.server.settings.port, () => {
                this.logger.info(`Server is listening on: ${this.config.server.settings.port}`);
                resolve();
            });
        });
    }

    public async setup(config: CliConfig, logger: Logger): Promise<CoreDevServer> {
        this.config = config;

        this.app = express();
        this.setIpTracingId();

        this.setUpLogging(logger);
        this.logger.trace(`Setting up server with config: ${JSON.stringify(config, null, 2)}`);

        if (this.config.server.settings.disableCache) {
            this.disableCache();
        }

        this.setUpGlueAssets();

        this.config.server.sharedAssets?.forEach((asset) => this.setUpSharedAsset(asset));
        this.proxy = createProxyServer();

        const rootApp = this.config.server.apps.find((appDef) => appDef.route === "/");

        if (rootApp) {
            this.interceptRootApp(rootApp);
        }

        this.config.server.apps.forEach((appDef) => this.interceptAppRequests(appDef));
        this.interceptReferrerRequests(this.config.server.apps);

        this.setUp404();

        this.server = createServer({ insecureHTTPParser: true } as ServerOptions, this.app);

        this.handleServerConnectionUpgrade();

        return this;
    }

    private interceptRootApp(definition: CliServerApp): void {
        this.app.use((request: TracedRequest, response, next) => {

            const appToRespond = this.findApp(request.id, request.url, request.headers.referer, true);

            if (appToRespond) {
                return next();
            }
            this.logger.trace(`[${request.id}] Request identified as root app request.`);
            this.bridgeApp(request, next, definition, response);
        });

        this.logger.info(`Root app interception set up using: ${JSON.stringify(definition)}`);
    }

    private interceptAppRequests(definition: CliServerApp): void {
        if (definition.route === "/") {
            return;
        }

        this.app.use(definition.route, (request: TracedRequest, response, next) => {
            const localDef = this.config.server.apps.find((appDef) => appDef.route === definition.route);

            this.logger.trace(`[${request.id}] Request identified as ${localDef.route} request`);

            this.bridgeApp(request, next, localDef, response);
        });

        this.logger.info(`Non-root app interception set up using: ${JSON.stringify(definition)}`);
    }

    private bridgeApp(request: TracedRequest, next: express.NextFunction, definition: CliServerApp, response: express.Response): void {

        const isSpa = definition.localhost?.spa;

        if (request.headers.accept?.includes("html") && isSpa) {
            this.logger.trace(`[${request.id}] Request to ${definition.route} classified as SPA html, fetching html...`);
            this.getSpaHtml(definition, response, request.id);
            return;
        }

        this.logger.trace(`[${request.id}] Request to ${definition.route} classified as non-html or non-spa, direct proxying...`);
        this.proxyToApp(definition, request, response, next);
    }

    private interceptReferrerRequests(allApps: CliServerApp[]): void {
        this.app.use((request: TracedRequest, response, next) => {

            if (!request.headers.referer) {
                return next();
            }

            this.logger.trace(`[${request.id}] Request still unhandled, attempting referer matching`);

            const regexSlash = new RegExp("[\\/]+", "g");
            const referrer = this.sliceReferrer(request.headers.referer).replace(regexSlash, "");

            const matchedDefinition = allApps.find((appDefinition) => referrer === appDefinition.route.replace(regexSlash, ""));

            if (!matchedDefinition) {
                this.logger.trace(`[${request.id}] No referer found for sliced referer: ${referrer}`);
                return next();
            }

            this.logger.trace(`[${request.id}] Found a referer match! Responding to sliced referer: ${referrer} with route: ${matchedDefinition.route}`);
            this.proxyToApp(matchedDefinition, request, response, next, true);
        });
        this.logger.info("Generic referrer interceptor configured");
    }

    private proxyToApp(definition: CliServerApp, request: TracedRequest, response: express.Response, next: express.NextFunction, ignoreRoute?: boolean): void {

        if (definition.file) {
            request.url = request.url.replace(definition.route, "/");
            this.logger.trace(`[${request.id}] Request is proxied to a local directory searching for: ${request.url} in ${definition.file.path}`);
            const requestedResource = join(definition.file.path, request.url);
            if (!existsSync(requestedResource)) {
                // if the requested resource does not exist, we return the index.html and let the client-side routing handle it
                request.url = "/";
            }
            express.static(definition.file.path)(request, response, next);
            return;
        }

        const route = ignoreRoute ? "" : definition.route;

        const target = this.getLocalhostTarget(definition.localhost.port, route);

        this.logger.trace(`[${request.id}] Request is proxied to localhost: ${request.url} for ${target}`);

        this.proxy.web(request, response, { target, secure: false }, (err) => {
            this.logger.error(`[${request.id}] Error proxying the request`);
            const errorMessage = `The app's original server responded with an error: ${JSON.stringify(err, null, 2)}`;
            this.logger.error(errorMessage);
            response.status(500);
            response.send(errorMessage);
        });
    }

    private getSpaHtml(definition: CliServerApp, response: express.Response, requestId: string): void {

        if (definition.file) {
            const indexLocation = join(definition.file.path, "index.html");
            this.logger.trace(`[${requestId}] Serving the index html from: ${indexLocation}`);
            response.sendFile(indexLocation, (err) => {
                if (err) {
                    this.logger.error(`[${requestId}] Error handling the html request`);
                    this.logger.error(err);
                    response.status(500);
                    response.send(err);
                }
            });
            return;
        }

        const target = this.getLocalhostTarget(definition.localhost.port, definition.route);

        this.logger.trace(`[${requestId}] Proxying the request to localhost: ${target}`);

        const write = concat((completeResp) => {
            let htmlResponse = completeResp.toString("utf8");

            this.logger.trace(`[${requestId}] The original html received, injecting WS proxy with id: ${definition.cookieID}`);

            htmlResponse = htmlResponse.replace("<head>", this.getWsProxyScript(definition.cookieID));

            this.logger.trace(`[${requestId}] The original html received and WS proxy injection completed, sending to client.`);
            response.end(Buffer.from(htmlResponse));
        });

        request
            .get(target)
            .on("error", (err) => {
                this.logger.error(`[${requestId}] Error fetching index from origin`);
                const errorMessage = `The app's original server responded with an error: ${JSON.stringify(err, null, 2)}`;
                response.status(500);
                response.send(errorMessage);
            })
            .pipe(write);
    }

    private setUp404(): void {
        this.app.use((request, response) => {
            response.status(404);
            response.send("404: File Not Found");
        });
    }

    private handleServerConnectionUpgrade(): void {
        this.server.on("upgrade", (req, socket, head) => {
            this.logger.trace(`Received connection upgrade from: ${req.url}`);

            const gCoreCookie = this.getCookie("gcore", req.headers.cookie);

            this.logger.trace(`Extracted cookie id: ${gCoreCookie}`);

            const definition = this.config.server.apps.find((def) => def.cookieID === gCoreCookie);
            if (definition) {
                const target = this.getLocalhostTarget(definition.localhost.port);

                this.logger.trace(`Found a match and proxying WS for cookie: ${gCoreCookie} to ${definition.route}`);

                this.proxy.ws(req, socket, head, { target });
                return;
            }

            this.logger.trace(`No match found for cookie id: ${gCoreCookie}`);
        });
        this.logger.info("Configured connection upgrade request interception");
    }

    private getLocalhostTarget(port: number, urlPath?: string): string {
        return `http://localhost:${port}${urlPath ? urlPath : ""}`;
    }

    private setUpSharedAsset(asset: SharedAsset): void {
        this.app.use(asset.route, express.static(asset.path));
        this.logger.info(`Configured shared asset: ${JSON.stringify(asset)}`);
    }

    private setUpGlueAssets(): void {
        const glueAssets = [
            { route: `${this.config.glueAssets.route}/worker.js`, resolveWith: this.config.glueAssets.worker },
            { route: `${this.config.glueAssets.route}/gateway.js`, resolveWith: this.config.glueAssets.gateway.location },
            { route: `${this.config.glueAssets.route}/glue.config.json`, resolveWith: this.config.glueAssets.config }
        ];

        if (this.config.glueAssets.gateway.gwLogAppender) {
            glueAssets.push({
                route: `${this.config.glueAssets.route}/gwLogAppender.js`,
                resolveWith: this.config.glueAssets.gateway.gwLogAppender
            });
        }

        glueAssets.forEach((asset) => this.app.use(asset.route, express.static(asset.resolveWith)));

        this.logger.info(`Configured glue assets using config: ${JSON.stringify(glueAssets, null, 2)}`);
    }

    private disableCache(): void {
        this.app.use((_req, res, next) => {
            res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
            next();
        });

        this.logger.info("Disabled server cache");
    }

    private setIpTracingId(): void {
        this.app.use((request: TracedRequest, _response, next) => {
            request.id = generate();
            this.logger.trace(`[${request.id}] Received ${request.method} request url: ${request.url} with referrer: ${request.headers.referer}`);
            next();
        });
    }

    private setUpLogging(logger: Logger): void {
        this.logger = logger;
        this.app.use(connectLogger(this.logger, { level: "trace" }));
    }

    private getWsProxyScript(cookieID: string): string {
        return `<head><script>
        (() => {
          const setCookie = (name, value) => {
            document.cookie = name + "=" + value+ ";path=/;";
          }
        
          const wsProxy = new Proxy(WebSocket, {
            construct(target, args) {
              setCookie('gcore', '${cookieID}');
              return new target(...args);
            }
          });
        
          window.WebSocket = wsProxy;
        })()
        </script>`;
    }

    private getCookie(name: string, cookie = ""): string {
        const v = cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
        return v ? v[2] : null;
    }

    private sliceReferrer(referrer: string): string {
        if (!referrer) {
            return;
        }
        const refStartIndex = referrer.indexOf(String(this.config.server.settings.port)) + 4;
        const nextSlashIndex = referrer.indexOf("/", refStartIndex + 1);
        const refEndIndex = nextSlashIndex === -1 ? referrer.length : nextSlashIndex;
        const ref = referrer.slice(refStartIndex, refEndIndex);

        return ref || "/";
    }

    private findApp(requestId: string, url: string, referrerUrl: string, excludeRoot?: boolean): CliServerApp {
        const urlPieces = this.slicePath(url);
        const regexSlash = new RegExp("[\\/]+", "g");
        const referrer = this.sliceReferrer(referrerUrl);

        return this.config.server.apps.find((app) => {
            if (excludeRoot && app.route === "/") {
                return false;
            }
            const routePieces = this.slicePath(app.route);

            if (routePieces.every((piece, idx) => piece === urlPieces[idx])) {
                this.logger.trace(`[${requestId}] This request is expected to be handled by: ${app.route}, because of url matching`);
                return app;
            }

            const appRouteClean = app.route.replace(regexSlash, "");
            const referrerClean = referrer?.replace(regexSlash, "");

            if (referrerClean && appRouteClean === referrerClean) {
                this.logger.trace(`[${requestId}] This request is expected to be handled by: ${app.route}, because of referer matching with sliced referer: ${referrer}`);
                return app;
            }

            return false;
        });
    }

    private slicePath(path: string): string[] {
        return path
            .split("/")
            .reduce((pieces, element) => {
                if (element && element.length) {
                    pieces.push(element);
                }
                return pieces;
            }, []);
    }
}