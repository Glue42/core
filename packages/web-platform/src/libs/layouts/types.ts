import { Glue42Web } from "@glue42/web";
import { UnsubscribeFunction } from "callback-registry";
import { DBSchema } from "idb";
import { InternalLayoutsConfig } from "../../common/types";

export type LayoutEvent = "layoutAdded" | "layoutChanged" | "layoutRemoved";

export type LayoutsOperationTypes = "get" | "getAll" | "export" | "import" | "remove";

export interface LayoutModeExecutor {
    setup(config: InternalLayoutsConfig): Promise<void>;
    onLayoutEvent(callback: (payload: { operation: LayoutEvent; data: Glue42Web.Layouts.Layout }) => void): UnsubscribeFunction;
    getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]>;
    save(layouts: Glue42Web.Layouts.Layout[]): Promise<void>;
    delete(name: string, type: Glue42Web.Layouts.LayoutType): Promise<boolean>;
}

export interface LayoutsDB extends DBSchema {
    workspaceLayouts: {
        key: string;
        value: Glue42Web.Layouts.Layout;
    };
    autoLayouts: {
        key: string;
        value: Glue42Web.Layouts.Layout;
    };
    globalLayouts: {
        key: string;
        value: Glue42Web.Layouts.Layout;
    };
}

export interface SimpleLayoutConfig {
    name: string;
    type: Glue42Web.Layouts.LayoutType;
}

export interface GetAllLayoutsConfig {
    type: Glue42Web.Layouts.LayoutType;
}

export interface AllLayoutsFullConfig {
    layouts: Glue42Web.Layouts.Layout[];
}

export interface LayoutsImportConfig {
    layouts: Glue42Web.Layouts.Layout[];
    mode: "replace" | "merge";
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

export interface LayoutsSnapshot {
    layouts: Glue42Web.Layouts.Layout[];
}
