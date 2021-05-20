/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorkspacesManager } from "./manager";
import { ColumnItem, GroupItem, RowItem, WindowItem, WindowSummary, WorkspaceItem } from "./types/internal";

export class WorkspacesLocker {
    constructor(private readonly manager: WorkspacesManager) { }

    public applyLockConfiguration(workspacesConfig: WorkspaceItem, snapshot: WorkspaceItem): Promise<void> {
        const traverse = async (item: WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem, snapshotItem: WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem): Promise<void> => {
            if (item.type === "window") {
                if (this.doesWindowContainLockingProperties(item)) {
                    this.manager.lockWindow({
                        windowPlacementId: snapshotItem.id,
                        config: item.config
                    });
                }
                return;
            } else if (item.type === "group" || item.type === "row" || item.type === "column") {

                if (this.doesContainerContainLockingProperties(item)) {
                    this.manager.lockContainer({
                        itemId: snapshotItem.id,
                        type: item.type,
                        config: item.config
                    });
                }
            } else {
                if (this.doesWorkspaceContainLockingProperties(item)) {
                    this.manager.lockWorkspace({
                        workspaceId: snapshot.id,
                        config: item.config
                    });
                }
            }

            await Promise.all((item.children as Array<ColumnItem | RowItem | GroupItem | WindowItem>).map((i: ColumnItem | RowItem | GroupItem | WindowItem, index: number) => {
                return traverse(i, (snapshotItem as ColumnItem | RowItem | GroupItem).children[index]);
            }));
        };

        return traverse(workspacesConfig, snapshot);
    }

    public applyWindowLockConfiguration(windowSummary: WindowSummary): void {
        const item: WindowItem = {
            config: windowSummary.config,
            id: windowSummary.itemId,
            type: "window"
        };
        if (this.doesWindowContainLockingProperties(item)) {
            this.manager.lockWindow({
                windowPlacementId: windowSummary.itemId,
                config: windowSummary.config
            });
        }
    }

    public applyContainerLockConfiguration(definition: RowItem | ColumnItem | GroupItem, workspace: WorkspaceItem, itemId: string): void {
        const snapshot = this.getItemFromWorkspace(workspace, itemId);
        const traverse = (item: WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem, snapshotItem: WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem): void => {
            if (item.type === "window") {
                if (this.doesWindowContainLockingProperties(item)) {
                    this.manager.lockWindow({
                        windowPlacementId: snapshotItem.id,
                        config: item.config
                    });
                }
                return;
            } else if (item.type === "group" || item.type === "row" || item.type === "column") {
                if (this.doesContainerContainLockingProperties(item)) {
                    this.manager.lockContainer({
                        itemId: snapshotItem.id,
                        type: item.type,
                        config: item.config
                    });
                }
            } else {
                if (this.doesWorkspaceContainLockingProperties(item)) {
                    this.manager.lockWorkspace({
                        workspaceId: item.id,
                        config: item.config
                    });
                }
            }

            (item.children as Array<ColumnItem | RowItem | GroupItem | WindowItem>).map((i: ColumnItem | RowItem | GroupItem | WindowItem, index: number) => {
                return traverse(i, (snapshotItem as GroupItem | ColumnItem | RowItem).children[index]);
            });
        };

        return traverse(definition, snapshot);
    }

    private doesWindowContainLockingProperties(window: WindowItem): boolean {
        return this.isLockingPropertySet(window.config?.showCloseButton) || this.isLockingPropertySet(window.config?.allowExtract);
    }

    private doesContainerContainLockingProperties(container: ColumnItem | RowItem | GroupItem): boolean {
        return this.isLockingPropertySet(container.config?.allowDrop) ||
            this.isLockingPropertySet(container.config?.allowExtract) ||
            this.isLockingPropertySet(container.config?.showExtractButton) ||
            this.isLockingPropertySet(container.config?.showMaximizeButton) ||
            this.isLockingPropertySet(container.config?.showAddWindowButton);
    }

    private doesWorkspaceContainLockingProperties(workspace: WorkspaceItem): boolean {
        return this.isLockingPropertySet(workspace.config?.allowDrop) ||
            this.isLockingPropertySet(workspace.config?.allowDropLeft) ||
            this.isLockingPropertySet(workspace.config?.allowDropTop) ||
            this.isLockingPropertySet(workspace.config?.allowDropRight) ||
            this.isLockingPropertySet(workspace.config?.allowDropBottom) ||
            this.isLockingPropertySet(workspace.config?.allowExtract) ||
            this.isLockingPropertySet(workspace.config?.showExtractButtons) ||
            this.isLockingPropertySet(workspace.config?.showWindowCloseButtons) ||
            this.isLockingPropertySet(workspace.config?.showAddWindowButtons) ||
            this.isLockingPropertySet(workspace.config?.showSaveButton) ||
            this.isLockingPropertySet(workspace.config?.showCloseButton) ||
            this.isLockingPropertySet(workspace.config?.allowSplitters);
    }

    private isLockingPropertySet(value: boolean): boolean {
        return typeof value === "boolean";
    }

    private getItemFromWorkspace(workspaceItem: WorkspaceItem, itemId: string): WorkspaceItem | GroupItem | ColumnItem | RowItem | WindowItem {
        const find = (item: WorkspaceItem | RowItem | ColumnItem | GroupItem | WindowItem): WorkspaceItem | RowItem | ColumnItem | GroupItem | WindowItem => {
            if (item.id === itemId) {
                return item;
            }

            if (item.type === "window") {
                return;
            }

            return (item.children as any).map((c: GroupItem | ColumnItem | RowItem | WindowItem) => find(c)).find((r: any) => r);
        };

        return find(workspaceItem);
    }
}
