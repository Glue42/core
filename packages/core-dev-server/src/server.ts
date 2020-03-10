import { ConfigParser } from "./config/config-parser";
import { ServerConfig, SharedAsset, DevServerApp } from "./config/config";
import { createServer, ServerOptions, Server as HttpServer } from "http";
import express, { Express } from "express";
import morgan from "morgan";
import request from "request";
import concat from "concat-stream";
import Server, { createProxyServer } from "http-proxy";

export class CoreDevServer {

    private config: ServerConfig;
    private server: HttpServer;

    constructor(
        private readonly parser: ConfigParser,
        private readonly argv: string[],
        private readonly rootDirectory: string
    ) { }

    public async start(): Promise<void> {
        return new Promise((resolve) => this.server.listen(this.config.serverSettings.port, resolve));
    }

    public async setup(): Promise<CoreDevServer> {
        this.config = await this.parser.parse(this.argv, this.rootDirectory);

        const app = express();

        if (this.config.serverSettings.disableCache) {
            this.disableCache(app);
        }

        if (this.config.serverSettings.verboseLogging) {
            this.setUpLogging(app);
        }

        this.setUpGlueAssets(app);

        this.config.sharedAssets?.forEach((asset) => this.setUpSharedAsset(asset, app));

        // setup express apps
        this.config.apps
            .forEach((appDefinition) => appDefinition.file ?
                this.setUpAppServe(app, appDefinition) :
                this.setUpInitialAppProxy(app, appDefinition)
            );

        const proxy: Server = createProxyServer();
        // setup all root intercepts
        this.setUpProxyInterception(app, proxy);

        this.server = createServer({ insecureHTTPParser: true } as ServerOptions, app);

        this.handleServerConnectionUpgrade(this.server, proxy);

        return this;
    }

    private handleServerConnectionUpgrade(server: HttpServer, proxy: Server): void {
        server.on("upgrade", (req, socket, head) => {
            const gCoreCookie = this.getCookie("gcore", req.headers.cookie);
            const definition = this.config.apps.find((def) => def.cookieID === gCoreCookie);
            if (definition) {
                proxy.ws(req, socket, head, { target: definition.url });
            }
        });
    }

    private setUpProxyInterception(app: Express, proxy: Server): void {
        app.use("/", (req, res, next) => {
            const matchedDefinition = this.config.apps.find((appDefinition) => req.headers.referer && req.headers.referer.includes(appDefinition.route));
            if (req.headers.referer && matchedDefinition) {
                proxy.web(req, res, { target: matchedDefinition.url, secure: false });
                return;
            }

            // todo: setup 404
            next();
        });

        proxy.on("error", function (err, req, res) {
            res.statusCode = 500;
            console.log(err.message);
            res.end(err.message);
        });
    }

    private setUpInitialAppProxy(app: Express, appDefinition: DevServerApp): void {
        app.get(appDefinition.route, (req, res) => {
            req.url = "/";
            const target = appDefinition.url.base + appDefinition.url.path;
            const write = concat((completeResp) => {
                const injectedMessage = completeResp
                    .toString("utf8")
                    .replace("<head>", this.getWsProxyScript(appDefinition.cookieID));
                res.end(Buffer.from(injectedMessage));
            });

            request.get(target).pipe(write);
        });
    }

    private setUpAppServe(app: Express, appDefinition: DevServerApp): void {
        app.use(appDefinition.route, express.static(appDefinition.file.path));
    }

    private setUpSharedAsset(asset: SharedAsset, app: Express): void {
        app.use(asset.route, express.static(asset.path));
    }

    private setUpGlueAssets(app: Express): void {
        app.use("/glue", express.static(this.config.glueAssets.sharedWorker));
        // app.use("/glue", express.static(this.config.glueAssets.config));
    }

    private disableCache(app: Express): void {
        app.use((_req, res, next) => {
            res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
            next();
        });
    }

    private setUpLogging(app: Express): void {
        app.use(morgan("dev"));
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
}