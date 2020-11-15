import { WorkspacesConfigurationFactory } from "../../../src/config/factory";
import { expect } from "chai";

describe("getWorkspaceTitle() Should", () => {
    let factory: WorkspacesConfigurationFactory;

    before(() => {
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        }

        factory = new WorkspacesConfigurationFactory(glueStub);
    })

    it("return an unique title", () => {
        const titles = ["one", "two", "three"];
        const newTitle = factory.getWorkspaceTitle(titles);

        const isTitleUnique = titles.indexOf(newTitle) === -1;

        expect(isTitleUnique).to.be.true;
    });
});
