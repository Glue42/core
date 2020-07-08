import factory from "../../../src/config/factory";
import { expect } from "chai";

describe("getDefaultWorkspaceSettings() Should", () => {
    it("return settings with the default mode", () => {
        const settings = factory.getDefaultWorkspaceSettings();
        expect(settings.mode).to.eql("default");
    });

    it("return settings without close icon", () => {
        const settings = factory.getDefaultWorkspaceSettings();
        expect(settings.showCloseIcon).to.be.false;
    });
});