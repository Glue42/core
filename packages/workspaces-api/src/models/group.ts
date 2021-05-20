import { Base } from "./base/base";
import { Glue42Workspaces } from "../../workspaces.d";
import { groupLockConfigDecoder } from "../shared/decoders";
import { GroupLockConfig } from "../types/temp";
import { number, optional } from "decoder-validate";

interface PrivateData {
    base: Base;
}

const privateData = new WeakMap<Group, PrivateData>();

const getBase = (model: Group): Base => {
    return privateData.get(model).base;
};

export class Group implements Glue42Workspaces.Group {

    constructor(base: Base) {
        privateData.set(this, { base });
    }

    public get type(): "group" {
        return "group";
    }

    public get id(): string {
        return getBase(this).getId(this);
    }

    public get frameId(): string {
        return getBase(this).getFrameId(this);
    }

    public get workspaceId(): string {
        return getBase(this).getWorkspaceId(this);
    }

    public get positionIndex(): number {
        return getBase(this).getPositionIndex(this);
    }

    public get children(): Glue42Workspaces.WorkspaceElement[] {
        return getBase(this).getAllChildren(this);
    }
    public get parent(): Glue42Workspaces.Workspace | Glue42Workspaces.WorkspaceBox {
        return getBase(this).getMyParent(this);
    }
    public get frame(): Glue42Workspaces.Frame {
        return getBase(this).getMyFrame(this);
    }
    public get workspace(): Glue42Workspaces.Workspace {
        return getBase(this).getMyWorkspace(this);
    }
    public get allowExtract(): boolean {
        return getBase(this).getAllowExtract(this);
    }

    public get allowDrop(): boolean {
        return getBase(this).getAllowDrop(this);
    }

    public get showMaximizeButton(): boolean {
        return getBase(this).getShowMaximizeButton(this);
    }

    public get showEjectButton(): boolean {
        return getBase(this).getShowEjectButton(this);
    }

    public get showAddWindowButton(): boolean {
        return getBase(this).getShowAddWindowButton(this);
    }

    public get minWidth(): number {
        return getBase(this).getMinWidth(this);
    }

    public get minHeight(): number {
        return getBase(this).getMinHeight(this);
    }

    public get maxWidth(): number {
        return getBase(this).getMaxWidth(this);
    }

    public get maxHeight(): number {
        return getBase(this).getMaxHeight(this);
    }

    public get width(): number {
        return getBase(this).getWidthInPx(this);
    }

    public get height(): number {
        return getBase(this).getHeightInPx(this);
    }

    public addWindow(definition: Glue42Workspaces.WorkspaceWindowDefinition): Promise<Glue42Workspaces.WorkspaceWindow> {
        return getBase(this).addWindow(this, definition, "group");
    }

    public async addGroup(): Promise<Group> {
        throw new Error("Adding groups as group child is not supported");
    }

    public async addColumn(): Promise<Glue42Workspaces.Column> {
        throw new Error("Adding columns as group child is not supported");
    }

    public async addRow(): Promise<Glue42Workspaces.Row> {
        throw new Error("Adding rows as group child is not supported");
    }

    public removeChild(predicate: (child: Glue42Workspaces.WorkspaceElement) => boolean): Promise<void> {
        return getBase(this).removeChild(this, predicate);
    }

    public maximize(): Promise<void> {
        return getBase(this).maximize(this);
    }

    public restore(): Promise<void> {
        return getBase(this).restore(this);
    }

    public close(): Promise<void> {
        return getBase(this).close(this);
    }

    public lock(config?: GroupLockConfig | ((config: GroupLockConfig) => GroupLockConfig)): Promise<void> {
        let lockConfigResult = undefined;

        if (typeof config === "function") {
            const currentLockConfig = {
                allowDrop: this.allowDrop,
                allowExtract: this.allowExtract,
                showAddWindowButton: this.showAddWindowButton,
                showEjectButton: this.showEjectButton,
                showMaximizeButton: this.showMaximizeButton
            };

            lockConfigResult = config(currentLockConfig);
        } else {
            lockConfigResult = config;
        }
        const verifiedConfig = lockConfigResult === undefined ? undefined : groupLockConfigDecoder.runWithException(lockConfigResult);
        return getBase(this).lockContainer(this, verifiedConfig);
    }

    public async setSize(width?: number, height?: number): Promise<void> {
        if (!width && !height) {
            throw new Error("Expected either width or height to be passed}");
        }

        optional(number().where(n => n > 0, "The height should be positive")).runWithException(height);
        optional(number().where(n => n > 0, "The width should be positive")).runWithException(width);

        return getBase(this).setSize(this, width, height);
    }

}
