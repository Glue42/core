import { Base } from "./base/base";
import { Glue42Workspaces } from "../../workspaces.d";
import { rowLockConfigDecoder } from "../shared/decoders";
import { RowLockConfig } from "../types/temp";
import { number } from "decoder-validate";

interface PrivateData {
    base: Base;
}

const privateData = new WeakMap<Row, PrivateData>();

const getBase = (model: Row): Base => {
    return privateData.get(model).base;
};

export class Row implements Glue42Workspaces.Row {

    constructor(base: Base) {
        privateData.set(this, { base });
    }

    public get type(): "row" {
        return "row";
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
        return getBase(this).addWindow(this, definition, "row");
    }

    public async addGroup(definition?: Glue42Workspaces.BoxDefinition): Promise<Glue42Workspaces.Group> {
        if (definition?.type && definition.type !== "group") {
            throw new Error(`Expected a group definition, but received ${definition.type}`);
        }
        return getBase(this).addParent<Glue42Workspaces.Group>(this, "group", "row", definition);
    }

    public async addColumn(definition?: Glue42Workspaces.BoxDefinition): Promise<Glue42Workspaces.Column> {
        if (definition?.type && definition.type !== "column") {
            throw new Error(`Expected a column definition, but received ${definition.type}`);
        }
        return getBase(this).addParent<Glue42Workspaces.Column>(this, "column", "row", definition);
    }

    public async addRow(): Promise<Row> {
        throw new Error("Adding rows as row children is not supported");
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

    public lock(config?: RowLockConfig | ((config: RowLockConfig) => RowLockConfig)): Promise<void> {
        let lockConfigResult = undefined;

        if (typeof config === "function") {
            const currentLockConfig = {
                allowDrop: this.allowDrop,
            };

            lockConfigResult = config(currentLockConfig);
        } else {
            lockConfigResult = config;
        }

        const verifiedConfig = lockConfigResult === undefined ? undefined : rowLockConfigDecoder.runWithException(lockConfigResult);

        return getBase(this).lockContainer(this, verifiedConfig);
    }

    public async setHeight(height: number): Promise<void> {
        number().where(n => n > 0, "The value should be positive").runWithException(height);
        return getBase(this).setHeight(this, height);
    }

}
