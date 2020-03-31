import { expect } from "chai";
import mockery from "mockery";
import "mocha";

describe.only("test structure", function () {
    this.timeout(10000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sut: any;
    const processMock = {};

    before(() => {
        mockery.enable();
        mockery.registerMock("./commands", {
            commands: [
                {
                    name: "serve",
                    action: (): Promise<void> => {
                        return Promise.resolve();
                    }
                }
            ]
        });
        mockery.registerMock("log4js", {
            configure: () => console.log("log4js configure called"),
            getLogger: () => {
                console.log("getLogger called");
                return {
                    trace: (): void => console.log("logger trace called")
                };
            }
        });
        mockery.registerMock("./defaults", {
            loggerConfig: {}
        });
        mockery.registerMock("./config", {
            configController: {
                composeCliConfig: (): Promise<{ logging: string; command: string }> => {
                    return Promise.resolve({
                        logging: "default",
                        command: "serve"
                    });
                }
            }
        });
        sut = require("../src/cli");
    });

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it("first", async () => {
        await sut.initiate(processMock);

        expect(1).to.eql(1);
    });
});
