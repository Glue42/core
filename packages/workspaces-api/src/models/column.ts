import { Base } from "./base/base";
import { Glue42Workspaces } from "../../workspaces.d";
import { columnLockConfigDecoder } from "../shared/decoders";
import { ColumnLockConfig } from "../types/temp";
import { number } from "decoder-validate";

interface PrivateData {
    base: Base;
}

const privateData = new WeakMap<Column, PrivateData>();

const getBase = (model: Column): Base => {
    return privateData.get(model).base;
};

export class Column implements Glue42Workspaces.Column {

    constructor(base: Base) {
        privateData.set(this, { base });
    }

    public get type(): "column" {
        return "column";
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
    public get allowDrop(): boolean {
        return getBase(this).getAllowDrop(this);
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

    public get isPinned(): boolean {
        return getBase(this).getIsPinned(this);
    }

    public addWindow(definition: Glue42Workspaces.WorkspaceWindowDefinition): Promise<Glue42Workspaces.WorkspaceWindow> {
        return getBase(this).addWindow(this, definition, "column");
    }

    public async addGroup(definition?: Glue42Workspaces.BoxDefinition): Promise<Glue42Workspaces.Group> {
        if (definition?.type && definition.type !== "group") {
            throw new Error(`Expected a group definition, but received ${definition.type}`);
        }
        return getBase(this).addParent<Glue42Workspaces.Group>(this, "group", "column", definition);
    }

    public async addColumn(definition?: Glue42Workspaces.BoxDefinition): Promise<Column> {
        throw new Error("Adding columns as column children is not supported");
        return getBase(this).addParent<Column>(this, "column", "column", definition);
    }

    public async addRow(definition?: Glue42Workspaces.BoxDefinition): Promise<Glue42Workspaces.Row> {
        if (definition?.type && definition.type !== "row") {
            throw new Error(`Expected a row definition, but received ${definition.type}`);
        }
        return getBase(this).addParent<Glue42Workspaces.Row>(this, "row", "column", definition);
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

    public lock(config?: ColumnLockConfig | ((config: ColumnLockConfig) => ColumnLockConfig)): Promise<void> {
        let lockConfigResult = undefined;

        if (typeof config === "function") {
            const currentLockConfig = {
                allowDrop: this.allowDrop,
            };

            lockConfigResult = config(currentLockConfig);

        } else {
            lockConfigResult = config;
        }
        const verifiedConfig = lockConfigResult === undefined ? undefined : columnLockConfigDecoder.runWithException(lockConfigResult);
        return getBase(this).lockContainer(this, verifiedConfig);
    }

    public async setWidth(width: number): Promise<void> {
        number().where(n => n > 0, "The value should be positive").runWithException(width);
        return getBase(this).setWidth(this, width);
    }
}
