/* eslint-disable @typescript-eslint/no-explicit-any */
import GoldenLayout, { ContentItem } from "@glue42/golden-layout";
import { Bounds, ContainerSummary } from "../types/internal";
import { getElementBounds, idAsString } from "../utils";
import { DefaultMaxSize, DefaultMinSize } from "../utils/constants";
import store from "./store";
import { WorkspaceWindowWrapper } from "./windowWrapper";

export class WorkspaceContainerWrapper {
    constructor(
        private readonly containerContentItem: GoldenLayout.Row | GoldenLayout.Stack | GoldenLayout.Column,
        private readonly frameId: string,
        private readonly workspaceId?: string) {
    }

    public get minWidth(): number {
        return this.containerContentItem.getMinWidth() ?? DefaultMinSize;
    }

    public set minWidth(value: number | undefined) {
        if (this.containerContentItem.type === "row") {
            throw new Error(`Cannot set minWidth ${value} to a container of type row`);
        }
        if (isNaN(value) || value < 0) {
            throw new Error(`Invalued value passed for minWidth ${value}`);
        }
        this.containerContentItem.config.workspacesConfig.minWidth = value;
    }

    public get minHeight(): number {
        return this.containerContentItem.getMinHeight() ?? DefaultMinSize;
    }

    public set minHeight(value: number | undefined) {
        if (this.containerContentItem.type === "column") {
            throw new Error(`Cannot set minHeight ${value} to a container of type column`);
        }
        if (isNaN(value) || value < 0) {
            throw new Error(`Invalued value passed for minHeight ${value}`);
        }
        this.containerContentItem.config.workspacesConfig.minHeight = value;
    }

    public get maxWidth(): number {
        return this.containerContentItem.getMaxWidth() ?? DefaultMaxSize;
    }

    public set maxWidth(value: number | undefined) {
        if (this.containerContentItem.type === "row") {
            throw new Error(`Cannot set maxWidth ${value} to a container of type row`);
        }
        if (isNaN(value) || value < 0) {
            throw new Error(`Invalued value passed for maxWidth ${value}`);
        }
        (this.containerContentItem.config.workspacesConfig as any).maxWidth = value;
    }

    public get maxHeight(): number {
        return this.containerContentItem.getMaxHeight() ?? DefaultMaxSize;
    }

    public set maxHeight(value: number | undefined) {
        if (this.containerContentItem.type === "column") {
            throw new Error(`Cannot set maxHeight ${value} to a container of type column`);
        }
        if (isNaN(value) || value < 0) {
            throw new Error(`Invalued value passed for maxHeight ${value}`);
        }
        this.containerContentItem.config.workspacesConfig.maxHeight = value;
    }

    public get allowDrop(): boolean {
        return (this.containerContentItem.config.workspacesConfig as any).allowDrop ?? true;
    }

    public set allowDrop(value: boolean | undefined) {
        (this.containerContentItem.config.workspacesConfig as any).allowDrop = value;

        this.populateChildrenAllowDrop(value);
    }

    public get allowExtract(): boolean {
        return (this.containerContentItem.config.workspacesConfig as any).allowExtract ?? true;
    }

    public set allowExtract(value: boolean | undefined) {
        (this.containerContentItem.config.workspacesConfig as any).allowExtract = value;

        this.populateChildrenAllowExtact(value);
    }

    public get showMaximizeButton(): boolean {
        if (this.containerContentItem.config.type !== "stack") {
            throw new Error(`Accessing showMaximizeButton of container ${this.containerContentItem.type} ${this.containerContentItem.config.id} the property is available only for stacks`);
        }
        return (this.containerContentItem.config.workspacesConfig as any).showMaximizeButton ?? true;
    }

    public set showMaximizeButton(value: boolean | undefined) {
        if (this.containerContentItem.config.type !== "stack") {
            throw new Error(`Setting showMaximizeButton of container ${this.containerContentItem.type} ${this.containerContentItem.config.id} the property is available only for stacks`);
        }
        (this.containerContentItem.config.workspacesConfig as any).showMaximizeButton = value;
    }

    public get showEjectButton(): boolean {
        if (this.containerContentItem.config.type !== "stack") {
            throw new Error(`Accessing showEjectButton of container ${this.containerContentItem.type} ${this.containerContentItem.config.id} the property is available only for stacks`);
        }
        return (this.containerContentItem.config.workspacesConfig as any).showEjectButton ?? true;
    }

    public set showEjectButton(value: boolean | undefined) {
        if (this.containerContentItem.config.type !== "stack") {
            throw new Error(`Setting showEjectButton of container ${this.containerContentItem.type} ${this.containerContentItem.config.id} the property is available only for stacks`);
        }
        (this.containerContentItem.config.workspacesConfig as any).showEjectButton = value;
    }

