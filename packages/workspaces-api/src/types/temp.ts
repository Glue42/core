/** Provides fine grain control when locking a workspace */
export interface WorkspaceLockConfig {
    /** Prevents the splitters for being draggable, so the windows cannot be resized */
    allowSplitters?: boolean;
    /** (enterprise only) Controls the ability of the users to drop outside windows in the workspace */
    allowDrop?: boolean;
    /**Controls the users ability to drop windows in left zone of the workspace */
    allowDropLeft?: boolean;
    /**Controls the users ability to drop windows in top zone of the workspace */
    allowDropTop?: boolean;
    /**Controls the users ability to drop windows in right zone of the workspace */
    allowDropRight?: boolean;
    /**Controls the users ability to drop windows in bottom zone of the workspace */
    allowDropBottom?: boolean;
    /** Controls the ability of the users to extract (or rearrange) windows inside the workspace */
    allowExtract?: boolean;
    /** Controls the visibility of the close button location in the workspaces tab */
    showCloseButton?: boolean;
    /** Controls the visibility of the save workspace button located in the workspace tab */
    showSaveButton?: boolean;
    /** Controls the visibility of all the add window buttons (the ones with the plus icon) located in the group headers */
    showAddWindowButtons?: boolean;
    /**Controls the visibility of all eject buttons located in the group headers */
    showEjectButtons?: boolean;
    /**Controls the visibility of all close button located in the windows' tab elements */
    showWindowCloseButtons?: boolean;
}

/**Provides fine grain control when locking a window */
export interface WorkspaceWindowLockConfig {
    /**  Blocks the users ability to extract the specified window */
    allowExtract?: boolean;
    /** Controls the visibility of the close button which appears is located in the specified tab */
    showCloseButton?: boolean;
}

export interface GroupLockConfig {
    allowExtract?: boolean;
    allowDrop?: boolean;
    showMaximizeButton?: boolean;
    showEjectButton?: boolean;
    showAddWindowButton?: boolean;
}

export interface RowLockConfig {
    allowDrop?: boolean;
}

export interface ColumnLockConfig {
    allowDrop?: boolean;
}

export interface Constraints {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
}

export interface WindowDefinitionConfig {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    allowExtract?: boolean;
    showCloseButton?: boolean;
}

export interface GroupDefinitionConfig {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    allowExtract?: boolean;
    showMaximizeButton?: boolean;
    showEjectButton?: boolean;
    allowDrop?: boolean;
    showAddWindowButton?: boolean;
}

export interface RowDefinitionConfig {
    minHeight?: number;
    maxHeight?: number;
    allowDrop?: boolean;
    isPinned?: boolean;
}

export interface ColumnDefinitionConfig {
    minWidth?: number;
    maxWidth?: number;
    allowDrop?: boolean;
    isPinned?: boolean;
}
