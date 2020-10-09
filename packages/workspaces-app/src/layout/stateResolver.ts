import { WindowSummary, WorkspaceSummary, ContainerSummary, WorkspaceOptionsWithLayoutName, WorkspaceConfig } from "../types/internal";
import store from "../store";
import GoldenLayout from "@glue42/golden-layout";
import { LayoutEventEmitter } from "./eventEmitter";
import { idAsString } from "../utils";
import { EmptyVisibleWindowName } from "../constants";

export class LayoutStateResolver {
    constructor(private readonly _frameId: string,
        private readonly _layoutEventEmitter: LayoutEventEmitter) { }

    public async getWindowSummary(windowId: string | string[]): Promise<WindowSummary> {
        windowId = Array.isArray(windowId) ? windowId[0] : windowId;
        let windowContentItem = store.getWindowContentItem(windowId);
        if (!windowContentItem) {
            await this.waitForWindowContentItem(windowId);
            windowContentItem = store.getWindowContentItem(windowId);
        }
        return this.getWindowSummaryCore(windowContentItem, windowId);
    }

    public getWindowSummarySync(windowId: string | string[], contentItem?: GoldenLayout.Component): WindowSummary {
        windowId = Array.isArray(windowId) ? windowId[0] : windowId;
        const windowContentItem = contentItem || store.getWindowContentItem(windowId);

        return this.getWindowSummaryCore(windowContentItem, windowId);
    }

    public getWorkspaceConfig(workspaceId: string): GoldenLayout.Config {
        const workspace = store.getById(workspaceId);

        if (!workspace) {
            throw new Error(`Could find workspace to remove with id ${workspaceId}`);
        }

        const glConfig = workspace.layout ? workspace.layout.toConfig() : { workspacesOptions: {}, content: [], id: workspaceId };
        glConfig.workspacesOptions.frameId = this._frameId;
        glConfig.workspacesOptions.positionIndex = this.getWorkspaceTabIndex(workspaceId);

        if (!glConfig.workspacesOptions.title) {
            glConfig.workspacesOptions.title = store.getWorkspaceTitle(workspaceId);
        }

        glConfig.workspacesOptions.name = glConfig.workspacesOptions.name || glConfig.workspacesOptions.title;

        this.transformComponentsToWindowSummary(glConfig);
        this.transformParentsToContainerSummary(glConfig);

        return glConfig;
    }

