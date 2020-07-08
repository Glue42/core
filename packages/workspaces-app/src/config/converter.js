"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const factory_1 = require("./factory");
const utils_1 = require("../utils");
class ConfigConverter {
    constructor() {
        this.flat = (arr) => arr.reduce((acc, i) => [...acc, ...(Array.isArray(i) ? i : [i])], []);
    }
    convertToRendererConfig(config) {
        if (!config) {
            return undefined;
        }
        return this.convertToRendererConfigCore(config, undefined);
    }
    convertToAPIConfig(apiConfig) {
        if (!apiConfig) {
            return undefined;
        }
        return this.convertToApiConfigCore(apiConfig);
    }
    convertToRendererConfigCore(config, parent) {
        var _a, _b, _c;
        let glConfig = {
            type: config.type,
            content: [],
            workspacesOptions: config.config || {},
        };
        if (config.type === "workspace" || !config.type) {
            glConfig = this.applyDefaultRendererConfig({
                content: [],
                workspacesOptions: config.config,
            });
        }
        if (config.type === "workspace" || !config.type) {
            const workspaceItem = config;
            const { children } = workspaceItem;
            if (children.length > 1 && children.every((c) => c.type === "column")) {
                glConfig.content.push(this.wrap(children.map((c) => this.convertToRendererConfigCore(c, workspaceItem)), "row"));
            }
            else if (children.length > 1 && children.every((c) => c.type === "row")) {
                glConfig.content.push(this.wrap(children.map((c) => this.convertToRendererConfigCore(c, workspaceItem)), "column"));
            }
            else {
                glConfig.content.push(...children.map((c) => this.convertToRendererConfigCore(c, workspaceItem)));
            }
            return glConfig;
        }
        else if (config.type === "column" || config.type === "row") {
            glConfig.content.push(...config.children.map((c) => this.convertToRendererConfigCore(c, config)));
            if (glConfig.content.length === 0) {
                glConfig.content.push(this.getGroupWithEmptyVisibleWindow());
            }
            return glConfig;
        }
        else if (config.type === "group") {
            glConfig.type = "stack";
            glConfig.content.push(...config.children.map((c) => this.convertToRendererConfigCore(c, config)));
            if (glConfig.content.length === 0) {
                glConfig.content.push(factory_1.default.createEmptyVisibleWindowConfig());
            }
            return glConfig;
        }
        else if (config.type === "window") {
            const resultWindow = factory_1.default.createGDWindowConfig({
                windowId: (_a = config.config) === null || _a === void 0 ? void 0 : _a.windowId,
                id: config.id,
                appName: ((_b = config.config) === null || _b === void 0 ? void 0 : _b.appName) || config.appName,
                url: ((_c = config.config) === null || _c === void 0 ? void 0 : _c.url) || config.url
            });
            if (parent.type !== "group") {
                resultWindow.componentState.header = false;
                return this.wrap([resultWindow], "stack");
            }
            return resultWindow;
        }
    }
    convertToApiConfigCore(config) {
        if (!config.type || config.type === "workspace") {
            config = config;
            const children = this.flat(config.content.map((c) => this.convertToApiConfigCore(c)));
            return {
                id: utils_1.idAsString(config.id),
                config: config.workspacesOptions,
                children
            };
        }
        if (config.type === "component" && config.componentName === constants_1.EmptyVisibleWindowName) {
            return [];
        }
        else if (config.type !== "component" && config.workspacesConfig && config.workspacesConfig.wrapper) {
            return this.flat(config.content.map((c) => this.convertToApiConfigCore(c)));
        }
        else if (config.type === "component") {
            const resultWindow = factory_1.default.createApiWindow({
                id: config.id,
                isFocused: false,
                isMaximized: false,
                windowId: config.componentState.windowId,
                appName: config.componentState.appName,
                url: config.componentState.url
            });
            return resultWindow;
        }
        return {
            id: utils_1.idAsString(config.id),
            type: config.type === "stack" ? "group" : config.type,
            children: this.flat(config.content.map((c) => this.convertToApiConfigCore(c))),
            config: {}
        };
    }
    wrap(content, wrapper) {
        return {
            workspacesConfig: {
                wrapper: true
            },
            type: wrapper,
            content
        };
    }
    applyDefaultRendererConfig(config) {
        return { settings: { ...factory_1.default.getDefaultWorkspaceSettings() }, ...config };
    }
    getGroupWithEmptyVisibleWindow() {
        return this.wrap([factory_1.default.createEmptyVisibleWindowConfig()], "stack");
    }
}
exports.default = new ConfigConverter();
//# sourceMappingURL=converter.js.map