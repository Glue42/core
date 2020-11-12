import { WorkspacesConfigurationFactory } from "../../../src/config/factory";
import { expect } from "chai";
import sinon from "sinon";

describe("createGDWindowConfig() Should", () => {
    const mockWindowId = "mockWindowId";
    const mockAppName = "mockAppName";
    const mockUrl = "mockUrl";
    const mockId = "mockId";

    let factory: WorkspacesConfigurationFactory;

    before(()=>{
        const glueStub: any = {
            appManager: {
                instances: () => []
            }
        }

        factory = new WorkspacesConfigurationFactory(glueStub);
    })

    it("return a component config with the correct windowId in the componentState", () => {
        const result = factory.createGDWindowConfig({
            windowId: mockWindowId,
            appName: mockAppName,
            url: mockUrl,
            id: mockId
        });

        expect(result.componentState.windowId).to.eql(mockWindowId);
    });

    it("return a component config with the correct url in the componentState", () => {
        const result = factory.createGDWindowConfig({
            windowId: mockWindowId,
            appName: mockAppName,
            url: mockUrl,
            id: mockId
        });

        expect(result.componentState.url).to.eql(mockUrl);
    });

    it("return a component config with the correct appName in the componentState", () => {
        const result = factory.createGDWindowConfig({
            windowId: mockWindowId,
            appName: mockAppName,
            url: mockUrl,
            id: mockId
        });

        expect(result.componentState.appName).to.eql(mockAppName);
    });

    it("return a component config with the correct windowId", () => {
        const result = factory.createGDWindowConfig({
            windowId: mockWindowId,
            appName: mockAppName,
            url: mockUrl,
            id: mockId
        });

        expect(result.windowId).to.eql(mockWindowId);
    });

    it("return a component config with the correct id", () => {
        const result = factory.createGDWindowConfig({
            windowId: mockWindowId,
            appName: mockAppName,
            url: mockUrl,
            id: mockId
        });

        expect(result.id).to.eql(mockId);
    });

    it("return a component config with an id when the id is not passed", () => {
        const result = factory.createGDWindowConfig({
            windowId: mockWindowId,
            appName: mockAppName,
            url: mockUrl
        });

        expect(result.id).to.not.be.undefined;
        expect(result.id).to.not.be.null;
        expect(result.id.length > 0).to.be.true;
    });

    it("return component config with a unique componentName", () => {
        const result = factory.createGDWindowConfig({
            windowId: mockWindowId,
            appName: mockAppName,
            url: mockUrl
        });

        const secondResult = factory.createGDWindowConfig({
            windowId: mockWindowId,
            appName: mockAppName,
            url: mockUrl
        });

        expect(result.componentName).to.not.eql(secondResult);
    });
});
