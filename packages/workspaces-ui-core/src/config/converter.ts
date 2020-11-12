/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkspaceItem, ParentItem, AnyItem, APIWIndowSettings } from "../types/internal";
import GoldenLayout, { StackConfig, ColumnConfig, RowConfig, Config } from "@glue42/golden-layout";
import { EmptyVisibleWindowName } from "../constants";
import { idAsString } from "../utils";
import { WorkspacesConfigurationFactory } from "./factory";

export class ConfigConverter {
    constructor(private readonly _configFactory: WorkspacesConfigurationFactory) { }
    public convertToRendererConfig(config: ParentItem): Config | RowConfig | ColumnConfig | StackConfig {
        if (!config) {
            return undefined;
        }
        return this.convertToRendererConfigCore(config, undefined);
    }

    public convertToAPIConfig(apiConfig: Config | RowConfig | ColumnConfig | StackConfig): ParentItem {
        if (!apiConfig) {
            return undefined;
        }
        return this.convertToApiConfigCore(apiConfig);
    }

    private convertToRendererConfigCore(config: AnyItem, parent: ParentItem) {
        let glConfig: any = {
            type: config.type,
            content: [],
            workspacesOptions: config.config || {},
        };

        if (config.type === "workspace" || !config.type) {
            glConfig = this.applyDefaultRendererConfig({
                content: [],
                workspacesOptions: config.config as any,
            });
        }

        if (config.type === "workspace" || !config.type) {
            const workspaceItem: WorkspaceItem = config as WorkspaceItem;
            const { children } = workspaceItem;

            if (children.length > 1 && children.every((c) => c.type === "column")) {
                glConfig.content.push(this.wrap(children.map((c) => this.convertToRendererConfigCore(c, workspaceItem)), "row"));
            } else if (children.length > 1 && children.every((c) => c.type === "row")) {
                glConfig.content.push(this.wrap(children.map((c) => this.convertToRendererConfigCore(c, workspaceItem)), "column"));
            } else {
                glConfig.content.push(...children.map((c) => this.convertToRendererConfigCore(c, workspaceItem)));
            }

            return glConfig;
        } else if (config.type === "column" || config.type === "row") {
            (glConfig as ColumnConfig).content.push(...config.children.map((c) => this.convertToRendererConfigCore(c, config)));
            if (glConfig.content.length === 0) {
                glConfig.content.push(this.getGroupWithEmptyVisibleWindow());
            }
            return glConfig;
        } else if (config.type === "group") {
            glConfig.type = "stack";
            glConfig.content.push(...config.children.map((c) => this.convertToRendererConfigCore(c, config)));
            if (glConfig.content.length === 0) {
                glConfig.content.push(this._configFactory.createEmptyVisibleWindowConfig());
            }
            return glConfig;
        } else if (config.type === "window") {
            let appName = config.config?.appName || (config as any).appName;
            const windowId = config.config?.windowId;

            if (!appName && windowId) {
                appName = this._configFactory.getAppNameFromWindowId(windowId);
            }

            const resultWindow = this._configFactory.createGDWindowConfig({
                windowId,
                id: config.id,
                appName,
                url: config.config?.url || (config as any).url,
                title: config.config?.title || (config as any).title,
                context: config.config?.context || (config as any).context
            });

            if (parent.type !== "group") {
                resultWindow.componentState.header = false;
                return this.wrap([resultWindow], "stack");
            }
            return resultWindow;
        }
    }

    private convertToApiConfigCore(config: GoldenLayout.Config | GoldenLayout.ItemConfig): any {
        if (!config.type || config.type === "workspace") {
            config = config as GoldenLayout.Config;
            const children = this.flat(config.content.map((c) => this.convertToApiConfigCore(c)));
            return {
                id: idAsString(config.id),
                config: config.workspacesOptions,
                children
            };
        }

        if (config.type === "component" && config.componentName === EmptyVisibleWindowName) {
            return [];
        } else if (config.type !== "component" && config.workspacesConfig && config.workspacesConfig.wrapper) {
            return this.flat(config.content.map((c) => this.convertToApiConfigCore(c)));
        } else if (config.type === "component") {
            const wspsConfig = config.workspacesConfig as APIWIndowSettings;
            const resultWindow = this._configFactory.createApiWindow({
                id: config.id,
                isFocused: false,
                isMaximized: wspsConfig.isMaximized,
                windowId: config.componentState.windowId,
                appName: config.componentState.appName,
                url: config.componentState.url,
                frameId: wspsConfig.frameId,
                workspaceId: wspsConfig.workspaceId,
                title: wspsConfig.title,
                positionIndex: wspsConfig.positionIndex
            });

            return resultWindow;
        }
        return {
            id: idAsString(config.id),
            type: config.type === "stack" ? "group" : config.type,
            children: this.flat(config.content.map((c) => this.convertToApiConfigCore(c))),
            config: {}
        };
    }

    private flat = <T>(arr: T[]) => arr.reduce((acc, i) => [...acc, ...(Array.isArray(i) ? i : [i])], []);

    private wrap(content: GoldenLayout.ComponentConfig[], wrapper: "stack" | "row" | "column") {
        return {
            workspacesConfig: {
                wrapper: true
            },
            type: wrapper,
            content
        };
    }

    private applyDefaultRendererConfig(config: GoldenLayout.Config) {
        return { settings: { ...this._configFactory.getDefaultWorkspaceSettings() }, ...config };
    }

    private getGroupWithEmptyVisibleWindow(): GoldenLayout.ItemConfig {
        return this.wrap([this._configFactory.createEmptyVisibleWindowConfig()], "stack");
    }
}
