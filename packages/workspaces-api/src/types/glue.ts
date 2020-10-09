/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { UnsubscribeFunction } from "callback-registry";
import { Glue42Workspaces } from "../../workspaces";

export type LayoutSummary = { name: string; context: any; metadata: any };
export type LayoutsAPI = {
    getAll(type: "Workspace"): Promise<LayoutSummary[]>;
    remove(type: "Workspace", name: string): Promise<void>;
    export(layoutType?: "Workspace"): Promise<Glue42Workspaces.WorkspaceLayout[]>;
    import(layout: Glue42Workspaces.WorkspaceLayout[]): Promise<void>;
    onAdded(callback: (layout: Glue42Workspaces.WorkspaceLayout) => void): () => void;
    onChanged(callback: (layout: Glue42Workspaces.WorkspaceLayout) => void): () => void;
    onRemoved(callback: (layout: Glue42Workspaces.WorkspaceLayout) => void): () => void;
};

export type InvocationResult<T> = Glue42Core.Interop.InvocationResult<T>;
export type InteropAPI = Glue42Core.Interop.API;
export type ContextsAPI = Glue42Core.Contexts.API;
export type GDWindow = {
    id: string;
    close(): Promise<GDWindow>;
    moveTo(top: number, left: number): Promise<GDWindow>;
    resizeTo(width: number, height: number): Promise<GDWindow>;
    moveResize(config: Bounds): Promise<GDWindow>;
    focus(): Promise<GDWindow>;
};
export type Subscription = Glue42Core.Interop.Subscription;
export type WindowsAPI = {
    list(): GDWindow[];
    my(): GDWindow;
    open(name: string, url: string, options?: any): Promise<GDWindow>;
    onWindowAdded(callback: (window: GDWindow) => void): UnsubscribeFunction;
};
export type Instance = Glue42Core.Interop.Instance;
export type Bounds = { height?: number; width?: number; top?: number; left?: number };