import { expect } from "chai";
import mockery from "mockery";
import { httpMock, expressMock, httpProxyMock, requestMock } from "../mocks";
import "mocha";

describe.skip("Dev Server ", function () {
    this.timeout(10000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Server: any;

    before(() => {
        mockery.enable();
        mockery.registerMock("http", httpMock);
        mockery.registerMock("express", expressMock);
        mockery.registerMock("request", requestMock);
        mockery.registerMock("concat-stream", expressMock);
        mockery.registerMock("http-proxy", httpProxyMock);
        Server = require("../src/index.ts").CoreDevServer;
    });

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it("setup should resolve when all arguments are valid", async () => {
        const config = {
            serverSettings: {
                disableCache: false,
                port: 5000
            },
            glueAssets: {
                sharedWorker: "./",
                gateway: "./",
                config: "./"
            },
            apps: [
                { route: "/", localhost: { port: 4200 }, cookieID: "TEMP" }
            ]
        };
        const server = new Server(config);

        await server.setup();
        expect(1).to.eql(1);
    });
});