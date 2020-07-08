import callbackRegistry, { CallbackRegistry } from "callback-registry";
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

export class WorkspacesEventEmitter{
    private readonly registry: CallbackRegistry = callbackRegistry();

    public onFrameEvent(callback: (action: FrameEventAction, payload: FrameEventPayload) => void) {
        return this.registry.add("frame", callback);
    }

    public onWindowEvent(callback: (action: WindowEventAction, payload: WindowEventPayload) => void) {
        return this.registry.add("window", callback);
    }

    public onContainerEvent(callback: (action: ContainerEventAction, payload: ContainerEventPayload) => void) {
        return this.registry.add("container", callback);
    }

    public onWorkspaceEvent(callback: (action: WorkspaceEventAction, payload: WorkspaceEventPayload) => void) {
        return this.registry.add("workspace", callback);
    }

    public raiseFrameEvent(args: { action: FrameEventAction, payload: FrameEventPayload }) {
        this.registry.execute("frame", args.action, args.payload);
    }

    public raiseWindowEvent(args: { action: WindowEventAction, payload: WindowEventPayload }) {
        this.registry.execute("window", args.action, args.payload);
    }

    public raiseContainerEvent(args: { action: ContainerEventAction, payload: ContainerEventPayload }) {
        this.registry.execute("container", args.action, args.payload);
    }

    public raiseWorkspaceEvent(args: { action: WorkspaceEventAction, payload: WorkspaceEventPayload }) {
        this.registry.execute("workspace", args.action, args.payload);
    }
}
