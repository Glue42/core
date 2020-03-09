import { expect } from "chai";
import mockery from "mockery";
import "mocha";

describe("test structure", function () {
    this.timeout(10000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sut: any;

    before(() => {
        mockery.enable();
        mockery.registerMock("./commands", {
            commands: {
                serve: (): void => console.log("calling serve"),
                build: (): void => console.log("calling build")
            }
        });
        sut = require("../src/cli");
    });

    after(() => {
        mockery.deregisterAll();
        mockery.disable();
    });

    it("first", async () => {
        const argv = ["node", "some/path", "serve"];

        await sut.initiate(argv);

        expect(1).to.eql(1);
    });
});