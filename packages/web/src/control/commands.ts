import { Glue42Web } from "../../web";

export type ControlDomain = "windows" | "layouts" | "appManager";
export type LayoutCommand = "saveLayoutAndClose";

export interface RemoteCommand<T = any> {
    domain: ControlDomain;
    command: string;
    args?: T;
    skipResult?: boolean;
}

export interface LayoutRemoteCommand<T = any> extends RemoteCommand<T> {
    domain: "layouts";
    command: LayoutCommand; // add extra if needed
    args?: T;
}

export interface SaveAutoLayoutCommand extends LayoutRemoteCommand<SaveAutoLayoutCommandArgs> {
}

export interface SaveAutoLayoutCommandArgs {
    layoutName: string;
    parentInfo: Glue42Web.Layouts.LayoutComponent;
    childWindows: string[];
    closeEveryone: boolean;
    context: object;
    metadata: object;
}
