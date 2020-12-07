import { Glue42Workspaces } from "@glue42/workspaces-api";
import { Decoder, string, number, object, constant, oneOf, optional, array, boolean, anyJson, lazy } from "decoder-validate";
import { Glue42Web } from "../../web";
import { AppHelloSuccess, ApplicationData, ApplicationStartConfig, AppManagerOperationTypes, BaseApplicationData, BasicInstanceData, InstanceData } from "../appManager/protocol";
import { AllLayoutsFullConfig, AllLayoutsSummariesResult, GetAllLayoutsConfig, LayoutsOperationTypes, OptionalSimpleLayoutResult, SimpleLayoutConfig, SimpleLayoutResult } from "../layouts/protocol";
import { HelloSuccess, OpenWindowConfig, CoreWindowData, WindowHello, WindowOperationTypes, SimpleWindowCommand, WindowTitleConfig, WindowBoundsResult, WindowMoveResizeConfig, WindowUrlResult } from "../windows/protocol";
import { LibDomains } from "./types";

export const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");
export const nonNegativeNumberDecoder: Decoder<number> = number().where((num) => num >= 0, "Expected a non-negative number");

export const libDomainDecoder: Decoder<LibDomains> = oneOf<"windows" | "appManager" | "layouts">(
    constant("windows"),
    constant("appManager"),
    constant("layouts")
);

export const windowOperationTypesDecoder: Decoder<WindowOperationTypes> = oneOf<"openWindow" | "getBounds" | "windowHello" | "windowAdded" | "windowRemoved" | "getUrl" | "moveResize" | "focus" | "close" | "getTitle" | "setTitle">(
    constant("openWindow"),
    constant("windowHello"),
    constant("windowAdded"),
    constant("windowRemoved"),
    constant("getBounds"),
    constant("getUrl"),
    constant("moveResize"),
    constant("focus"),
    constant("close"),
    constant("getTitle"),
    constant("setTitle")
);

export const appManagerOperationTypesDecoder: Decoder<AppManagerOperationTypes> = oneOf<"appHello" | "applicationAdded" | "applicationRemoved" | "applicationChanged" | "instanceStarted" | "instanceStopped" | "applicationStart" | "instanceStop">(
    constant("appHello"),
    constant("applicationAdded"),
    constant("applicationRemoved"),
    constant("applicationChanged"),
    constant("instanceStarted"),
    constant("instanceStopped"),
    constant("applicationStart"),
    constant("instanceStop")
);

export const layoutsOperationTypesDecoder: Decoder<LayoutsOperationTypes> = oneOf<"layoutAdded" | "layoutChanged" | "layoutRemoved" | "get" | "getAll" | "export" | "import" | "remove">(
    constant("layoutAdded"),
    constant("layoutChanged"),
    constant("layoutRemoved"),
    constant("get"),
    constant("getAll"),
    constant("export"),
    constant("import"),
    constant("remove")
);

export const windowRelativeDirectionDecoder: Decoder<Glue42Web.Windows.RelativeDirection> = oneOf<"top" | "left" | "right" | "bottom">(
    constant("top"),
    constant("left"),
    constant("right"),
    constant("bottom")
);

export const windowOpenSettingsDecoder: Decoder<Glue42Web.Windows.Settings | undefined> = optional(object({
    top: optional(number()),
    left: optional(number()),
    width: optional(nonNegativeNumberDecoder),
    height: optional(nonNegativeNumberDecoder),
    context: optional(anyJson()),
    relativeTo: optional(nonEmptyStringDecoder),
    relativeDirection: optional(windowRelativeDirectionDecoder)
}));


export const openWindowConfigDecoder: Decoder<OpenWindowConfig> = object({
    name: nonEmptyStringDecoder,
    url: nonEmptyStringDecoder,
    options: windowOpenSettingsDecoder
});

export const windowHelloDecoder: Decoder<WindowHello> = object({
    windowId: optional(nonEmptyStringDecoder)
});

export const coreWindowDataDecoder: Decoder<CoreWindowData> = object({
    windowId: nonEmptyStringDecoder,
    name: nonEmptyStringDecoder
});

