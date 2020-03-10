import { expect } from "chai";
import mockery from "mockery";
import "mocha";
import { CoreDevServer } from "../src/server";
import { httpMock, expressMock, httpProxyMock, morganMock, requestMock, parserMock } from "./mocks";

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
        Server = require("../src/server.ts").CoreDevServer;
    });

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it("first test", async () => {
        const server: CoreDevServer = new Server(parserMock);

        await server.setup();
        console.log(server);
        expect(1).to.eql(1);
    });
});