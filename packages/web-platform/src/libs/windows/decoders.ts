import { Glue42Web } from "@glue42/web";
import { anyJson, boolean, constant, Decoder, number, object, oneOf, optional, string } from "decoder-validate";
import { nonEmptyStringDecoder, nonNegativeNumberDecoder, windowRelativeDirectionDecoder } from "../../shared/decoders";
import { OpenWindowConfig, OpenWindowSuccess, SimpleWindowCommand, WindowBoundsResult, WindowMoveResizeConfig, WindowOperationsTypes, WindowTitleConfig, WindowUrlResult } from "./types";

export const windowOperationDecoder: Decoder<WindowOperationsTypes> = oneOf<"openWindow" | "windowHello" | "getUrl" | "getTitle" | "setTitle" | "moveResize" | "focus" | "close" | "getBounds" | "registerWorkspaceWindow" | "unregisterWorkspaceWindow">(
    constant("openWindow"),
    constant("windowHello"),
    constant("getUrl"),
    constant("getTitle"),
    constant("setTitle"),
    constant("moveResize"),
    constant("focus"),
    constant("close"),
    constant("getBounds"),
    constant("registerWorkspaceWindow"),
    constant("unregisterWorkspaceWindow")
);

export const windowOpenSettingsDecoder: Decoder<Glue42Web.Windows.Settings> = object({
    top: optional(number()),
    left: optional(number()),
    width: optional(nonNegativeNumberDecoder),
    height: optional(nonNegativeNumberDecoder),
    context: optional(anyJson()),
    relativeTo: optional(nonEmptyStringDecoder),
    relativeDirection: optional(windowRelativeDirectionDecoder)
});

export const openWindowConfigDecoder: Decoder<OpenWindowConfig> = object({
    name: nonEmptyStringDecoder,
    url: nonEmptyStringDecoder,
    options: optional(windowOpenSettingsDecoder)
});

export const openWindowSuccessDecoder: Decoder<OpenWindowSuccess> = object({
    windowId: nonEmptyStringDecoder,
    name: nonEmptyStringDecoder
});

export const simpleWindowDecoder: Decoder<SimpleWindowCommand> = object({
    windowId: nonEmptyStringDecoder
});

export const windowBoundsResultDecoder: Decoder<WindowBoundsResult> = object({
    windowId: nonEmptyStringDecoder,
    bounds: object({
        top: number(),
        left: number(),
        width: nonNegativeNumberDecoder,
        height: nonNegativeNumberDecoder
    })
});

export const windowUrlResultDecoder: Decoder<WindowUrlResult> = object({
    windowId: nonEmptyStringDecoder,
    url: nonEmptyStringDecoder
});

export const windowMoveResizeConfigDecoder: Decoder<WindowMoveResizeConfig> = object({
    windowId: nonEmptyStringDecoder,
    top: optional(number()),
    left: optional(number()),
    width: optional(nonNegativeNumberDecoder),
    height: optional(nonNegativeNumberDecoder),
    relative: optional(boolean())
});

export const windowTitleConfigDecoder: Decoder<WindowTitleConfig> = object({
    windowId: nonEmptyStringDecoder,
    title: string()
});
