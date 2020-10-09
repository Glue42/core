import { ContainerSummary } from "./internal";

export type EventType = "window" | "workspace" | "frame" | "container";
export type EventActionType = WindowEventAction | WorkspaceEventAction | FrameEventAction | ContainerEventAction;
export type EventArgs = WindowEventArgs | ContainerEventArgs | WorkspaceEventArgs | FrameEventArgs;
export type EventData = FrameEventData | WorkspaceEventData | ContainerEventData | WindowEventData;
export type WindowEventAction = "added" | "loaded" | "removed" | "focus" | "containerChanged";
export type WorkspaceEventAction = "opened" | "closing" | "closed" | "focused";
export type FrameEventAction = "opened" | "closing" | "closed" | "focus";
export type ContainerEventAction = "added" | "removed" | "childrenUpdate";
export type EventPayload = WindowEventPayload | ContainerEventPayload | WorkspaceEventPayload | FrameEventPayload;

export interface WindowEventArgs {
    type: "window";
    payload: WindowEventData;
}

export interface ContainerEventArgs {
    type: "container";
    payload: ContainerEventData;
}

export interface WorkspaceEventArgs {
    type: "workspace";
    payload: WorkspaceEventData;
}

export interface FrameEventArgs {
    type: "frame";
    payload: FrameEventData;
}

export interface FrameEventPayload {
    frameSummary: {
        id: string;
    };
}

export interface WorkspaceEventPayload {
    workspaceSummary: {
        id: string;
        config: {
            frameId: string;
            title: string;
            positionIndex: number;
            name: string;
        };
    };
    frameSummary: {
        id: string;
    };
}

export interface ContainerEventPayload {
    containerSummary: ContainerSummary;
}

export interface WindowEventPayload {
    windowSummary: {
        itemId: string;
        parentId: string;
        config: {
            frameId: string;
            workspaceId: string;
            positionIndex: number;
            windowId?: string;
            isMaximized: boolean;
            isLoaded: boolean;
            isFocused: boolean;
        };
    };
}

export interface FrameEventData {
    action: FrameEventAction;
    payload: FrameEventPayload;
}

export interface WorkspaceEventData {
    action: WorkspaceEventAction;
    payload: WorkspaceEventPayload;
}

export interface ContainerEventData {
    action: ContainerEventAction;
    payload: {
        containerSummary: {
            itemId: string;
            config: {
                frameId: string;
                workspaceId: string;
                positionIndex: number;
            };
        };
    };
}

export interface WindowEventData {
    action: WindowEventAction;
    payload: WindowEventPayload;
}

export enum SwimlaneLayoutEventTypes {
    WorkspaceAdded = "workspaceAdded",
    WorkspaceRemoved = "workspaceRemoved"
}
