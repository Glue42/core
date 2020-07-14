import factory from "../../../src/config/factory";
import { expect } from "chai";

describe("createApiWindow() Should", () => {
    const mockId = "mockId";
    const mockWindowId = "mockWindowId";
    const mockUrl = "mockUrl";
    const mockAppName = "mockAppName";

    it("return the correct window object when the id is string and all optional args are present", () => {
        const expectedResult = {
            id: mockId,
            type: "window",
            config: {
                windowId: mockWindowId,
                isMaximized: false,
                isLoaded: true,
                isFocused: false,
                appName: mockAppName,
                url: mockUrl
            }
        };

        const result = factory.createApiWindow({
            id: mockId,
            windowId: mockWindowId,
            isMaximized: false,
            isFocused: false,
            url: mockUrl,
            appName: mockAppName,
        });

        expect(result).to.eql(expectedResult);
    });

    it("return the correct window object with first element as id when the id is string[] and all optional args are present", () => {
        const expectedResult = {
            id: mockId,
            type: "window",
            config: {
                windowId: mockWindowId,
                isMaximized: false,
                isLoaded: true,
                isFocused: false,
                appName: mockAppName,
                url: mockUrl
            }
        };

        const result = factory.createApiWindow({
            id: [mockId, "secondMockId"],
            windowId: mockWindowId,
            isMaximized: false,
            isFocused: false,
            url: mockUrl,
            appName: mockAppName,
        });

        expect(result).to.eql(expectedResult);
    });

    it("return the correct window object with loaded false when the id is string and all optional args without windowId are present", () => {
        const expectedResult: object = {
            id: mockId,
            type: "window",
            config: {
                windowId: undefined,
                isMaximized: false,
                isLoaded: false,
                isFocused: false,
                appName: mockAppName,
                url: mockUrl
            }
        };

        const result = factory.createApiWindow({
            id: [mockId, "secondMockId"],
            windowId: undefined,
            isMaximized: false,
            isFocused: false,
            url: mockUrl,
            appName: mockAppName,
        });

        expect(result).to.eql(expectedResult);
    });
});
