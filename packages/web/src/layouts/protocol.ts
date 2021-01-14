import { Glue42Web } from "../../web";
import { allLayoutsFullConfigDecoder, allLayoutsSummariesResultDecoder, getAllLayoutsConfigDecoder, glueLayoutDecoder, layoutsImportConfigDecoder, optionalSimpleLayoutResult, simpleLayoutConfigDecoder } from "../shared/decoders";
import { BridgeOperation } from "../shared/types";

export type LayoutsOperationTypes = "layoutAdded" | "layoutChanged" | "layoutRemoved" |
    "get" | "getAll" | "export" | "import" | "remove";

export const operations: { [key in LayoutsOperationTypes]: BridgeOperation } = {
    layoutAdded: { name: "layoutAdded", dataDecoder: glueLayoutDecoder },
    layoutChanged: { name: "layoutChanged", dataDecoder: glueLayoutDecoder },
    layoutRemoved: { name: "layoutRemoved", dataDecoder: glueLayoutDecoder },
    get: { name: "get", dataDecoder: simpleLayoutConfigDecoder, resultDecoder: optionalSimpleLayoutResult },
    getAll: { name: "getAll", dataDecoder: getAllLayoutsConfigDecoder, resultDecoder: allLayoutsSummariesResultDecoder },
    export: { name: "export", dataDecoder: getAllLayoutsConfigDecoder, resultDecoder: allLayoutsFullConfigDecoder },
    import: { name: "import", dataDecoder: layoutsImportConfigDecoder },
    remove: { name: "remove", dataDecoder: simpleLayoutConfigDecoder }
};

export interface SimpleLayoutConfig {
    name: string;
    type: Glue42Web.Layouts.LayoutType;
}

export interface GetAllLayoutsConfig {
    type: Glue42Web.Layouts.LayoutType;
}

export interface LayoutsImportConfig {
    layouts: Glue42Web.Layouts.Layout[];
    mode: "replace" | "merge";
}

export interface AllLayoutsFullConfig {
    layouts: Glue42Web.Layouts.Layout[];
}

export interface AllLayoutsSummariesResult {
    summaries: Glue42Web.Layouts.LayoutSummary[];
}

export interface SimpleLayoutResult {
    layout: Glue42Web.Layouts.Layout;
}

export interface OptionalSimpleLayoutResult {
    layout?: Glue42Web.Layouts.Layout;
}

export interface LayoutParseResult {
    valid: Glue42Web.Layouts.Layout[];
}
