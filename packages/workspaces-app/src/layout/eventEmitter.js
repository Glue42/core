"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutEventEmitter = void 0;
class LayoutEventEmitter {
    constructor(registry) {
        this._registry = registry;
    }
    onWorkspaceLayoutInit(callback) {
        return this._registry.add("workspace-layout-initialised", callback);
    }
    onContentLayoutInit(callback) {
        return this._registry.add("content-layout-init", callback);
    }
    onOuterLayoutContainerResized(callback) {
        return this._registry.add("outer-layout-container-resized", callback);
    }
    onContentContainerResized(callback, id) {
        if (id) {
            return this._registry.add(`workspace-content-container-resized-${id}`, callback);
        }
        return this._registry.add("workspace-content-container-resized", callback);
    }
    onContentItemResized(callback) {
        return this._registry.add("content-item-resized", callback);
    }
    onContentComponentCreated(callback) {
        return this._registry.add("content-component-created", callback);
    }
    onFrameCloseRequested(callback) {
        return this._registry.add("close-frame", callback);
    }
    onRestoreRequested(callback) {
        return this._registry.add("restore-frame", callback);
    }
    onMaximizeRequested(callback) {
        return this._registry.add("maximize-frame", callback);
    }
    onMinimizeRequested(callback) {
        return this._registry.add("minimize-frame", callback);
    }
    onMoveAreaChanged(callback) {
        return this._registry.add("move-area-changed", callback);
    }
    onTabCloseRequested(callback) {
        return this._registry.add("tab-close-requested", callback);
    }
    onTabDragStart(callback) {
        return this._registry.add("tab-drag-start", callback);
    }
    onTabDrag(callback) {
        return this._registry.add("tab-drag", callback);
    }
    onTabDragEnd(callback) {
        return this._registry.add("tab-drag-end", callback);
    }
    onTabElementMouseDown(callback) {
        return this._registry.add("tab-element-mouse-down", callback);
    }
    onSelectionChanged(callback) {
        return this._registry.add("selection-changed", callback);
    }
    onWorkspaceAdded(callback) {
        return this._registry.add("workspace-added", callback);
    }
    onWorkspaceSelectionChanged(callback) {
        return this._registry.add("workspace-selection-changed", callback);
    }
    onWorkspaceTabCloseRequested(callback) {
        return this._registry.add("workspace-tab-close-requested", callback);
    }
    onAddButtonClicked(callback) {
        return this._registry.add("add-button-clicked", callback);
    }
    onContentLayoutStateChanged(callback) {
        return this._registry.add("content-layout-state-changed", callback);
    }
    onContentItemCreated(callback) {
        return this._registry.add("content-item-created", callback);
    }
    onWorkspaceAddButtonClicked(callback) {
        return this._registry.add("workspace-add-button-clicked", callback);
    }
    onWorkspaceSaveRequested(callback) {
        return this._registry.add("workspace-save-requested", callback);
    }
    onStackMaximized(callback) {
        return this._registry.add("stack-maximized", callback);
    }
    onStackRestored(callback) {
        return this._registry.add("stack-restored", callback);
    }
    onEjectRequested(callback) {
        return this._registry.add("eject-requested", callback);
    }
    raiseEvent(name, data) {
        const result = this._registry.execute(name, ...Object.values(data));
        if ((Array.isArray(result) && result.some((r) => r && r.then)) || (result && !Array.isArray(result) && result.then)) {
            return result;
        }
        return Promise.resolve(result);
    }
    raiseEventWithDynamicName(name, ...args) {
        this._registry.execute(name, ...args);
    }
}
exports.LayoutEventEmitter = LayoutEventEmitter;
//# sourceMappingURL=eventEmitter.js.map