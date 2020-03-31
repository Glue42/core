import React from "react";
import { useGlue } from "../src/useGlue";
import { GlueContext } from "../src/Glue";
import { renderHook, act } from "@testing-library/react-hooks";

describe("useGlueInit", () => {
    const mockedGlue = {
        agm: {},
        interop: {},
        contexts: {},
        windows: {
            my: () => Promise.resolve({ id: 1 }),
        },
    };
    it("should initialize Glue", async () => {
        const callback = jest.fn((glue: any) => glue.windows.my());
        let result: any;
        await act(async () => {
            renderHook(
                () => {
                    result = useGlue<{ id: number }>(callback);
                },
                {
                    wrapper: ({ children }) => (
                        <GlueContext.Provider value={mockedGlue as any}>
                            {children}
                        </GlueContext.Provider>
                    ),
                }
            );
        });
        await expect(callback).toHaveBeenCalled();
        expect(result).toEqual({ id: 1 });
    });
    it("should log error", async () => {
        const mockedError = jest.fn(() => {
            throw new Error("error");
        });
        const spy = jest.spyOn(console, "error");
        await act(async () => {
            renderHook(
                () => {
                    useGlue<{ id: number }>(mockedError);
                },
                {
                    wrapper: ({ children }) => (
                        <GlueContext.Provider value={mockedGlue as any}>
                            {children}
                        </GlueContext.Provider>
                    ),
                }
            );
        });
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ message: "error" }));
    });
    it("should return a function as hook result", async () => {
        const callback = jest.fn((glue: any) => () => {
            glue.windows.my();
        });
        let result;
        await act(async () => {
            renderHook(
                () => {
                    result = useGlue<() => any>(callback);
                },
                {
                    wrapper: ({ children }) => (
                        <GlueContext.Provider value={mockedGlue as any}>
                            {children}
                        </GlueContext.Provider>
                    ),
                }
            );
        });
        expect(typeof result).toEqual("function");
    });
    it("should pass dependencies as callback arguments", async () => {
        const callback = jest.fn((glue: any) => () => {
            glue.windows.my();
        });
        await act(async () => {
            renderHook(
                () => {
                    useGlue<() => any>(callback, ["test", 123]);
                },
                {
                    wrapper: ({ children }) => (
                        <GlueContext.Provider value={mockedGlue as any}>
                            {children}
                        </GlueContext.Provider>
                    ),
                }
            );
        });
        expect(callback).toHaveBeenCalledWith(mockedGlue, "test", 123);
    });
});
