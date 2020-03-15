import { expect } from "chai";
import mockery from "mockery";
import { DevServerCore, ServerConfig } from "../src/index.d";
import { httpMock, expressMock, httpProxyMock, morganMock, requestMock } from "./mocks";
import "mocha";

describe("first test suite", function () {
    this.timeout(10000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Server: any;

    before(() => {
        mockery.enable();
        mockery.registerMock("http", httpMock);
        mockery.registerMock("express", expressMock);
        mockery.registerMock("morgan", morganMock);
        mockery.registerMock("request", requestMock);
        mockery.registerMock("concat-stream", expressMock);
        mockery.registerMock("http-proxy", httpProxyMock);
        Server = require("../src/index.ts").CoreDevServer;
    });

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it("first test", async () => {
        const config: ServerConfig = {
            serverSettings: {
                disableCache: false,
                verboseLogging: false,
                port: 5000
            },
            glueAssets: {
                sharedWorker: "./",
                gateway: "./"
            },
            apps: [
                { route: "/", localhost: { port: 4200 }, cookieID: "TEMP" }
            ]
        };
        const server: DevServerCore = new Server(config);

        await server.setup();
        console.log(server);
        expect(1).to.eql(1);
    });
});