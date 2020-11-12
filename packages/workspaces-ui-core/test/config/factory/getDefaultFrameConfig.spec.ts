import { WorkspacesConfigurationFactory } from "../../../src/config/factory";
import { expect } from "chai";
import sinon from "sinon";

describe("getDefaultFrameConfig() Should", () => {

    let factory: WorkspacesConfigurationFactory;

    before(() => {
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        }

        factory = new WorkspacesConfigurationFactory(glueStub);
    })

    it("return a workspaceLayout property with mode set to workspace", () => {
        const defaultConfig = factory.getDefaultFrameConfig();

        expect(defaultConfig.workspaceLayout.settings.mode).to.eql("workspace");
    });

    it("return a workspaceLayout property without close icon", () => {
        const defaultConfig = factory.getDefaultFrameConfig();

        expect(defaultConfig.workspaceLayout.settings.showCloseIcon).to.be.false;
    });

    it("return a workspaceLayout property without maximize icon", () => {
        const defaultConfig = factory.getDefaultFrameConfig();

        expect(defaultConfig.workspaceLayout.settings.showMaximizeIcon).to.be.false;
    });

    it("return a workspaceLayout property without popout icon", () => {
        const defaultConfig = factory.getDefaultFrameConfig();

        expect(defaultConfig.workspaceLayout.settings.showPopoutIcon).to.be.false;
    });

    it("return a workspaceLayout property with disabled drag proxy", () => {
        const defaultConfig = factory.getDefaultFrameConfig();

        expect(defaultConfig.workspaceLayout.settings.disableDragProxy).to.be.true;
    });
});