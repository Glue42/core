import { WorkspacesConfigurationFactory } from "../../../src/config/factory";
import { expect } from "chai";
import sinon from "sinon";

describe("getWorkspaceLayoutComponentName() Should", () => {
    let factory: WorkspacesConfigurationFactory;

    before(() => {
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        }

        factory = new WorkspacesConfigurationFactory(glueStub);
    })

    it("return unique names when the workspace ids are unique", () => {
        const firstName = factory.getWorkspaceLayoutComponentName("first");
        const secondName = factory.getWorkspaceLayoutComponentName("second");

        expect(firstName).to.not.eql(secondName);
    });
});
