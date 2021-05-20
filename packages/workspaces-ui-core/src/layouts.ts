import GoldenLayout from "@glue42/golden-layout";
import { Workspace, FrameLayoutConfig, WorkspaceItem, WorkspaceLayout, AnyItem, SavedConfigWithData, WorkspaceOptionsWithLayoutName, SaveWorkspaceConfig } from "./types/internal";
import storage from "./storage";
import scReader from "./config/startupReader";
import { LayoutStateResolver } from "./state/resolver";
import { Glue42Web } from "@glue42/web";
import { getWorkspaceContextName } from "./utils";
import { WorkspacesConfigurationFactory } from "./config/factory";
import { ConfigConverter } from "./config/converter";
import { ConstraintsValidator } from "./config/constraintsValidator";

declare const window: Window & { glue42core: { workspacesFrameCache?: boolean } };

export class LayoutsManager {
    private _initialWorkspaceConfig: GoldenLayout.Config;
    private readonly _layoutsType = "Workspace";
    private readonly _layoutComponentType = "Workspace";

    constructor(
        private readonly resolver: LayoutStateResolver,
        private readonly _glue: Glue42Web.API,
        private readonly _configFactory: WorkspacesConfigurationFactory,
        private readonly _configConverter: ConfigConverter,
        private readonly _constraintsValidator: ConstraintsValidator) { }

