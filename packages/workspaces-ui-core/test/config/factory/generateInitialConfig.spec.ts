import { WorkspacesConfigurationFactory } from "../../../src/config/factory";
import { Config, ItemConfig } from "@glue42/golden-layout";
import { expect } from "chai";
import sinon from "sinon";

const getComponents = (config: Config | ItemConfig): Array<ItemConfig> => {
    if (config.type === "component") {
        return [config];
    }

    return config.content.reduce((acc, c) => [...acc, ...(getComponents(c))], []);
};

describe("generateInitialConfig() Should", () => {
    const configs = [{
        workspacesOptions: {},
        content: [{
            type: "stack",
            content: [{
                type: "component",
                componentName: "1",
                componentState: {}
            }]
        }]
    },
    {
        workspacesOptions: {},
        content: [{
            type: "stack",
            content: [{
                type: "component",
                componentName: "2",
                componentState: {}
            }]
        }]
    },
    {
        workspacesOptions: {},
        content: [{
            type: "stack",
            content: [{
                type: "component",
                componentName: "3",
                componentState: {}
            }]
        }]
    }] as Config[];

    let factory: WorkspacesConfigurationFactory;

    before(() => {
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        }

        factory = new WorkspacesConfigurationFactory(glueStub);
    })

    it("return the same number of workspace configs as the input", () => {
        const initialConfig = factory.generateInitialConfig(configs);

        expect(initialConfig.workspaceConfigs.length).to.eql(configs.length);
    });

    it("return a workspaceLayout property with mode set to workspace", () => {
        const initialConfig = factory.generateInitialConfig(configs);

        expect(initialConfig.workspaceLayout.settings.mode).to.eql("workspace");
    });

    it("return a workspaceLayout property without close icon", () => {
        const initialConfig = factory.generateInitialConfig(configs);

        expect(initialConfig.workspaceLayout.settings.showCloseIcon).to.be.false;
    });

    it("return a workspaceLayout property without maximize icon", () => {
        const initialConfig = factory.generateInitialConfig(configs);

        expect(initialConfig.workspaceLayout.settings.showMaximizeIcon).to.be.false;
    });

    it("return a workspaceLayout property without popout icon", () => {
        const initialConfig = factory.generateInitialConfig(configs);

        expect(initialConfig.workspaceLayout.settings.showPopoutIcon).to.be.false;
    });

    it("return a workspaceLayout property with disabled drag proxy", () => {
        const initialConfig = factory.generateInitialConfig(configs);

        expect(initialConfig.workspaceLayout.settings.disableDragProxy).to.be.true;
    });

    it("return a workspaceLayout with the same amount of components as the number of configs in the input", () => {
        const initialConfig = factory.generateInitialConfig(configs);
        const componentsCount = getComponents(initialConfig.workspaceLayout).length;

        expect(componentsCount).to.eql(configs.length);
    });

    it("return components with the same ids as the ids in the workspace configs", () => {
        const initialConfig = factory.generateInitialConfig(configs);
        const componentIds = getComponents(initialConfig.workspaceLayout).map((c) => c.id);
        const containsAllIds = componentIds.every((ci) => initialConfig.workspaceConfigs.some((wc) => wc.id === ci));

        expect(containsAllIds).to.be.true;
    });
});