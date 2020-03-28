
import { expect } from "chai";
import "mocha";
import { defaultLocation } from "../src/defaults";

describe("defaults", () => {
    it("the default gateway location should be './gateway.js'", () => {
        expect(defaultLocation).to.eql('./gateway.js');
    });
});