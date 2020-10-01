/* eslint-disable @typescript-eslint/no-use-before-define */

import { Decoder, object, constant, optional, anyJson, array, oneOf, lazy } from "decoder-validate";
import { Glue42Workspaces } from "@glue42/workspaces-api";
import { nonEmptyStringDecoder } from "./simple";

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

export const workspaceComponentDecoder: Decoder<Glue42Workspaces.WorkspaceComponent> = object({
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
