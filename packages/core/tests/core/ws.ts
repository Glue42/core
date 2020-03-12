const WebSocketServer = require("ws").Server;
import WSTransport from "../../src/connection/transports/ws";
import { Logger } from "../../src/logger/logger";

describe("ws", () => {

    it("handles error with circular structure without exploding", (done) => {
        const port = 8545;

        const wsServer = new WebSocketServer({ port });

        wsServer.on("connection", () => {
            // do nothing
        });

        const settings = { ws: `ws://localhost:${port}` };

        const logger = new Logger("ws");
        const wsClient = new WSTransport(settings, logger);

        wsClient.onConnectedChanged((isConnected: boolean, reason?: string) => {
            // console.log(`onConnectedChanged: ${isConnected}, reason: "${reason}"`);

            if (isConnected === false && reason && reason.includes('"type":"error"')) {
                done();
            }
        });

        // create a circular structure
        const a: { b: any } = { b: null };
        a.b = a;

        // send will initiate socket
        wsClient.send("testMessage")
            .then(() => {
                // trigger the onerror handler
                (wsClient as any).ws.emit("error", a);
            })
            .catch((err: any) => {
                done(new Error(err));
            });
    });

});