export const simpleWindowDecoder: Decoder<SimpleWindowCommand> = object({
    windowId: nonEmptyStringDecoder
});

export const helloSuccessDecoder: Decoder<HelloSuccess> = object({
    windows: array(coreWindowDataDecoder),
    isWorkspaceFrame: boolean()
});


export const windowTitleConfigDecoder: Decoder<WindowTitleConfig> = object({
    windowId: nonEmptyStringDecoder,
    title: string()
});

export const windowMoveResizeConfigDecoder: Decoder<WindowMoveResizeConfig> = object({
    windowId: nonEmptyStringDecoder,
    top: optional(number()),
    left: optional(number()),
    width: optional(nonNegativeNumberDecoder),
    height: optional(nonNegativeNumberDecoder),
    relative: optional(boolean())
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

export const anyDecoder: Decoder<unknown> = anyJson();

export const boundsDecoder: Decoder<Partial<Glue42Web.Windows.Bounds>> = object({
    top: optional(number()),
    left: optional(number()),
    width: optional(nonNegativeNumberDecoder),
    height: optional(nonNegativeNumberDecoder)
});

export const instanceDataDecoder: Decoder<InstanceData> = object({
    id: nonEmptyStringDecoder,
    applicationName: nonEmptyStringDecoder
});

export const applicationDataDecoder: Decoder<ApplicationData> = object({
    name: nonEmptyStringDecoder,
    instances: array(instanceDataDecoder),
    userProperties: optional(anyJson()),
    title: optional(nonEmptyStringDecoder),
    version: optional(nonEmptyStringDecoder),
    icon: optional(nonEmptyStringDecoder),
    caption: optional(nonEmptyStringDecoder)
});

export const baseApplicationDataDecoder: Decoder<BaseApplicationData> = object({
    name: nonEmptyStringDecoder,
    userProperties: anyJson(),
    title: optional(nonEmptyStringDecoder),
    version: optional(nonEmptyStringDecoder),
    icon: optional(nonEmptyStringDecoder),
    caption: optional(nonEmptyStringDecoder)
});

export const appHelloSuccessDecoder: Decoder<AppHelloSuccess> = object({
    apps: array(applicationDataDecoder)
});

export const basicInstanceDataDecoder: Decoder<BasicInstanceData> = object({
    id: nonEmptyStringDecoder
});

export const applicationStartConfigDecoder: Decoder<ApplicationStartConfig> = object({
    name: nonEmptyStringDecoder,
    waitForAGMReady: boolean(),
    context: optional(anyJson()),
    top: optional(number()),
    left: optional(number()),
    width: optional(nonNegativeNumberDecoder),
    height: optional(nonNegativeNumberDecoder),
    relativeTo: optional(nonEmptyStringDecoder),
    relativeDirection: optional(oneOf<"top" | "left" | "right" | "bottom">(
        constant("top"),
        constant("left"),
        constant("right"),
        constant("bottom")
    ))
});

export const layoutTypeDecoder: Decoder<Glue42Web.Layouts.LayoutType> = oneOf<"Global" | "Activity" | "ApplicationDefault" | "Swimlane" | "Workspace">(
    constant("Global"),
    constant("Activity"),
    constant("ApplicationDefault"),
    constant("Swimlane"),
    constant("Workspace")
);

export const componentTypeDecoder: Decoder<Glue42Web.Layouts.ComponentType> = oneOf<"application" | "activity">(
    constant("application"),
    constant("activity")
);

export const windowLayoutComponentDecoder: Decoder<Glue42Web.Layouts.WindowComponent> = object({
    type: constant("window"),
    componentType: componentTypeDecoder,
    state: object({
        name: anyJson(),
        context: anyJson(),
        url: nonEmptyStringDecoder,
        bounds: anyJson(),
        id: nonEmptyStringDecoder,
        parentId: optional(nonEmptyStringDecoder),
        main: boolean()
    })
});

export const windowLayoutItemDecoder: Decoder<Glue42Workspaces.WindowLayoutItem> = object({
    type: constant("window"),
    config: object({
        appName: nonEmptyStringDecoder,
        url: optional(nonEmptyStringDecoder)
    })
});

export const groupLayoutItemDecoder: Decoder<Glue42Workspaces.GroupLayoutItem> = object({
    type: constant("group"),
    config: anyJson(),
    children: array(oneOf<Glue42Workspaces.WindowLayoutItem>(
        windowLayoutItemDecoder
    ))
});

export const columnLayoutItemDecoder: Decoder<Glue42Workspaces.ColumnLayoutItem> = object({
    type: constant("column"),
    config: anyJson(),
    children: array(oneOf<Glue42Workspaces.RowLayoutItem | Glue42Workspaces.ColumnLayoutItem | Glue42Workspaces.GroupLayoutItem | Glue42Workspaces.WindowLayoutItem>(
        groupLayoutItemDecoder,
        windowLayoutItemDecoder,
        lazy(() => columnLayoutItemDecoder),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        lazy(() => rowLayoutItemDecoder)
    ))
});

export const rowLayoutItemDecoder: Decoder<Glue42Workspaces.RowLayoutItem> = object({
    type: constant("row"),
    config: anyJson(),
    children: array(oneOf<Glue42Workspaces.RowLayoutItem | Glue42Workspaces.ColumnLayoutItem | Glue42Workspaces.GroupLayoutItem | Glue42Workspaces.WindowLayoutItem>(
        columnLayoutItemDecoder,
        groupLayoutItemDecoder,
        windowLayoutItemDecoder,
        lazy(() => rowLayoutItemDecoder)
    ))
});

export const workspaceLayoutComponentDecoder: Decoder<Glue42Workspaces.WorkspaceComponent> = object({
    type: constant("Workspace"),
    state: object({
        config: anyJson(),
        context: anyJson(),
        children: array(oneOf<Glue42Workspaces.RowLayoutItem | Glue42Workspaces.ColumnLayoutItem | Glue42Workspaces.GroupLayoutItem | Glue42Workspaces.WindowLayoutItem>(
            rowLayoutItemDecoder,
            columnLayoutItemDecoder,
            groupLayoutItemDecoder,
            windowLayoutItemDecoder
        ))
    })
});

export const glueLayoutDecoder: Decoder<Glue42Web.Layouts.Layout> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder,
    components: array(oneOf<Glue42Web.Layouts.WindowComponent | Glue42Workspaces.WorkspaceComponent>(
        windowLayoutComponentDecoder,
        workspaceLayoutComponentDecoder
    )),
    context: optional(anyJson()),
    metadata: optional(anyJson())
});

