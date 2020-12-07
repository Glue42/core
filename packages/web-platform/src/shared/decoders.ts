/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import { Glue42Workspaces } from "@glue42/workspaces-api";
import { anyJson, array, boolean, constant, Decoder, fail, lazy, number, object, oneOf, optional, string } from "decoder-validate";
import { Glue42WebPlatform } from "../../platform";
import { LibDomains } from "../common/types";

export const nonNegativeNumberDecoder: Decoder<number> = number().where((num) => num >= 0, "Expected a non-negative number");
export const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");

export const windowRelativeDirectionDecoder: Decoder<Glue42Web.Windows.RelativeDirection> = oneOf<"top" | "left" | "right" | "bottom">(
    constant("top"),
    constant("left"),
    constant("right"),
    constant("bottom")
);

const logLevelDecoder: Decoder<Glue42WebPlatform.Gateway.LogLevel> = oneOf<"trace" | "debug" | "info" | "warn" | "error">(
    constant("trace"),
    constant("debug"),
    constant("info"),
    constant("warn"),
    constant("error")
);

const channelMetaDecoder: Decoder<Glue42WebPlatform.Channels.ChannelMeta> = anyJson().andThen((result) => {
    const colorType = typeof result.color;

    return colorType === "string" ?
        anyJson() :
        fail(`The channel meta must have a defined property color of type string, provided: ${colorType}`);
});

const layoutTypeDecoder: Decoder<Glue42Web.Layouts.LayoutType> = oneOf<"Global" | "Activity" | "ApplicationDefault" | "Swimlane" | "Workspace">(
    constant("Global"),
    constant("Activity"),
    constant("ApplicationDefault"),
    constant("Swimlane"),
    constant("Workspace")
);

const componentTypeDecoder: Decoder<Glue42Web.Layouts.ComponentType> = oneOf<"application" | "activity">(
    constant("application"),
    constant("activity")
);

const functionCheck = (input: any, propDescription: string): Decoder<any> => {
    const providedType = typeof input;

    return providedType === "function" ?
        anyJson() :
        fail(`The provided argument as ${propDescription} should be of type function, provided: ${typeof providedType}`);
};

export const layoutSummaryDecoder: Decoder<Glue42Web.Layouts.LayoutSummary> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder,
    context: optional(anyJson()),
    metadata: optional(anyJson())
});

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

export const libDomainDecoder: Decoder<LibDomains> = oneOf<"windows" | "appManager" | "layouts" | "workspaces">(
    constant("windows"),
    constant("appManager"),
    constant("layouts"),
    constant("workspaces")
);

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

