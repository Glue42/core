import factory from "../../../src/config/factory";
import { expect } from "chai";

describe("getWorkspaceLayoutComponentName() Should", () => {
    it("return unique names when the workspace ids are unique", () => {
        const firstName = factory.getWorkspaceLayoutComponentName("first");
        const secondName = factory.getWorkspaceLayoutComponentName("second");

        expect(firstName).to.not.eql(secondName);
    });
});
