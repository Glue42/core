import { Decoder, object, array, optional, anyJson, number, oneOf, constant, boolean } from "decoder-validate";
import { allApplicationDefinitionsDecoder, applicationDetailsDecoder, glueCoreAppDefinitionDecoder, nonEmptyStringDecoder, nonNegativeNumberDecoder } from "../../shared/decoders";
import { ApplicationData, BaseApplicationData, AppHelloSuccess, InstanceData, AppHello, BasicInstanceData, AppManagerOperationTypes, AppsImportOperation as AppsImportOperation, AppRemoveConfig, AppsExportOperation } from "./types";
import { ApplicationStartConfig } from "../../common/types";

export const appManagerOperationTypesDecoder: Decoder<AppManagerOperationTypes> = oneOf<"appHello" | "applicationStart" | "instanceStop" | "registerWorkspaceApp" | "unregisterWorkspaceApp" | "export" | "import" | "remove">(
    constant("appHello"),
    constant("applicationStart"),
    constant("instanceStop"),
    constant("registerWorkspaceApp"),
    constant("unregisterWorkspaceApp"),
    constant("export"),
    constant("import"),
    constant("remove")
);

export const basicInstanceDataDecoder: Decoder<BasicInstanceData> = object({
    id: nonEmptyStringDecoder
});

export const instanceDataDecoder: Decoder<InstanceData> = object({
    id: nonEmptyStringDecoder,
    applicationName: nonEmptyStringDecoder
});

export const applicationDataDecoder: Decoder<ApplicationData> = object({
    name: nonEmptyStringDecoder,
    createOptions: applicationDetailsDecoder,
    instances: array(instanceDataDecoder),
    userProperties: optional(anyJson()),
    title: optional(nonEmptyStringDecoder),
    version: optional(nonEmptyStringDecoder),
    icon: optional(nonEmptyStringDecoder),
    caption: optional(nonEmptyStringDecoder)
});

export const baseApplicationDataDecoder: Decoder<BaseApplicationData> = object({
    name: nonEmptyStringDecoder,
    createOptions: applicationDetailsDecoder,
    userProperties: optional(anyJson()),
    title: optional(nonEmptyStringDecoder),
    version: optional(nonEmptyStringDecoder),
    icon: optional(nonEmptyStringDecoder),
    caption: optional(nonEmptyStringDecoder)
});

export const appHelloSuccessDecoder: Decoder<AppHelloSuccess> = object({
    apps: array(applicationDataDecoder)
});

export const appHelloDecoder: Decoder<AppHello> = object({
    windowId: optional(nonEmptyStringDecoder)
});

export const applicationStartConfigDecoder: Decoder<ApplicationStartConfig> = object({
    name: nonEmptyStringDecoder,
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
    )),
    waitForAGMReady: optional(boolean())
});

export const appsImportOperationDecoder: Decoder<AppsImportOperation> = object({
    definitions: array(allApplicationDefinitionsDecoder),
    mode: oneOf<"replace" | "merge">(
        constant("replace"),
        constant("merge")
    )
});

export const appRemoveConfigDecoder: Decoder<AppRemoveConfig> = object({
    name: nonEmptyStringDecoder
});

export const appsExportOperationDecoder: Decoder<AppsExportOperation> = object({
    definitions: array(glueCoreAppDefinitionDecoder)
});
