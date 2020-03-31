import { useGlueInit } from "../src/useGlueInit";
import { renderHook, act } from "@testing-library/react-hooks";

describe("useGlueInit", () => {
    const mockedGlue = {
        agm: {},
        interop: {},
        contexts: {},
        windows: {},
    };
    const mockedError = jest.fn(() => {
        throw new Error("error");
    });
    const mockedGlueFactory = jest.fn(() => Promise.resolve(mockedGlue)) as any;
    it("should initialize Glue", async () => {
        let result: any;
        await act(async () => {
            result = renderHook(() => useGlueInit({}, mockedGlueFactory));
        });
        await expect(mockedGlueFactory).toHaveBeenCalled();
        expect(result!.result.current).toBe(mockedGlue);
    });
    it("should log error", async () => {
        const spy = jest.spyOn(console, "error");
        await act(async () => {
            renderHook(() => useGlueInit({}, mockedError));
        });
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ message: "error" }));
    });
});
