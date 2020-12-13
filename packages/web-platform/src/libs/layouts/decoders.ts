import { Glue42Web } from "@glue42/web";
import { Glue42Workspaces } from "@glue42/workspaces-api";
import { Decoder, oneOf, constant, anyJson, array, object, optional } from "decoder-validate";
import { layoutSummaryDecoder, nonEmptyStringDecoder, windowLayoutComponentDecoder, workspaceLayoutComponentDecoder } from "../../shared/decoders";
import { GetAllLayoutsConfig, AllLayoutsSummariesResult, AllLayoutsFullConfig, LayoutsOperationTypes, SimpleLayoutConfig, SimpleLayoutResult, OptionalSimpleLayoutResult, LayoutsImportConfig } from "./types";

export const layoutTypeDecoder: Decoder<Glue42Web.Layouts.LayoutType> = oneOf<Glue42Web.Layouts.LayoutType>(
    constant("Global"),
    constant("Workspace"),
);

export const layoutDecoder: Decoder<Glue42Web.Layouts.Layout> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder,
    context: optional(anyJson()),
    metadata: optional(anyJson()),
    components: array(oneOf<Glue42Workspaces.WorkspaceComponent | Glue42Web.Layouts.WindowComponent>(
        workspaceLayoutComponentDecoder,
        windowLayoutComponentDecoder
    ))
});

export const layoutsOperationTypesDecoder: Decoder<LayoutsOperationTypes> = oneOf<"get" | "getAll" | "export" | "import" | "remove">(
    constant("get"),
    constant("getAll"),
    constant("export"),
    constant("import"),
    constant("remove")
);

export const simpleLayoutConfigDecoder: Decoder<SimpleLayoutConfig> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder
});

export const getAllLayoutsConfigDecoder: Decoder<GetAllLayoutsConfig> = object({
    type: layoutTypeDecoder
});

export const allLayoutsFullConfigDecoder: Decoder<AllLayoutsFullConfig> = object({
    layouts: array(layoutDecoder)
});

export const importModeDecoder: Decoder<"replace" | "merge"> = oneOf<"replace" | "merge">(
    constant("replace"),
    constant("merge")
);

export const layoutsImportConfigDecoder: Decoder<LayoutsImportConfig> = object({
    layouts: array(layoutDecoder),
    mode: importModeDecoder
});

export const allLayoutsSummariesResultDecoder: Decoder<AllLayoutsSummariesResult> = object({
    summaries: array(layoutSummaryDecoder)
});

export const simpleLayoutResult: Decoder<SimpleLayoutResult> = object({
    layout: layoutDecoder
});

export const optionalSimpleLayoutResult: Decoder<OptionalSimpleLayoutResult> = object({
    layout: optional(layoutDecoder)
});
