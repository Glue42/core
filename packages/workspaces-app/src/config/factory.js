"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shortid_1 = require("shortid");
const titleGenerator_1 = require("./titleGenerator");
const utils_1 = require("../utils");
const store_1 = require("../store");
const constants_1 = require("../constants");
class WorkspacesConfigurationFactory {
    constructor() {
        this._titleGenerator = new titleGenerator_1.TitleGenerator();
        this._defaultWorkspaceLayoutSettings = {
            showCloseIcon: false,
            showMaximizeIcon: false,
            showPopoutIcon: false,
            disableDragProxy: true,
            mode: "workspace",
        };
    }
    createEmptyVisibleWindowConfig() {
        return {
            ...this.createWindowConfigurationCore(),
            ...{
                componentState: {
                    header: false
                }
            }
        };
    }
    createGDWindowConfig(args) {
        const baseConfiguration = this.createWindowConfigurationCore(args.id);
        return {
            ...baseConfiguration,
            ...{
                componentName: `app${baseConfiguration.id}`,
                windowId: args.windowId,
                componentState: {
                    windowId: args.windowId,
                    appName: args.appName,
                    url: args.url
                }
            }
        };
    }
    createApiWindow(args) {
        return {
            id: Array.isArray(args.id) ? args.id[0] : args.id,
            type: "window",
            config: {
                windowId: args.windowId,
                isMaximized: args.isMaximized,
                isLoaded: args.windowId !== undefined,
                isFocused: args.isFocused,
                appName: args.appName,
                url: args.url
            }
        };
    }
    getWorkspaceLayoutComponentName(workspaceId) {
        return `workspace${workspaceId}`;
    }
    getWorkspaceTitle(currentTitles) {
        return this._titleGenerator.getTitle(currentTitles);
    }
    getId() {
        return shortid_1.generate();
    }
    getDefaultWorkspaceSettings() {
        return {
            mode: "default",
            showCloseIcon: false,
            showPopoutIcon: true
        };
    }
    getDefaultFrameConfig() {
        const workspaceId = shortid_1.generate();
        const workspaceConfig = this.getDefaultWorkspaceConfig(workspaceId);
        const workspacesConfig = {
            settings: this._defaultWorkspaceLayoutSettings,
            content: [
                {
                    type: "stack",
                    content: [
                        {
                            type: "component",
                            id: workspaceId,
                            componentName: this.getWorkspaceLayoutComponentName(workspaceId),
                            componentState: {},
                            workspacesConfig: {},
                            title: this.getWorkspaceTitle(store_1.default.workspaceTitles)
                        }
                    ],
                    workspacesConfig: {}
                }
            ]
        };
        return {
            frameId: undefined,
            workspaceConfigs: [{
                    id: workspaceId,
                    config: workspaceConfig
                }],
            workspaceLayout: workspacesConfig
        };
    }
    getDefaultWorkspaceConfig(workspaceId) {
        return undefined;
    }
    generateInitialConfig(workspaceContentConfigs) {
        const workspacesConfig = {
            settings: this._defaultWorkspaceLayoutSettings,
            content: [
                {
                    type: "stack",
                    content: workspaceContentConfigs.map((wcc) => {
                        var _a;
                        const defaultId = shortid_1.generate();
                        return {
                            workspacesConfig: {},
                            type: "component",
                            id: (wcc === null || wcc === void 0 ? void 0 : wcc.id) || defaultId,
                            componentName: this.getWorkspaceLayoutComponentName(utils_1.idAsString(wcc === null || wcc === void 0 ? void 0 : wcc.id) || defaultId),
                            componentState: {},
                            title: ((_a = wcc === null || wcc === void 0 ? void 0 : wcc.workspacesOptions) === null || _a === void 0 ? void 0 : _a.name) || this.getWorkspaceTitle(store_1.default.workspaceIds),
                        };
                    }),
                    workspacesConfig: {}
                }
            ]
        };
        return {
            frameId: undefined,
            workspaceConfigs: workspaceContentConfigs.map((wcc, i) => {
                let id = wcc === null || wcc === void 0 ? void 0 : wcc.id;
                if (!id && workspacesConfig.content[0].type !== "component") {
                    id = workspacesConfig.content[0].content[i].id;
                }
                return {
                    id,
                    config: wcc
                };
            }),
            workspaceLayout: workspacesConfig
        };
    }
    createWindowConfigurationCore(id) {
        return {
            workspacesConfig: {},
            type: "component",
            id: id || this.getId(),
            componentName: constants_1.EmptyVisibleWindowName,
        };
    }
}
exports.default = new WorkspacesConfigurationFactory();
//# sourceMappingURL=factory.js.map