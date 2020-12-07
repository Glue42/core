/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Glue42Core } from "@glue42/core";
import { Glue42Web } from "@glue42/web";
import { BridgeOperation, InternalLayoutsConfig, InternalPlatformConfig, LibController } from "../../common/types";
import { GlueController } from "../../controllers/glue";
import logger from "../../shared/logger";
import { allLayoutsFullConfigDecoder, allLayoutsSummariesResultDecoder, getAllLayoutsConfigDecoder, layoutsOperationTypesDecoder, optionalSimpleLayoutResult, simpleLayoutConfigDecoder } from "./decoders";
import { LocalLayoutsMode } from "./modes/local";
import { RemoteLayoutsMode } from "./modes/remote";
import { SupplierLayoutsMode } from "./modes/supplier";
import { AllLayoutsFullConfig, AllLayoutsSummariesResult, GetAllLayoutsConfig, LayoutModeExecutor, LayoutsOperationTypes, OptionalSimpleLayoutResult, SimpleLayoutConfig } from "./types";

export class LayoutsController implements LibController {

    private started = false;
    private config!: InternalLayoutsConfig;

    private modesExecutors: { [key in "local" | "remote" | "supplier"]: LayoutModeExecutor } = {
        local: this.localMode,
        remote: this.removeMode,
        supplier: this.supplierMode
    };

    private operations: { [key in LayoutsOperationTypes]: BridgeOperation } = {
        get: { name: "get", dataDecoder: simpleLayoutConfigDecoder, resultDecoder: optionalSimpleLayoutResult, execute: this.handleGetLayout.bind(this) },
        getAll: { name: "getAll", dataDecoder: getAllLayoutsConfigDecoder, resultDecoder: allLayoutsSummariesResultDecoder, execute: this.handleGetAll.bind(this) },
        export: { name: "export", dataDecoder: getAllLayoutsConfigDecoder, resultDecoder: allLayoutsFullConfigDecoder, execute: this.handleExport.bind(this) },
        import: { name: "import", dataDecoder: allLayoutsFullConfigDecoder, execute: this.handleImport.bind(this) },
        remove: { name: "remove", dataDecoder: simpleLayoutConfigDecoder, execute: this.handleRemove.bind(this) }
    }

    constructor(
        private readonly glueController: GlueController,
        private readonly localMode: LocalLayoutsMode,
        private readonly removeMode: RemoteLayoutsMode,
        private readonly supplierMode: SupplierLayoutsMode
    ) { }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("layouts.controller");
    }

    public async start(config: InternalPlatformConfig): Promise<void> {
        this.config = config.layouts;

        this.logger?.trace(`initializing with mode: ${this.config.mode}`);

        await this.modesExecutors[this.config.mode].setup(config.layouts);

        this.modesExecutors[this.config.mode].onLayoutEvent((payload) => this.emitStreamData(payload.operation, payload.data));

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

    public handleClientUnloaded(windowId: string): void {
        this.logger?.trace(`skipping unload handling for ${windowId}, because this controller has does not care`);
        // this controller does not care about disconnected clients
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

    public async handleImport(config: AllLayoutsFullConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling mass import request for layout names: ${config.layouts.map((l) => l.name).join(", ")}`);

        await this.save(config.layouts);

        this.logger?.trace(`[${commandId}] mass import completed, responding to caller`);
    }

    public async handleRemove(config: SimpleLayoutConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling remove request for ${JSON.stringify(config)}`);

        const success = await this.delete(config.name, config.type);

        const operationMessage = success ? "has been removed" : "has not been removed, because it does not exist";

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

    private getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {
        return this.modesExecutors[this.config.mode].getAll(type);
    }

    private save(layouts: Glue42Web.Layouts.Layout[]): Promise<void> {
        return this.modesExecutors[this.config.mode].save(layouts);
    }

    private delete(name: string, type: Glue42Web.Layouts.LayoutType): Promise<boolean> {
        return this.modesExecutors[this.config.mode].delete(name, type);
    }
}