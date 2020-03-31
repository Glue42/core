import React from "react";
import { act } from "react-dom/test-utils";
import { shallow, mount, ReactWrapper } from "enzyme";
import { GlueProvider, GlueContext } from "../src/Glue";

describe("<GlueProvider/>", () => {
    const mockedGlue = {
        agm: {},
        interop: {},
        contexts: {},
        windows: {},
    };
    const mockedGlueFactory = jest.fn(() => Promise.resolve(mockedGlue)) as any;

    it("should render a Context.Provider", async () => {
        let wrapper: any;
        await act(async () => {
            wrapper = mount(
                <GlueProvider glueFactory={mockedGlueFactory}>
                    <div />
                </GlueProvider>
            );
        });

        await expect(mockedGlueFactory).toHaveBeenCalled();
        await expect(wrapper!.is(GlueProvider)).toBeTruthy();
    });
    it("should pass glueFactory result as context value", async () => {
        let wrapper: ReactWrapper;
        await act(async () => {
            const config = { logLevel: "off" };
            wrapper = mount(
                <GlueProvider config={config as any} glueFactory={mockedGlueFactory}>
                    <GlueContext.Consumer>
                        {(value: any) => <div data-value={value} />}
                    </GlueContext.Consumer>
                </GlueProvider>
            );
        });
        await expect(mockedGlueFactory).toHaveBeenCalled();
        wrapper.update();
        expect(wrapper.find("div").prop("data-value")).toEqual(mockedGlue);
    });
    it("should call glueFactory fn with config", async () => {
        const config = {
            logLevel: "off",
        };
        act(() => {
            shallow(
                <GlueProvider glueFactory={mockedGlueFactory} config={config as any}>
                    <div />
                </GlueProvider>
            );
        });
        await expect(mockedGlueFactory).toHaveBeenLastCalledWith(config);
    });
    it("should render fallback component initially", () => {
        const Fallback = () => <div id="fallback" />;
        let wrapper: ReactWrapper;
        act(() => {
            wrapper = mount(
                <GlueProvider fallback={<Fallback />}>
                    <div />
                </GlueProvider>
            );
        });

        expect(wrapper.find("#fallback")).toHaveLength(1);
    });
    it("should render no fallback component initially by default", () => {
        let wrapper: ReactWrapper;
        act(() => {
            wrapper = mount(
                <GlueProvider>
                    <div />
                </GlueProvider>
            );
        });

        expect(wrapper).toEqual({});
    });
});