    public async getInitialConfig(): Promise<FrameLayoutConfig> {
        // Preset initial config
        if (this._initialWorkspaceConfig) {
            return this._configFactory.generateInitialConfig([this._initialWorkspaceConfig]);
        }

        const startupConfig = scReader.config;

        // From workspace names
        if (startupConfig.workspaceNames && startupConfig.workspaceNames.length) {
            const workspaceLayoutData = await Promise.all(startupConfig.workspaceNames.map(async (name) => {
                return (await this.getWorkspaceByName(name));
            }));
            const workspaceConfigs = workspaceLayoutData.map(wld => {
                wld.config.workspacesOptions = wld.config.workspacesOptions || {};
                wld.config.workspacesOptions.context = wld.layoutData.context;

                return wld.config;
            });

            const validConfigs = workspaceConfigs.filter((wc) => wc);

            if (validConfigs.length) {
                validConfigs.forEach((c, i) => {
                    c.id = this._configFactory.getId();
                    c.workspacesOptions = c.workspacesOptions || {};
                    if (startupConfig.context && c.workspacesOptions.context) {
                        c.workspacesOptions.context = Object.assign(c.workspacesOptions.context, startupConfig.context);
                    }
                    else if (startupConfig.context) {
                        c.workspacesOptions.context = startupConfig.context;
                    }

                    (c.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName = startupConfig.workspaceNames[i];
                });
                return this._configFactory.generateInitialConfig(validConfigs);
            }
        } else if (!scReader.config?.build) { // Last session
            const workspaceConfigs = this.getLastSession();
            if (workspaceConfigs && workspaceConfigs.length) {
                workspaceConfigs.forEach((wc: GoldenLayout.Config) => {
                    if (wc) {
                        wc.id = this._configFactory.getId();
                    }
                });

                return this._configFactory.generateInitialConfig(workspaceConfigs);
            }
        }
        // Default
        return this._configFactory.getDefaultFrameConfig();
    }

    public getLastSession() {
        const workspacesFrameCache = window.glue42core?.workspacesFrameCache ?? true;
        if (!workspacesFrameCache) {
            return;
        }
        const workspacesFrame = storage.get(storage.LAST_SESSION_KEY) || [];
        const rendererFriendlyFrameConfig = workspacesFrame.map((wc: WorkspaceItem) => {
            this.addWorkspaceIds(wc);
            // this.addWindowIds(wc);
            return this._configConverter.convertToRendererConfig(wc);
        });
        return rendererFriendlyFrameConfig;
    }

    public async getSavedWorkspaceNames(): Promise<string[]> {
        const allLayouts = await this._glue.layouts.getAll(this._layoutsType);
        const workspaceLayouts = allLayouts.filter((l) => l.type === this._layoutsType);
        return workspaceLayouts.map((wl) => wl.name);
    }

    public async export() {
        return this._glue.layouts.export(this._layoutsType);
    }

    public async getWorkspaceByName(name: string): Promise<SavedConfigWithData> {
        const savedWorkspaceLayout = await this._glue.layouts.get(name, this._layoutsType);
        const savedWorkspace: WorkspaceItem = savedWorkspaceLayout.components[0].state as WorkspaceItem;
        this._constraintsValidator.fixWorkspace(savedWorkspace);
        const rendererFriendlyConfig = this._configConverter.convertToRendererConfig(savedWorkspace);

        this.addWorkspaceIds(rendererFriendlyConfig);

        return {
            config: rendererFriendlyConfig as GoldenLayout.Config,
            layoutData: {
                metadata: savedWorkspaceLayout.metadata,
                name,
                context: (savedWorkspace as WorkspaceItem & { context: object }).context ?? {}
            }
        };
    }

    public async delete(name: string): Promise<void> {
        await this._glue.layouts.remove(this._layoutsType, name);
    }

    public async save(options: SaveWorkspaceConfig): Promise<WorkspaceLayout> {
        const { workspace, name, saveContext } = options;
        if (!workspace.layout && !workspace.hibernateConfig) {
            throw new Error("An empty layout cannot be saved");
        }

        (workspace.layout?.config || workspace.hibernateConfig).workspacesOptions.name = name;

        const workspaceConfig = await this.saveWorkspaceCore(workspace);

        // Its superfluous to add the title to the layout since its never used
        if (workspaceConfig.config.title) {
            delete workspaceConfig.config.title;
        }

        let workspaceContext = undefined;

        if (saveContext) {
            try {
                workspaceContext = await this.getWorkspaceContext(workspace.id);
            } catch (error) {
                // can throw an exception when reloading
            }
        }

        const layoutToImport = {
            name,
            type: this._layoutsType as "Workspace",
            metadata: {},
            components: [{
                type: this._layoutComponentType as "Workspace",
                state: {
                    children: workspaceConfig.children,
                    config: workspaceConfig.config,
                    context: workspaceContext ?? {}
                }
            }]
        };

        await this._glue.layouts.import([layoutToImport as Glue42Web.Layouts.Layout], "merge");

        return layoutToImport;
    }

    public async generateLayout(name: string, workspace: Workspace) {
        if (!workspace.layout) {
            throw new Error("An empty layout cannot be generated");
        }
        workspace.layout.config.workspacesOptions.name = name;
        const workspaceConfig = await this.saveWorkspaceCore(workspace);

        // Its superfluous to add the title to the layout since its never used
        if (workspaceConfig.config.title) {
            delete workspaceConfig.config.title;
        }

        return {
            name,
            type: this._layoutsType as "Workspace",
            metadata: {},
            components: [{
                type: this._layoutComponentType as "Workspace", state: {
                    children: workspaceConfig.children,
                    config: workspaceConfig.config,
                    context: {}
                }
            }]
        };
    }

    public async saveWorkspacesFrame(workspaces: Workspace[]) {
        const workspacesFrameCache = window.glue42core?.workspacesFrameCache ?? true;
        if (!workspacesFrameCache) {
            return;
        }
        const configPromises = workspaces.map((w) => {
            return this.saveWorkspaceCoreSync(w);
        });
        const configs = await Promise.all(configPromises);
        storage.set(storage.LAST_SESSION_KEY, configs);
    }

    public setInitialWorkspaceConfig(config: GoldenLayout.Config) {
        this._initialWorkspaceConfig = config;
    }

    private async saveWorkspaceCore(workspace: Workspace): Promise<WorkspaceItem> {
        if (!workspace.layout && !workspace.hibernateConfig) {
            return undefined;
        }
        const workspaceConfig = this.resolver.getWorkspaceConfig(workspace.id);
        if ((workspaceConfig.workspacesOptions as any).layoutName) {
            delete (workspaceConfig.workspacesOptions as any).layoutName;
        }

        this.removeWorkspaceIds(workspaceConfig);
        await this.applyWindowLayoutState(workspaceConfig);

        const workspaceItem = this._configConverter.convertToAPIConfig(workspaceConfig) as WorkspaceItem;
        this.removeWorkspaceItemIds(workspaceItem);

        // The excess properties should be cleaned
        this.windowSummariesToWindowLayout(workspaceItem);
        this.addWindowUrlsToWindows(workspaceItem);
        this.workspaceSummaryToWorkspaceLayout(workspaceItem);

        return workspaceItem;
    }

    private saveWorkspaceCoreSync(workspace: Workspace): WorkspaceItem {
        if (!workspace.layout && !workspace.hibernateConfig) {
            return undefined;
        }
        const workspaceConfig = this.resolver.getWorkspaceConfig(workspace.id);
        this.removeWorkspaceIds(workspaceConfig);

        const workspaceItem = this._configConverter.convertToAPIConfig(workspaceConfig) as WorkspaceItem;
        this.removeWorkspaceItemIds(workspaceItem);

        // The excess properties should be cleaned
        this.windowSummariesToWindowLayout(workspaceItem);
        this.addWindowUrlsToWindows(workspaceItem);
        this.workspaceSummaryToWorkspaceLayout(workspaceItem);

        return workspaceItem;
    }

    private windowSummariesToWindowLayout(workspaceItem: WorkspaceItem) {
        const transform = (item: AnyItem) => {
            if (item.type === "window") {
                delete item.config.isMaximized;
                delete item.config.isLoaded;
                delete item.config.isFocused;
                delete item.config.windowId;
                delete item.config.workspaceId;
                delete item.config.frameId;
                delete item.config.positionIndex;

                if (item.config.appName) {
                    delete item.config.url;
                }

                return;
            }

            item.children.forEach(c => transform(c));
        };

        transform(workspaceItem);
    }

    private async addWindowContexts(workspaceItem: WorkspaceItem) {
        const add = async (item: AnyItem) => {
            if (item.type === "window") {
                if (item.config.windowId) {
                    const win = this._glue.windows.findById(item.config.windowId);
                    if (win) {
                        const winContext = await win.getContext();
                        item.config.context = Object.assign({}, item.config.context || {}, winContext);
                    }
                }

                return;
            }

            await Promise.all((item.children as AnyItem[]).map(c => add(c)));
        };

        await add(workspaceItem);
    }

    private workspaceSummaryToWorkspaceLayout(workspaceItem: WorkspaceItem) {
        if (workspaceItem?.config) {
            delete workspaceItem.config.frameId;
            delete workspaceItem.config.positionIndex;
        }
    }

    private addWindowUrlsToWindows(workspaceItem: WorkspaceItem) {
        const add = (item: AnyItem) => {
            if (item.type === "window" && !item.config.url && !item.config.appName) {
                const app = this._glue.appManager.application(item.config.appName);
                item.config.url = app?.userProperties?.details?.url;
                return;
            }

            if (item.type !== "window") {
                item.children.forEach(c => add(c));
            }
        };

        add(workspaceItem);
    }

    private addWorkspaceIds(configToPopulate: GoldenLayout.Config | GoldenLayout.ItemConfig) {
        if (!configToPopulate) {
            return;
        }
        const addRecursive = (config: GoldenLayout.ItemConfig | GoldenLayout.Config) => {
            config.id = this._configFactory.getId();

            if (config.type && config.type === "component") {
                config.componentName = `app${config.id}`;
            }

            if (config.type !== "component" && config.content) {
                config.content.forEach((i) => addRecursive(i));
            }
        };

        addRecursive(configToPopulate);
    }

    private addWindowIds(configToPopulate: GoldenLayout.Config | GoldenLayout.ItemConfig) {
        if (!configToPopulate) {
            return;
        }
        const addRecursive = (config: GoldenLayout.Config | GoldenLayout.ItemConfig | GoldenLayout.ComponentConfig) => {
            if (config.type === "component") {
                config.componentState.windowId = this._configFactory.getId();
            }

            if (config.type !== "component" && config.content) {
                config.content.forEach((i) => addRecursive(i));
            }
        };

        addRecursive(configToPopulate);
    }

    private removeWorkspaceIds(configToClean: GoldenLayout.Config) {
        const removeRecursive = (config: GoldenLayout.Config | GoldenLayout.ItemConfig) => {
            if ("id" in config) {
                delete config.id;
            }

            if (config?.type === "component") {
                config.componentName = "placeHolderId";
                config.title = "placeHolderId";
            }

            if (config.type !== "component" && config.content) {
                config.content.forEach((i) => removeRecursive(i));
            }
        };

        removeRecursive(configToClean);
    }

    private removeWorkspaceItemIds(configToClean: WorkspaceItem) {
        const removeRecursive = (config: AnyItem) => {
            if ("id" in config) {
                delete config.id;
            }

            if (config.type !== "window") {
                config.children?.forEach((i) => removeRecursive(i));
            }
        };

        removeRecursive(configToClean);
    }

    private async applyWindowLayoutState(config: GoldenLayout.Config) {
        const applyWindowLayoutStateRecursive = async (configToTraverse: GoldenLayout.ItemConfig) => {
            if (configToTraverse.type === "component") {
                const windowLayoutState = await this.getWindowLayoutState(configToTraverse.windowId);
                configToTraverse.componentState.layoutState = windowLayoutState;
            } else {
                configToTraverse.content.forEach((i) => applyWindowLayoutStateRecursive(i));
            }
        };
        await Promise.all(config.content.map(async (ic) => {
            await applyWindowLayoutStateRecursive(ic);
        }));
    }

    private async getWorkspaceContext(id: string) {
        return await this._glue.contexts.get(getWorkspaceContextName(id));
    }

    private async getWindowLayoutState(windowId: string) {
        // TODO to be implemented
        return Promise.resolve({ windowId });
    }
}
