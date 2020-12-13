/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Glue42Core } from "@glue42/core";
import { Glue42Web } from "@glue42/web";
import { BridgeOperation, InternalLayoutsConfig, InternalPlatformConfig, LibController } from "../../common/types";
import { GlueController } from "../../controllers/glue";
import { SessionStorageController } from "../../controllers/session";
import logger from "../../shared/logger";
import { objEqual } from "../../shared/utils";
import { allLayoutsFullConfigDecoder, allLayoutsSummariesResultDecoder, getAllLayoutsConfigDecoder, layoutsImportConfigDecoder, layoutsOperationTypesDecoder, optionalSimpleLayoutResult, simpleLayoutConfigDecoder } from "./decoders";
import { IdbStore } from "./idbStore";
import { AllLayoutsFullConfig, AllLayoutsSummariesResult, GetAllLayoutsConfig, LayoutsImportConfig, LayoutsOperationTypes, OptionalSimpleLayoutResult, SimpleLayoutConfig } from "./types";

export class LayoutsController implements LibController {

    private started = false;
    private config!: InternalLayoutsConfig;

    private operations: { [key in LayoutsOperationTypes]: BridgeOperation } = {
        get: { name: "get", dataDecoder: simpleLayoutConfigDecoder, resultDecoder: optionalSimpleLayoutResult, execute: this.handleGetLayout.bind(this) },
        getAll: { name: "getAll", dataDecoder: getAllLayoutsConfigDecoder, resultDecoder: allLayoutsSummariesResultDecoder, execute: this.handleGetAll.bind(this) },
        export: { name: "export", dataDecoder: getAllLayoutsConfigDecoder, resultDecoder: allLayoutsFullConfigDecoder, execute: this.handleExport.bind(this) },
        import: { name: "import", dataDecoder: layoutsImportConfigDecoder, execute: this.handleImport.bind(this) },
        remove: { name: "remove", dataDecoder: simpleLayoutConfigDecoder, execute: this.handleRemove.bind(this) }
    }

