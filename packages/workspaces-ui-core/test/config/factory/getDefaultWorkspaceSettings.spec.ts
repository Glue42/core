import { WorkspacesConfigurationFactory } from "../../../src/config/factory";
import { expect } from "chai";
import sinon from "sinon";

describe("getDefaultWorkspaceSettings() Should", () => {
    let factory: WorkspacesConfigurationFactory;

    before(() => {
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        }

        factory = new WorkspacesConfigurationFactory(glueStub);
    })

    it("return settings with the default mode", () => {
        const settings = factory.getDefaultWorkspaceSettings();
        expect(settings.mode).to.eql("default");
    });

    it("return settings without close icon", () => {
        const settings = factory.getDefaultWorkspaceSettings();
        expect(settings.showCloseIcon).to.be.false;
    });
});
