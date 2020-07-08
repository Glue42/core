"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesEventEmitter = void 0;
const callback_registry_1 = require("callback-registry");
class WorkspacesEventEmitter {
    constructor() {
        this.registry = callback_registry_1.default();
    }
    onFrameEvent(callback) {
        return this.registry.add("frame", callback);
    }
    onWindowEvent(callback) {
        return this.registry.add("window", callback);
    }
    onContainerEvent(callback) {
        return this.registry.add("container", callback);
    }
    onWorkspaceEvent(callback) {
        return this.registry.add("workspace", callback);
    }
    raiseFrameEvent(args) {
        this.registry.execute("frame", args.action, args.payload);
    }
    raiseWindowEvent(args) {
        this.registry.execute("window", args.action, args.payload);
    }
    raiseContainerEvent(args) {
        this.registry.execute("container", args.action, args.payload);
    }
    raiseWorkspaceEvent(args) {
        this.registry.execute("workspace", args.action, args.payload);
    }
}
exports.WorkspacesEventEmitter = WorkspacesEventEmitter;
//# sourceMappingURL=eventEmitter.js.map