    constructor(
        private readonly glueController: GlueController,
        private readonly idbStore: IdbStore,
        private readonly sessionStore: SessionStorageController
    ) { }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("layouts.controller");
    }

    public async start(config: InternalPlatformConfig): Promise<void> {
        this.config = config.layouts;

        this.logger?.trace(`initializing with mode: ${this.config.mode}`);

        if (this.config.local && this.config.local.length) {
            await this.mergeImport(this.config.local);
        }

        this.started = true;

        this.logger?.trace("initialization is completed");
    }

    public async handleControl(args: any): Promise<void> {
        if (!this.started) {
            new Error("Cannot handle this windows control message, because the controller has not been started");
        }

        const layoutsData = args.data;

        const commandId = args.commandId;

        const operationValidation = layoutsOperationTypesDecoder.run(args.operation);

        if (!operationValidation.ok) {
            throw new Error(`This layouts request cannot be completed, because the operation name did not pass validation: ${JSON.stringify(operationValidation.error)}`);
        }

        const operationName: LayoutsOperationTypes = operationValidation.result;

        const incomingValidation = this.operations[operationName].dataDecoder?.run(layoutsData);

        if (incomingValidation && !incomingValidation.ok) {
            throw new Error(`Layouts request for ${operationName} rejected, because the provided arguments did not pass the validation: ${JSON.stringify(incomingValidation.error)}`);
        }

        this.logger?.debug(`[${commandId}] ${operationName} command is valid with data: ${JSON.stringify(layoutsData)}`);

        const result = await this.operations[operationName].execute(layoutsData, commandId);

        const resultValidation = this.operations[operationName].resultDecoder?.run(result);

        if (resultValidation && !resultValidation.ok) {
            throw new Error(`Layouts request for ${operationName} could not be completed, because the operation result did not pass the validation: ${JSON.stringify(resultValidation.error)}`);
        }


        this.logger?.trace(`[${commandId}] ${operationName} command was executed successfully`);

        return result;
    }

    public async handleGetAll(config: GetAllLayoutsConfig, commandId: string): Promise<AllLayoutsSummariesResult> {
        this.logger?.trace(`[${commandId}] handling get all layout summaries request for type: ${config.type}`);

        const allLayouts = await this.getAll(config.type);

        const summaries = allLayouts.map<Glue42Web.Layouts.LayoutSummary>((layout) => {
            return {
                name: layout.name,
                type: layout.type,
                context: layout.context,
                metadata: layout.metadata
            };
        });

        this.logger?.trace(`[${commandId}] all summaries have been compiled, responding to caller`);

        return { summaries };
    }

    public async handleExport(config: GetAllLayoutsConfig, commandId: string): Promise<AllLayoutsFullConfig> {
        this.logger?.trace(`[${commandId}] handling get all layout full request for type: ${config.type}`);

        const layouts = await this.getAll(config.type);

        this.logger?.trace(`[${commandId}] full layouts collection have been compiled, responding to caller`);

        return { layouts };
    }

    public async handleImport(config: LayoutsImportConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling mass import request for layout names: ${config.layouts.map((l) => l.name).join(", ")}`);

        if (config.mode === "merge") {
            this.logger?.trace(`[${commandId}] importing the layouts in merge mode`);
            await this.mergeImport(config.layouts);
        } else {
            this.logger?.trace(`[${commandId}] importing the layouts in replace mode`);
            await this.replaceImport(config.layouts);
        }

        this.logger?.trace(`[${commandId}] mass import completed, responding to caller`);
    }

    public async handleRemove(config: SimpleLayoutConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling remove request for ${JSON.stringify(config)}`);

        const layout = await (await this.getAll(config.type)).find((l) => l.name === config.name && l.type === config.type);

        if (layout) {
            await this.delete(config.name, config.type);
            this.emitStreamData("layoutRemoved", layout);
        }

        const operationMessage = layout ? "has been removed" : "has not been removed, because it does not exist";

        this.logger?.trace(`[${commandId}] ${config.name} of type ${config.type} ${operationMessage}`);
    }

    public async handleGetLayout(config: SimpleLayoutConfig, commandId: string): Promise<OptionalSimpleLayoutResult> {
        this.logger?.trace(`[${commandId}] handling get layout request for name: ${config.name} and type: ${config.type}`);

        const allLayouts = await this.getAll(config.type);

        const layout = allLayouts.find((l) => l.name === config.name);

        this.logger?.trace(`[${commandId}] request completed, responding to the caller`);

        return { layout };
    }

    private emitStreamData(operation: "layoutChanged" | "layoutAdded" | "layoutRemoved", data: any): void {
        this.logger?.trace(`sending notification of event: ${operation} with data: ${JSON.stringify(data)}`);

        this.glueController.pushSystemMessage("layouts", operation, data);
    }

    public async mergeImport(layouts: Glue42Web.Layouts.Layout[]): Promise<void> {
        const currentLayouts = await this.getAll("Workspace");
        const pendingEvents: Array<{ operation: "layoutChanged" | "layoutAdded" | "layoutRemoved"; layout: Glue42Web.Layouts.Layout }> = [];

        for (const layout of layouts) {
            const defCurrentIdx = currentLayouts.findIndex((app) => app.name === layout.name);

            if (defCurrentIdx > -1 && !objEqual(layout, currentLayouts[defCurrentIdx])) {
                this.logger?.trace(`change detected at layout ${layout.name}`);
                pendingEvents.push({ operation: "layoutChanged", layout });

                currentLayouts[defCurrentIdx] = layout;

                continue;
            }

            if (defCurrentIdx < 0) {
                this.logger?.trace(`new layout: ${layout.name} detected, adding and announcing`);
                pendingEvents.push({ operation: "layoutAdded", layout });
                currentLayouts.push(layout);
            }
        }

        await this.cleanSave(currentLayouts);
        pendingEvents.forEach((pending) => this.emitStreamData(pending.operation, pending.layout));
    }

    public async replaceImport(layouts: Glue42Web.Layouts.Layout[]): Promise<void> {
        const currentLayouts = await this.getAll("Workspace");
        const pendingEvents: Array<{ operation: "layoutChanged" | "layoutAdded" | "layoutRemoved"; layout: Glue42Web.Layouts.Layout }> = [];

        for (const layout of layouts) {
            const defCurrentIdx = currentLayouts.findIndex((app) => app.name === layout.name);

            if (defCurrentIdx < 0) {
                this.logger?.trace(`new layout: ${layout.name} detected, adding and announcing`);
                pendingEvents.push({ operation: "layoutAdded", layout });
                continue;
            }

            if (!objEqual(layout, currentLayouts[defCurrentIdx])) {
                this.logger?.trace(`change detected at layout ${layout.name}`);
                pendingEvents.push({ operation: "layoutChanged", layout });
            }

            currentLayouts.splice(defCurrentIdx, 1);
        }

        // everything that is left in the old snap here, means it is removed in the latest one
        currentLayouts.forEach((layout) => {
            this.logger?.trace(`layout ${layout.name} missing, removing and announcing`);
            pendingEvents.push({ operation: "layoutRemoved", layout });
        });

        await this.cleanSave(layouts);
        pendingEvents.forEach((pending) => this.emitStreamData(pending.operation, pending.layout));
    }

    private async getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {
        let all: Glue42Web.Layouts.Layout[];

        if (this.config.mode === "idb") {
            all = await this.idbStore.getAll(type);
        } else {
            all = this.sessionStore.getLayoutSnapshot().layouts;
        }

        return all;
    }

    private async cleanSave(layouts: Glue42Web.Layouts.Layout[]): Promise<void> {
        if (this.config.mode === "idb") {
            await this.idbStore.clear("Workspace");

            for (const layout of layouts) {
                await this.idbStore.store(layout, layout.type);
            }
            return;
        }

        this.sessionStore.saveLayoutSnapshot({ layouts });
    }

    private async delete(name: string, type: Glue42Web.Layouts.LayoutType): Promise<void> {
        if (this.config.mode === "idb") {
            await this.idbStore.delete(name, type);
            return;
        }

        const all = this.sessionStore.getLayoutSnapshot().layouts;

        const idxToRemove = all.findIndex((l) => l.name === name && l.type);

        if (idxToRemove > -1) {
            all.splice(idxToRemove, 1);
        }

        this.sessionStore.saveLayoutSnapshot({ layouts: all });
    }
}
