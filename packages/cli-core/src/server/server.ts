import { ServerConfig, SharedAsset, DevServerApp } from "../config/config.d";
import { createServer, ServerOptions, Server as HttpServer } from "http";
import { configure, getLogger, Logger, connectLogger } from "log4js";
import express, { Express } from "express";
import request from "request";
import concat from "concat-stream";
import Server, { createProxyServer } from "http-proxy";

export class CoreDevServer {

    private server: HttpServer;
    private proxy: Server;
    private app: Express;
    private config: ServerConfig;
    private logger: Logger;

    public async start(): Promise<void> {
        return new Promise((resolve) => this.server.listen(this.config.serverSettings.port, resolve));
    }

    public async setup(config: ServerConfig): Promise<CoreDevServer> {

        this.config = config;

        this.app = express();

        if (this.config.serverSettings.disableCache) {
            this.disableCache();
        }

        if (this.config.serverSettings.logging) {
            this.setUpLogging();
        }

        this.setUpGlueAssets();

        this.config.sharedAssets?.forEach((asset) => this.setUpSharedAsset(asset));
        this.proxy = createProxyServer();

        const rootApp = this.config.apps.find((appDef) => appDef.route === "/");

        if (rootApp) {
            this.interceptRootApp(rootApp);
        }

        this.config.apps.forEach((appDef) => this.interceptAppRequests(appDef));
        this.interceptReferrerRequests(this.config.apps);

        this.setUp404();

        this.server = createServer({ insecureHTTPParser: true } as ServerOptions, this.app);

        this.handleServerConnectionUpgrade();

        return this;
    }

    private interceptRootApp(definition: DevServerApp): void {
        this.app.use((request, response, next) => {

            const appToRespond = this.findApp(request.url, request.headers.referer, true);

            if (appToRespond) {
                return next();
            }
            this.handleInitialHtmlMap(request, next, definition, response);
        });
    }

    private interceptAppRequests(definition: DevServerApp): void {
        if (definition.route === "/") {
            return;
        }
        this.app.use(definition.route, (request, response, next) => {
            const localDef = this.config.apps.find((appDef) => appDef.route === definition.route);
            this.handleInitialHtmlMap(request, next, localDef, response);
        });
    }

    private handleInitialHtmlMap(request: express.Request, next: express.NextFunction, definition: DevServerApp, response: express.Response): void {
        if (request.headers.accept?.includes("html")) {
            this.getAppHtml(definition, response);
            return;
        }

        this.proxyToApp(definition, request, response, next);
    }

    private interceptReferrerRequests(allApps: DevServerApp[]): void {
        this.app.use((request, response, next) => {

            if (!request.headers.referer) {
                return next();
            }

            const referrer = this.sliceReferrer(request.headers.referer);

            const matchedDefinition = allApps.find((appDefinition) => referrer === appDefinition.route);

            if (!matchedDefinition) {
                return next();
            }

            this.proxyToApp(matchedDefinition, request, response, next, true);
        });
    }

    private proxyToApp(definition: DevServerApp, request: express.Request, response: express.Response, next: express.NextFunction, ignoreRoute?: boolean): void {

        if (definition.file) {
            request.url = request.url.replace(definition.route, "/");
            express.static(definition.file.path)(request, response, next);
            return;
        }

        const route = ignoreRoute ? "" : definition.route;

        const target = this.getLocalhostTarget(definition.localhost.port, route);
        this.proxy.web(request, response, { target, secure: false }, (err) => {
            response.status(500);
            response.send(`The app's original server responded with an error: ${JSON.stringify(err)}`);
        });
    }

    private getAppHtml(definition: DevServerApp, response: express.Response): void {

        if (definition.file) {
            const indexLocation = `${definition.file.path}/index.html`;
            response.sendFile(indexLocation, (err) => {
                response.status(500);
                response.send(err);
            });
            return;
        }

        const target = this.getLocalhostTarget(definition.localhost.port, definition.route);
        const write = concat((completeResp) => {
            const injectedMessage = completeResp
                .toString("utf8")
                .replace("<head>", this.getWsProxyScript(definition.cookieID));
            response.end(Buffer.from(injectedMessage));
        });

        request
            .get(target)
            .on("error", (err) => {
                response.status(404);
                response.send(`The app's original server responded with an error: ${JSON.stringify(err)}`);
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
            const gCoreCookie = this.getCookie("gcore", req.headers.cookie);
            const definition = this.config.apps.find((def) => def.cookieID === gCoreCookie);
            if (definition) {
                const target = this.getLocalhostTarget(definition.localhost.port);
                this.proxy.ws(req, socket, head, { target });
            }
        });
    }

    private getLocalhostTarget(port: number, urlPath?: string): string {
        return `http://localhost:${port}${urlPath ? urlPath : ""}`;
    }

    private setUpAppServe(appDefinition: DevServerApp): void {
        this.app.use(appDefinition.route, express.static(appDefinition.file.path));
    }

    private setUpSharedAsset(asset: SharedAsset): void {
        this.app.use(asset.route, express.static(asset.path));
    }

    private setUpGlueAssets(): void {
        this.app.use("/glue/worker.js", express.static(this.config.glueAssets.sharedWorker));
        this.app.use("/glue/gateway.js", express.static(this.config.glueAssets.gateway));
        this.app.use("/glue/config.json", express.static(this.config.glueAssets.config));
    }

    private disableCache(): void {
        this.app.use((_req, res, next) => {
            res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
            next();
        });
    }

    private setUpLogging(): void {
        configure({
            appenders: {
                out: { type: "console" },
                app: {
                    type: "file",
                    filename: "glue.core.cli.debug.log"
                }
            },
            categories: {
                "default": { appenders: ["out"], level: "trace" },
                "full": { appenders: ["out", "app"], level: "trace" }
            }
        });
        this.logger = getLogger(this.config.serverSettings.logging);
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
        const refStartIndex = referrer.indexOf(String(this.config.serverSettings.port)) + 4;
        const nextSlashIndex = referrer.indexOf("/", refStartIndex + 1);
        const refEndIndex = nextSlashIndex === -1 ? referrer.length : nextSlashIndex;
        const ref = referrer.slice(refStartIndex, refEndIndex);

        return ref || "/";
    }

    private findApp(url: string, referrerUrl: string, excludeRoot?: boolean): DevServerApp {
        const urlPieces = this.slicePath(url);
        const referrer = this.sliceReferrer(referrerUrl);

        return this.config.apps.find((app) => {
            if (excludeRoot && app.route === "/") {
                return false;
            }
            const routePieces = this.slicePath(app.route);
            return routePieces.every((piece, idx) => piece === urlPieces[idx]) || (referrer && app.route === referrer);
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