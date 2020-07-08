import GoldenLayout from "golden-layout";
import { generate } from "shortid";
import { FrameLayoutConfig } from "../types/internal";
import { TitleGenerator } from "./titleGenerator";
import { idAsString } from "../utils";
import store from "../store";
import { EmptyVisibleWindowName } from "../constants";

class WorkspacesConfigurationFactory {
    private readonly _titleGenerator = new TitleGenerator();
    private readonly _defaultWorkspaceLayoutSettings: GoldenLayout.Settings = {
        showCloseIcon: false,
        showMaximizeIcon: false,
        showPopoutIcon: false,
        disableDragProxy: true,
        mode: "workspace",
    };

    public createEmptyVisibleWindowConfig(): GoldenLayout.ComponentConfig {
        return {
            ...this.createWindowConfigurationCore(),
            ...{
                componentState: {
                    header: false
                }
            }
        };
    }

    public createGDWindowConfig(args: { windowId: string; id?: string; appName?: string; url?: string }): GoldenLayout.ComponentConfig {
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

    public createApiWindow(args: { id: string | string[]; windowId: string; isMaximized: boolean; isFocused: boolean; appName?: string; url?: string }) {
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

    public getWorkspaceLayoutComponentName(workspaceId: string): string {
        return `workspace${workspaceId}`;
    }

    public getWorkspaceTitle(currentTitles: string[]): string {
        return this._titleGenerator.getTitle(currentTitles);
    }

    public getId() {
        return generate();
    }

    public getDefaultWorkspaceSettings(): GoldenLayout.Settings {
        return {
            mode: "default",
            showCloseIcon: false,
            showPopoutIcon: true
        };
    }

    public getDefaultFrameConfig(): FrameLayoutConfig {
        const workspaceId = generate();
        const workspaceConfig: GoldenLayout.Config = this.getDefaultWorkspaceConfig();

        const workspacesConfig: GoldenLayout.Config = {
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
                            title: this.getWorkspaceTitle(store.workspaceTitles)
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

    public getDefaultWorkspaceConfig(): GoldenLayout.Config {
        return undefined;
    }

    public generateInitialConfig(workspaceContentConfigs: GoldenLayout.Config[]): FrameLayoutConfig {
        const workspacesConfig: GoldenLayout.Config = {
            settings: this._defaultWorkspaceLayoutSettings,
            content: [
                {
                    type: "stack",
                    content: workspaceContentConfigs.map((wcc) => {
                        const defaultId = generate();
                        return {
                            workspacesConfig: {},
                            type: "component",
                            id: wcc?.id || defaultId,
                            componentName: this.getWorkspaceLayoutComponentName(idAsString(wcc?.id) || defaultId),
                            componentState: {},
                            title: wcc?.workspacesOptions?.name || this.getWorkspaceTitle(store.workspaceIds),
                        };
                    }),
                    workspacesConfig: {}
                }
            ]
        };

        return {
            frameId: undefined,
            workspaceConfigs: workspaceContentConfigs.map((wcc, i) => {
                let id = wcc?.id as string;

                if (!id && workspacesConfig.content[0].type !== "component") {
                    id = workspacesConfig.content[0].content[i].id as string;
                }
                return {
                    id,
                    config: wcc
                };
            }),
            workspaceLayout: workspacesConfig
        };
    }

    private createWindowConfigurationCore(id?: string): GoldenLayout.ComponentConfig {
        return {
            workspacesConfig: {},
            type: "component",
            id: id || this.getId(),
            componentName: EmptyVisibleWindowName,
        };
    }
}

export default new WorkspacesConfigurationFactory();