    public get showAddWindowButton(): boolean {
        if (this.containerContentItem.config.type !== "stack") {
            throw new Error(`Accessing showAddWindowButton of container ${this.containerContentItem.type} ${this.containerContentItem.config.id} the property is available only for stacks`);
        }
        return (this.containerContentItem.config.workspacesConfig as any).showAddWindowButton ?? true;
    }

    public set showAddWindowButton(value: boolean | undefined) {
        if (this.containerContentItem.config.type !== "stack") {
            throw new Error(`Setting showAddWindowButton of container ${this.containerContentItem.type} ${this.containerContentItem.config.id} the property is available only for stacks`);
        }
        (this.containerContentItem.config.workspacesConfig as any).showAddWindowButton = value;
    }

    public get positionIndex(): number {
        return this.containerContentItem?.parent?.contentItems.indexOf(this.containerContentItem) || 0;
    }

    public get bounds(): Bounds {
        if (!this.containerContentItem) {
            return {} as Bounds;
        }
        return getElementBounds(this.containerContentItem.element);
    }

    public get isPinned(): boolean {
        return this.containerContentItem.config.workspacesConfig.isPinned ?? false;
    }

    public get summary(): ContainerSummary {
        const workspaceId = this.workspaceId ?? store.getByContainerId(idAsString(this.containerContentItem.config.id))?.id;
        const userFriendlyType = this.getUserFriendlyType(this.containerContentItem?.type || "workspace");

        let config: ContainerSummary["config"] = {
            workspaceId,
            frameId: this.frameId,
            positionIndex: this.positionIndex,
            allowDrop: this.allowDrop,
            minWidth: this.minWidth,
            maxWidth: this.maxWidth,
            minHeight: this.minHeight,
            maxHeight: this.maxHeight,
            widthInPx: this.bounds.width,
            heightInPx: this.bounds.height,
            isPinned: this.isPinned
        };

        const type = userFriendlyType === "window" ? undefined : userFriendlyType;
        if (type === "group") {
            config = {
                ...config,
                allowExtract: this.allowExtract,
                showMaximizeButton: this.showMaximizeButton,
                showEjectButton: this.showEjectButton,
                showAddWindowButton: this.showAddWindowButton
            };
        }
        return {
            itemId: idAsString(this.containerContentItem.config.id),
            type: userFriendlyType === "window" ? undefined : userFriendlyType,
            config
        };
    }

    public get config(): GoldenLayout.ItemConfig {
        const workspace = store.getByContainerId(this.containerContentItem.config.id) ||
            store.getByWindowId(idAsString(this.containerContentItem.config.id));

        const workspaceConfig = workspace.layout.toConfig();

        const containerConfig = this.findElementInConfig(idAsString(this.containerContentItem.config.id), workspaceConfig);
        containerConfig.workspacesConfig.isPinned = containerConfig.workspacesConfig.isPinned ?? false;

        return containerConfig;
    }

    private populateChildrenAllowDrop(value: boolean | undefined): void {
        const lockChildren = (children: ContentItem[]): void => {
            children.forEach((c) => {
                if (c.type === "component") {
                    return;
                }

                const wrapper = new WorkspaceContainerWrapper(c, this.frameId);

                wrapper.allowDrop = value;

                lockChildren(c.contentItems);
            });
        };

        lockChildren(this.containerContentItem.contentItems);
    }

    private populateChildrenAllowExtact(value: boolean | undefined): void {
        const lockChildren = (children: ContentItem[]): void => {
            children.forEach((c) => {
                if (c.type === "component") {
                    const windowWrapper = new WorkspaceWindowWrapper(c, this.frameId);

                    windowWrapper.allowExtract = value;
                    return;
                }

                if (c.type === "stack") {
                    const containerWrapper = new WorkspaceContainerWrapper(c, this.frameId);
                    containerWrapper.allowExtract = value;
                }

                lockChildren(c.contentItems);
            });
        };

        lockChildren(this.containerContentItem.contentItems);
    }

    private getUserFriendlyType(type: "row" | "column" | "component" | "stack" | "root" | "workspace"): "row" | "window" | "column" | "group" | "workspace" {
        if (type === "stack") {
            return "group";
        } else if (type === "root") {
            return "workspace";
        } else if (type === "component") {
            return "window";
        }

        return type;
    }

    private findElementInConfig(elementId: string, config: GoldenLayout.Config): GoldenLayout.ItemConfig {
        const search = (glConfig: GoldenLayout.Config | GoldenLayout.ItemConfig): any => {
            if (idAsString(glConfig.id) === elementId) {
                return [glConfig];
            }

            const contentToTraverse = (glConfig as any).content || [];

            return contentToTraverse.reduce((acc: any, ci: any) => [...acc, ...search(ci)], []);
        };

        const searchResult = search(config);

        return searchResult.find((i: GoldenLayout.ItemConfig) => i.id);
    }
}
