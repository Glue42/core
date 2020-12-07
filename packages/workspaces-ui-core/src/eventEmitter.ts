import callbackRegistry, { CallbackRegistry, UnsubscribeFunction } from "callback-registry";
import {
    FrameEventPayload,
    FrameEventAction,
    WindowEventAction,
    WindowEventPayload,
    ContainerEventPayload,
    WorkspaceEventAction,
    WorkspaceEventPayload,
    ContainerEventAction
} from "./types/events";

export class WorkspacesEventEmitter {
    private readonly registry: CallbackRegistry = callbackRegistry();

    public onFrameEvent(callback: (action: FrameEventAction, payload: FrameEventPayload) => void): UnsubscribeFunction {
        return this.registry.add("frame", callback);
    }

    public onWindowEvent(callback: (action: WindowEventAction, payload: WindowEventPayload) => void): UnsubscribeFunction {
        return this.registry.add("window", callback);
    }

    public onContainerEvent(callback: (action: ContainerEventAction, payload: ContainerEventPayload) => void): UnsubscribeFunction {
        return this.registry.add("container", callback);
    }

    public onWorkspaceEvent(callback: (action: WorkspaceEventAction, payload: WorkspaceEventPayload) => void): UnsubscribeFunction {
        return this.registry.add("workspace", callback);
    }

    public raiseFrameEvent(args: { action: FrameEventAction; payload: FrameEventPayload }): void {
        this.registry.execute("frame", args.action, args.payload);
    }

    public raiseWindowEvent(args: { action: WindowEventAction; payload: WindowEventPayload }): void {
        this.registry.execute("window", args.action, args.payload);
    }

    public raiseContainerEvent(args: { action: ContainerEventAction; payload: ContainerEventPayload }): void {
        this.registry.execute("container", args.action, args.payload);
    }

    public raiseWorkspaceEvent(args: { action: WorkspaceEventAction; payload: WorkspaceEventPayload }): void {
        this.registry.execute("workspace", args.action, args.payload);
    }
}