export const intentDecoder: Decoder<Glue42WebPlatform.Applications.Intent> = object({
    name: nonEmptyStringDecoder,
    displayName: optional(nonEmptyStringDecoder),
    contexts: optional(array(nonEmptyStringDecoder)),
    customConfig: anyJson()
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

export const applicationCreateOptionsDecoder: Decoder<Glue42WebPlatform.Applications.CreateOptions> = object({
    url: nonEmptyStringDecoder,
    top: optional(number()),
    left: optional(number()),
    width: optional(nonNegativeNumberDecoder),
    height: optional(nonNegativeNumberDecoder)
});

export const glueCoreAppDefinitionDecoder: Decoder<Glue42WebPlatform.Applications.Glue42CoreDefinition> = object({
    name: nonEmptyStringDecoder,
    title: optional(nonEmptyStringDecoder),
    version: optional(nonEmptyStringDecoder),
    customProperties: optional(anyJson()),
    icon: optional(nonEmptyStringDecoder),
    caption: optional(nonEmptyStringDecoder),
    details: applicationCreateOptionsDecoder
});

export const fdc3AppDefinitionDecoder: Decoder<Glue42WebPlatform.Applications.FDC3Definition> = object({
    name: nonEmptyStringDecoder,
    title: optional(nonEmptyStringDecoder),
    version: optional(nonEmptyStringDecoder),
    appId: nonEmptyStringDecoder,
    manifest: nonEmptyStringDecoder,
    manifestType: nonEmptyStringDecoder,
    tooltip: optional(nonEmptyStringDecoder),
    description: optional(nonEmptyStringDecoder),
    contactEmail: optional(nonEmptyStringDecoder),
    supportEmail: optional(nonEmptyStringDecoder),
    publisher: optional(nonEmptyStringDecoder),
    images: optional(array(object({ url: optional(nonEmptyStringDecoder) }))),
    icons: optional(array(object({ icon: optional(nonEmptyStringDecoder) }))),
    customConfig: anyJson(),
    intents: optional(array(intentDecoder))
});

export const remoteStoreDecoder: Decoder<Glue42WebPlatform.RemoteStore> = object({
    url: nonEmptyStringDecoder,
    pollingInterval: optional(nonNegativeNumberDecoder),
    requestTimeout: optional(nonNegativeNumberDecoder)
});

export const supplierDecoder: Decoder<Glue42WebPlatform.Supplier<any>> = object({
    fetch: anyJson().andThen((result) => functionCheck(result, "supplier fetch")),
    timeout: optional(nonNegativeNumberDecoder),
    pollingInterval: optional(nonNegativeNumberDecoder),
    save: optional(anyJson().andThen((result) => functionCheck(result, "supplier save"))),
    delete: optional(anyJson().andThen((result) => functionCheck(result, "supplier delete")))
});

export const channelDefinitionDecoder: Decoder<Glue42WebPlatform.Channels.ChannelDefinition> = object({
    name: nonEmptyStringDecoder,
    meta: channelMetaDecoder,
    data: optional(anyJson())
});

export const pluginDefinitionDecoder: Decoder<Glue42WebPlatform.Plugins.PluginDefinition> = object({
    name: nonEmptyStringDecoder,
    start: anyJson()
});

export const allApplicationDefinitionsDecoder: Decoder<Glue42WebPlatform.Applications.Glue42CoreDefinition | Glue42WebPlatform.Applications.FDC3Definition> = oneOf<Glue42WebPlatform.Applications.Glue42CoreDefinition | Glue42WebPlatform.Applications.FDC3Definition>(
    glueCoreAppDefinitionDecoder,
    fdc3AppDefinitionDecoder
);

export const appsCollectionDecoder: Decoder<Array<Glue42WebPlatform.Applications.Glue42CoreDefinition | Glue42WebPlatform.Applications.FDC3Definition>> = array(allApplicationDefinitionsDecoder);

export const applicationsConfigDecoder: Decoder<Glue42WebPlatform.Applications.Config> = object({
    mode: oneOf<"local" | "remote" | "supplier">(
        constant("local"),
        constant("remote"),
        constant("supplier")
    ),
    local: optional(array(allApplicationDefinitionsDecoder)),
    remote: optional(remoteStoreDecoder),
    supplier: optional(supplierDecoder)
}).andThen((result) => {

    if (result.mode === "remote" && typeof result.remote === "undefined") {
        return fail("The applications mode is selected as remote, but the remote property is not defined.");
    }

    if (result.mode === "supplier" && typeof result.supplier === "undefined") {
        return fail("The applications mode is selected as supplier, but the supplier property is not defined.");
    }

    return anyJson();
});

export const layoutsConfigDecoder: Decoder<Glue42WebPlatform.Layouts.Config> = object({
    mode: oneOf<"local" | "remote" | "supplier">(
        constant("local"),
        constant("remote"),
        constant("supplier")
    ),
    local: optional(array(glueLayoutDecoder)),
    remote: optional(remoteStoreDecoder),
    supplier: optional(supplierDecoder)
}).andThen((result) => {

    if (result.mode === "remote" && typeof result.remote === "undefined") {
        return fail("The layouts mode is selected as remote, but the remote property is not defined.");
    }

    if (result.mode === "supplier" && typeof result.supplier === "undefined") {
        return fail("The layouts mode is selected as supplier, but the supplier property is not defined.");
    }

    return anyJson();
});

export const channelsConfigDecoder: Decoder<Glue42WebPlatform.Channels.Config> = object({
    definitions: array(channelDefinitionDecoder)
});

export const pluginsConfigDecoder: Decoder<Glue42WebPlatform.Plugins.Config> = object({
    definitions: array(pluginDefinitionDecoder)
});

export const gatewayConfigDecoder: Decoder<Glue42WebPlatform.Gateway.Config> = object({
    logging: optional(object({
        level: optional(logLevelDecoder),
        appender: optional(anyJson().andThen((result) => functionCheck(result, "gateway log appender")))
    }))
});

// todo: proper implement when the config has been finalized
export const glueConfigDecoder: Decoder<Glue42Web.Config> = anyJson();

export const workspacesConfigDecoder: Decoder<Glue42WebPlatform.Workspaces.Config> = object({
    src: nonEmptyStringDecoder
});

export const windowsConfigDecoder: Decoder<Glue42WebPlatform.Windows.Config> = object({
    windowResponseTimeoutMs: optional(nonNegativeNumberDecoder),
    defaultWindowOpenBounds: optional(object({
        top: number(),
        left: number(),
        width: nonNegativeNumberDecoder,
        height: nonNegativeNumberDecoder
    }))
});

export const platformConfigDecoder: Decoder<Glue42WebPlatform.Config> = object({
    windows: optional(windowsConfigDecoder),
    applications: optional(applicationsConfigDecoder),
    layouts: optional(layoutsConfigDecoder),
    channels: optional(channelsConfigDecoder),
    plugins: optional(pluginsConfigDecoder),
    gateway: optional(gatewayConfigDecoder),
    glue: optional(glueConfigDecoder),
    workspaces: optional(workspacesConfigDecoder),
    glueFactory: optional(anyJson().andThen((result) => functionCheck(result, "glueFactory")))
});