    public getWorkspaceSummary(workspaceId: string): WorkspaceSummary {
        const config = this.getWorkspaceConfig(workspaceId);
        const workspaceIndex = this.getWorkspaceTabIndex(workspaceId);
        const summaryConfig: WorkspaceConfig ={
            frameId: this._frameId,
            positionIndex: workspaceIndex,
            title: store.getWorkspaceTitle(workspaceId),
            name: config.workspacesOptions.name || store.getWorkspaceTitle(workspaceId),
        };

        if((config.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName){
            summaryConfig.layoutName = (config.workspacesOptions as WorkspaceOptionsWithLayoutName).layoutName
        }
        return {
            config: summaryConfig,
            id: workspaceId
        };
    }

    public isWindowMaximized(id: string | string[]): boolean {
        const placementId = idAsString(id);
        const windowContentItem = store.getWindowContentItem(placementId);

        return windowContentItem?.parent.isMaximized;
    }

    public isWindowSelected(id: string | string[]): boolean {
        const placementId = idAsString(id);
        const windowContentItem = store.getWindowContentItem(placementId);

        return windowContentItem?.parent.getActiveContentItem().config.id === placementId;
    }

    public getContainerSummary(containerId: string | string[]): ContainerSummary {
        containerId = idAsString(containerId);

        const workspace = store.getByContainerId(containerId);
        const containerContentItem = store.getContainer(containerId) as GoldenLayout.ContentItem;
        const containerPositionIndex = containerContentItem.parent?.contentItems.indexOf(containerContentItem);

        return {
            itemId: containerId,
            config: {
                workspaceId: workspace.id,
                frameId: this._frameId,
                positionIndex: containerPositionIndex || 0
            }
        };
    }

    public getContainerSummaryByReference(item: GoldenLayout.ContentItem, workspaceId: string): ContainerSummary {
        const containerPositionIndex = item.parent?.contentItems.indexOf(item);

        return {
            itemId: idAsString(item.config.id),
            config: {
                workspaceId,
                frameId: this._frameId,
                positionIndex: containerPositionIndex || 0
            }
        };
    }

    public getContainerConfig(containerId: string | string[]): GoldenLayout.ItemConfig {
        containerId = idAsString(containerId);

        const workspace = store.getByContainerId(containerId) || store.getByWindowId(containerId);
        const workspaceConfig = workspace.layout.toConfig();

        return this.findElementInConfig(containerId, workspaceConfig);
    }

    public isWindowInWorkspace(windowId: string) {
        return !!store.getWindowContentItem(windowId);
    }

    public getFrameSnapshot() {
        const allWorkspaceSnapshots = store.workspaceIds.map(wid => this.getWorkspaceSummary(wid));
        return {
            id: this._frameId,
            config: {},
            workspaces: allWorkspaceSnapshots
        };
    }

    public getSnapshot(itemId: string) {
        try {
            return this.getWorkspaceConfig(itemId);
        } catch (error) {
            return this.getFrameSnapshot();
        }
    }

    private findElementInConfig(elementId: string, config: GoldenLayout.Config): GoldenLayout.ItemConfig {
        const search = (glConfig: GoldenLayout.Config | GoldenLayout.ItemConfig): Array<GoldenLayout.ItemConfig> => {
            if (glConfig.id === elementId) {
                return [glConfig as GoldenLayout.ItemConfig];
            }

            const contentToTraverse = glConfig.type !== "component" ? glConfig.content : [];

            return contentToTraverse.reduce((acc, ci) => [...acc, ...search(ci)], []);
        };

        const searchResult = search(config);

        return searchResult.find((i: GoldenLayout.ItemConfig) => i.id);
    }

    private getWorkspaceTabIndex(workspaceId: string) {
        const workspaceLayoutStack = store.workspaceLayout.root.getItemsById(workspaceId)[0].parent;
        const workspaceIndex = ((workspaceLayoutStack as GoldenLayout.Stack).header)
            .tabs.findIndex((t) => t.contentItem.config.id === workspaceId);

        return workspaceIndex;
    }

    private getWindowSummaryCore(windowContentItem: GoldenLayout.Component, winId: string) {
        const isFocused = windowContentItem.parent.getActiveContentItem().config.id === windowContentItem.config.id;
        const isLoaded = windowContentItem.config.componentState.windowId !== undefined;
        const positionIndex = windowContentItem.parent.contentItems.indexOf(windowContentItem);
        const workspaceId = store.getByWindowId(winId).id;
        const { appName, url, windowId } = windowContentItem.config.componentState;

        const userFriendlyParent = this.getUserFriendlyParent(windowContentItem);

        return {
            itemId: idAsString(windowContentItem.config.id),
            parentId: idAsString(userFriendlyParent.config.id),
            config: {
                frameId: this._frameId,
                isFocused,
                isLoaded,
                positionIndex,
                workspaceId,
                windowId,
                isMaximized: this.isWindowMaximized(windowId),
                appName,
                url,
                title: windowContentItem.config.title
            }
        };
    }

    private getUserFriendlyParent(contentItem: GoldenLayout.ContentItem): GoldenLayout.ContentItem {
        if (!contentItem.parent) {
            return contentItem;
        }

        if (contentItem.parent.config.workspacesConfig.wrapper) {
            return this.getUserFriendlyParent(contentItem.parent as GoldenLayout.ContentItem);
        }

        return contentItem.parent as GoldenLayout.ContentItem;
    }

    private transformComponentsToWindowSummary(glConfig: GoldenLayout.ItemConfig) {
        if (glConfig.type === "component" && glConfig.componentName === EmptyVisibleWindowName) {
            return;
        }
        if (glConfig.type === "component") {
            const summary = this.getWindowSummarySync(glConfig.id);

            glConfig.workspacesConfig = glConfig.workspacesConfig || {};
            glConfig.workspacesConfig = { ...glConfig.workspacesConfig, ...summary.config };
            return;
        }
        glConfig.content?.map((c) => this.transformComponentsToWindowSummary(c));
    }

    private transformParentsToContainerSummary(glConfig: GoldenLayout.ItemConfig) {
        if (glConfig.type === "component") {
            return;
        }

        if (glConfig.type === "stack" || glConfig.type === "row" || glConfig.type === "column") {
            const summary = this.getContainerSummary(glConfig.id);

            glConfig.workspacesConfig = glConfig.workspacesConfig || {};
            glConfig.workspacesConfig = { ...glConfig.workspacesConfig, ...summary.config };
        }

        glConfig.content?.map((c) => this.transformParentsToContainerSummary(c));
    }

    private waitForWindowContentItem(windowId: string) {
        return new Promise((res) => {
            const unsub = this._layoutEventEmitter.onContentComponentCreated((component) => {
                if (component.config.id === windowId) {
                    unsub();
                    res();
                }
            });

            const windowContentItem = store.getWindowContentItem(windowId);
            if (windowContentItem) {
                unsub();
                res();
            }
        });
    }
}
