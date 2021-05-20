/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnItem, Constraints, GroupItem, RowItem, WindowItem, WorkspaceItem } from "../types/internal";
import { DefaultMaxSize, DefaultMinSize } from "../utils/constants";

type ItemWithConstraints = WorkspaceItem | WindowItem | ColumnItem | RowItem | GroupItem;
export class ConstraintsValidator {
    public validateWorkspace(workspace: WorkspaceItem): boolean {
        const allItemsInWorkspace = this.getAllItemsFromWorkspace(workspace);
        const invalidItems = allItemsInWorkspace.filter((itemInWorkspace) => {
            return !this.areConstraintsValid(this.getConstraintsFromItem(itemInWorkspace));
        });

        return !invalidItems.length;
    }

    public fixWorkspace(workspace: WorkspaceItem): boolean {
        const allItemsInWorkspace = this.getAllItemsFromWorkspace(workspace);
        const invalidItems = allItemsInWorkspace.filter((itemInWorkspace) => {
            return !this.areConstraintsValid(this.getConstraintsFromItem(itemInWorkspace));
        });

        if (invalidItems.length) {
            allItemsInWorkspace.forEach((itemInWorkspace) => {
                if (!itemInWorkspace.config) {
                    return;
                }

                itemInWorkspace.config.minWidth = DefaultMinSize;
                itemInWorkspace.config.minHeight = DefaultMinSize;
                itemInWorkspace.config.maxWidth = DefaultMaxSize;
                itemInWorkspace.config.maxHeight = DefaultMaxSize;
            });

            return false;
        }

        return true;
    }

    public fixNewWindow(window: WindowItem, workspace: WorkspaceItem, parentId: string): void {
        let parent: RowItem | ColumnItem | GroupItem | WorkspaceItem;
        if (window.config?.minWidth === undefined &&
            window.config?.maxWidth === undefined &&
            window.config?.minHeight === undefined &&
            window.config?.maxHeight === undefined
        ) {
            return;
        }

        const traverse = (item: ItemWithConstraints, parentIdToFind: string): void => {
            if (parent) {
                return;
            }

            if (item.type === "window") {
                return;
            }

            if (item.id === parentIdToFind) {
                parent = item;
                return;
            }
            item.children.forEach((c) => {
                traverse(c, parentId);
            });
        };

        traverse(workspace, parentId);

        parent.children.push(window);

        if (!this.validateWorkspace(workspace)) {
            window.config.minWidth = DefaultMinSize;
            window.config.maxWidth = DefaultMaxSize;
            window.config.minHeight = DefaultMinSize;
            window.config.maxHeight = DefaultMaxSize;
        }

    }

    public fixNewContainer(container: ColumnItem | RowItem | GroupItem, workspace: WorkspaceItem, parentId: string): void {
        let parent: RowItem | ColumnItem | GroupItem | WorkspaceItem;

        const traverse = (item: ItemWithConstraints, parentIdToFind: string): void => {
            if (parent) {
                return;
            }

            if (item.type === "window") {
                return;
            }

            if (item.id === parentIdToFind) {
                parent = item;
                return;
            }
            item.children.forEach((c) => {
                traverse(c, parentId);
            });
        };

        traverse(workspace, parentId);

        parent.children.push(container as any);

        if (!this.validateWorkspace(workspace)) {
            const disableConstraintsRecursive = (item: ItemWithConstraints): void => {
                if (item.config) {
                    item.config.minWidth = DefaultMinSize;
                    item.config.maxWidth = DefaultMaxSize;
                    item.config.minHeight = DefaultMinSize;
                    item.config.maxHeight = DefaultMaxSize;
                }

                if (item.type === "window") {
                    return;
                }

                item.children.forEach((c) => disableConstraintsRecursive(c));
            };

            disableConstraintsRecursive(container);
        }
    }

    private getAllItemsFromWorkspace(workspace: WorkspaceItem): ItemWithConstraints[] {
        const allItemsInWorkspace: ItemWithConstraints[] = [];

        const traverse = (item: ItemWithConstraints): void => {
            allItemsInWorkspace.push(item);
            if (item.type === "window") {
                return;
            }

            item.children.forEach((c) => traverse(c));
        };

        traverse(workspace);

        return allItemsInWorkspace;
    }

    private areConstraintsValid(constraints: Constraints): boolean {
        return constraints.minWidth <= constraints.maxWidth &&
            constraints.minHeight <= constraints.maxHeight;
    }

    private getConstraintsFromItem(item: ItemWithConstraints): Constraints {
        const itemMinWidth: number = item.config?.minWidth ?? DefaultMinSize;
        const itemMaxWidth = item.config?.maxWidth ?? DefaultMaxSize;
        const itemMinHeight = item.config?.minHeight ?? DefaultMinSize;
        const itemMaxHeight = item.config?.maxHeight ?? DefaultMaxSize;

        let childrenMinWidth = 0;
        let childrenMaxWidth = 0;
        let childrenMinHeight = 0;
        let childrenMaxHeight = 0;

        if (item.type === "window") {
            return {
                minWidth: itemMinWidth,
                maxWidth: itemMaxWidth,
                minHeight: itemMinHeight,
                maxHeight: itemMaxHeight,
            };
        } else if (item.type === "row") {
            item.children.forEach((ci) => {
                const childConstraints = this.getConstraintsFromItem(ci);

                childrenMinWidth += childConstraints.minWidth ?? DefaultMinSize;
                childrenMaxWidth += childConstraints.maxWidth ?? DefaultMaxSize;
                childrenMinHeight = Math.max(childConstraints.minHeight ?? DefaultMinSize, childrenMinHeight);
                childrenMaxHeight = Math.min(childConstraints.maxHeight ?? DefaultMaxSize, childrenMaxHeight || itemMaxHeight);
            });
        } else if (item.type === "column") {
            item.children.forEach((ci) => {
                const childConstraints = this.getConstraintsFromItem(ci);

                childrenMinWidth = Math.max(childConstraints.minWidth ?? DefaultMinSize, childrenMinWidth);
                childrenMaxWidth = Math.min(childConstraints.maxWidth ?? DefaultMaxSize, childrenMaxWidth || itemMaxWidth);
                childrenMinHeight += childConstraints.minHeight ?? DefaultMinSize;
                childrenMaxHeight += childConstraints.maxHeight ?? DefaultMaxSize;
            });
        } else { // handles group and workspace
            item.children.forEach((ci) => {
                const childConstraints = this.getConstraintsFromItem(ci);

                childrenMinWidth = Math.max(childConstraints.minWidth ?? DefaultMinSize, childrenMinWidth);
                childrenMaxWidth = Math.min(childConstraints.maxWidth ?? DefaultMaxSize, childrenMaxWidth || itemMaxWidth);
                childrenMinHeight = Math.max(childConstraints.minHeight ?? DefaultMinSize, childrenMinHeight);
                childrenMaxHeight = Math.min(childConstraints.maxHeight ?? DefaultMaxSize, childrenMaxHeight || itemMaxHeight);
            });
        }

        childrenMaxWidth = childrenMaxWidth || itemMaxWidth;
        childrenMaxHeight = childrenMaxHeight || itemMaxHeight;

        return {
            minWidth: Math.max(itemMinWidth, childrenMinWidth),
            maxWidth: Math.min(itemMaxWidth, childrenMaxWidth),
            minHeight: Math.max(itemMinHeight, childrenMinHeight),
            maxHeight: Math.min(itemMaxHeight, childrenMaxHeight),
        };
    }
}
