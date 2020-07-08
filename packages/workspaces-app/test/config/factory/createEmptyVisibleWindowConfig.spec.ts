import factory from "../../../src/config/factory";
import { expect } from "chai";

describe("createEmptyVisibleWindowConfig() Should", () => {

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