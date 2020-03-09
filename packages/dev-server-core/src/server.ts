import { ServerConfig, SharedAsset, DevServerApp } from "../types/config";
import { createServer, ServerOptions, Server as HttpServer } from "http";
import express, { Express } from "express";
import morgan from "morgan";
import request from "request";
import concat from "concat-stream";
import Server, { createProxyServer } from "http-proxy";

export class CoreDevServer {

    private server: HttpServer;
    private proxy: Server;
    private app: Express;

    constructor(
        private readonly config: ServerConfig
    ) { }

    public async start(): Promise<void> {
        return new Promise((resolve) => this.server.listen(this.config.serverSettings.port, resolve));
    }

    public async setup(): Promise<CoreDevServer> {

        this.app = express();

        if (this.config.serverSettings.disableCache) {
            this.disableCache();
        }

        if (this.config.serverSettings.verboseLogging) {
            this.setUpLogging();
        }

        await this.setUpGlueAssets();

        this.config.sharedAssets?.forEach((asset) => this.setUpSharedAsset(asset));
        this.proxy = createProxyServer();

        const rootApp = this.config.apps.find((appDef) => appDef.route === "/");

        if (rootApp) {
            this.interceptRootApp(rootApp);
        }

        this.config.apps.forEach((appDef) => this.interceptAppRequests(appDef));
        this.interceptReferrerRequests(this.config.apps);

        this.setUpRootAppIntercept();

        this.server = createServer({ insecureHTTPParser: true } as ServerOptions, this.app);

        this.handleServerConnectionUpgrade();

        return this;
    }

    private interceptRootApp(definition: DevServerApp): void {
        console.log("Found root app definition, setting up");
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
            console.log(`Got proxy response error for request URL: ${request.url} to target: ${target}`);
            console.log(err);
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
                console.log(`Got proxy HTML response error for target: ${target}`);
                console.log(err);
                response.status(404);
                response.send(`The app's original server responded with an error: ${JSON.stringify(err)}`);
            })
            .pipe(write);
    }

    private setUpRootAppIntercept(): void {
        this.app.use((request, response) => {
            response.status(404);
            response.send("404: File Not Found");
        });
    }

    private handleServerConnectionUpgrade(): void {
        this.server.on("upgrade", (req, socket, head) => {
            const gCoreCookie = this.getCookie("gcore", req.headers.cookie);
            const definition = this.config.apps.find((def) => def.cookieID === gCoreCookie);
            console.log(`Got an UPGRADE request from: ${req.url}, found cookie: ${gCoreCookie} and matched definition: ${JSON.stringify(definition)}`);
            if (definition) {
                const target = this.getLocalhostTarget(definition.localhost.port);
                console.log(`Definition is valid, proxying to target: ${target}`);
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

    private async setUpGlueAssets(): Promise<void> {
        this.app.use("/glue/worker", express.static(this.config.glueAssets.sharedWorker));
        this.app.use("/glue/gateway", express.static(this.config.glueAssets.gateway));
    }

    private disableCache(): void {
        this.app.use((_req, res, next) => {
            res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
            next();
        });
    }

    private setUpLogging(): void {
        this.app.use(morgan("dev"));
    }

    private getWsProxyScript(cookieID: string): string {
        return `<head><script>
        (() => {
          console.log('injected');
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