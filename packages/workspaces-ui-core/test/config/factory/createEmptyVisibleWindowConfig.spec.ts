import { expect } from "chai";
import sinon from "sinon";
import { WorkspacesConfigurationFactory } from "../../../src/config/factory";

describe("createEmptyVisibleWindowConfig() Should", () => {

    let factory: WorkspacesConfigurationFactory;

    before(()=>{
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        }

        factory = new WorkspacesConfigurationFactory(glueStub);
    })

    it("return a component without a tab header", () => {
        const component = factory.createEmptyVisibleWindowConfig();

        expect(component.componentState?.header).to.be.false;
    });

    it("return a component with the placeholder name", () => {
        const component = factory.createEmptyVisibleWindowConfig();

        expect(component.componentName).to.eql("emptyVisibleWindow");
    });

    it("return a component", () => {
        const component = factory.createEmptyVisibleWindowConfig();

        expect(component.type).to.eql("component");
    });
});