export const newLayoutOptionsDecoder: Decoder<Glue42Web.Layouts.NewLayoutOptions> = object({
    name: nonEmptyStringDecoder,
    context: optional(anyJson()),
    metadata: optional(anyJson())
});

export const restoreOptionsDecoder: Decoder<Glue42Web.Layouts.RestoreOptions> = object({
    name: nonEmptyStringDecoder,
    context: optional(anyJson()),
    closeRunningInstance: optional(boolean())
});

export const layoutSummaryDecoder: Decoder<Glue42Web.Layouts.LayoutSummary> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder,
    context: optional(anyJson()),
    metadata: optional(anyJson())
});

export const simpleLayoutConfigDecoder: Decoder<SimpleLayoutConfig> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder
});

export const getAllLayoutsConfigDecoder: Decoder<GetAllLayoutsConfig> = object({
    type: layoutTypeDecoder
});

export const allLayoutsFullConfigDecoder: Decoder<AllLayoutsFullConfig> = object({
    layouts: array(glueLayoutDecoder)
});

export const allLayoutsSummariesResultDecoder: Decoder<AllLayoutsSummariesResult> = object({
    summaries: array(layoutSummaryDecoder)
});

export const simpleLayoutResult: Decoder<SimpleLayoutResult> = object({
    layout: glueLayoutDecoder
});

export const optionalSimpleLayoutResult: Decoder<OptionalSimpleLayoutResult> = object({
    layout: optional(glueLayoutDecoder)
});
