import { DBSchema } from "idb";
import { Glue42Web } from "../../web";

export interface RemoteStore {
    get(name: string, layoutType: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout | undefined>;
    getAll(layoutType: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]>;
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

export type LayoutEvent = "layoutAdded" | "layoutChanged" | "layoutRemoved";
