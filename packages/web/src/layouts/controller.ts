/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { IoC } from "../shared/ioc";
import { LibController } from "../shared/types";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";
import { Glue42Web } from "../../web";
import { GlueBridge } from "../communication/bridge";
import { glueLayoutDecoder, importModeDecoder, layoutsOperationTypesDecoder, layoutTypeDecoder, newLayoutOptionsDecoder, nonEmptyStringDecoder, restoreOptionsDecoder } from "../shared/decoders";
import { AllLayoutsFullConfig, AllLayoutsSummariesResult, GetAllLayoutsConfig, LayoutParseResult, LayoutsImportConfig, operations, OptionalSimpleLayoutResult, SimpleLayoutConfig } from "./protocol";

export class LayoutsController implements LibController {
    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private bridge!: GlueBridge;
    private logger!: Glue42Web.Logger.API;

    public async start(coreGlue: Glue42Core.GlueCore, ioc: IoC): Promise<void> {
        this.logger = coreGlue.logger.subLogger("layouts.controller.web");

        this.logger.trace("starting the web layouts controller");

        this.bridge = ioc.bridge;

        this.addOperationsExecutors();

        const api = this.toApi();

        this.logger.trace("no need for platform registration, attaching the layouts property to glue and returning");

        (coreGlue as Glue42Web.API).layouts = api;
    }

    public async handleBridgeMessage(args: any): Promise<void> {
        const operationName = layoutsOperationTypesDecoder.runWithException(args.operation);

        const operation = operations[operationName];

        if (!operation.execute) {
            return;
        }

        let operationData: any = args.data;

        if (operation.dataDecoder) {
            operationData = operation.dataDecoder.runWithException(args.data);
        }

        return await operation.execute(operationData);
    }

    private toApi(): Glue42Web.Layouts.API {
        const api: Glue42Web.Layouts.API = {
            get: this.get.bind(this),
            getAll: this.getAll.bind(this),
            export: this.export.bind(this),
            import: this.import.bind(this),
            save: this.save.bind(this),
            restore: this.restore.bind(this),
            remove: this.remove.bind(this),
            onAdded: this.onAdded.bind(this),
            onChanged: this.onChanged.bind(this),
            onRemoved: this.onRemoved.bind(this)
        };

        return Object.freeze(api);
    }

    private addOperationsExecutors(): void {
        operations.layoutAdded.execute = this.handleOnAdded.bind(this);
        operations.layoutChanged.execute = this.handleOnChanged.bind(this);
        operations.layoutRemoved.execute = this.handleOnRemoved.bind(this);
    }

    private async get(name: string, type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout | undefined> {
        nonEmptyStringDecoder.runWithException(name);
        layoutTypeDecoder.runWithException(type);

        const result = await this.bridge.send<SimpleLayoutConfig, OptionalSimpleLayoutResult>("layouts", operations.get, { name, type });

        return result.layout;
    }

    private async getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.LayoutSummary[]> {
        layoutTypeDecoder.runWithException(type);

        const result = await this.bridge.send<GetAllLayoutsConfig, AllLayoutsSummariesResult>("layouts", operations.getAll, { type });

        return result.summaries;
    }

    private async export(type?: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {
        if (type) {
            layoutTypeDecoder.runWithException(type);
        }

        // supports only workspaces for the moment
        const result = await this.bridge.send<GetAllLayoutsConfig, AllLayoutsFullConfig>("layouts", operations.export, { type: "Workspace" });

        return result.layouts;
    }

    private async import(layouts: Glue42Web.Layouts.Layout[], mode: "replace" | "merge" = "replace"): Promise<void> {
        importModeDecoder.runWithException(mode);

        if (!Array.isArray(layouts)) {
            throw new Error("Import must be called with an array of layouts");
        }

        const parseResult = layouts.reduce<LayoutParseResult>((soFar, layout) => {

            const decodeResult = glueLayoutDecoder.run(layout);

            if (decodeResult.ok) {
                soFar.valid.push(layout);
            } else {
                this.logger.warn(`A layout with name: ${layout.name} was not imported, because of error: ${JSON.stringify(decodeResult.error)}`);
            }

            return soFar;

        }, { valid: [] });

        await this.bridge.send<LayoutsImportConfig, void>("layouts", operations.import, { layouts: parseResult.valid, mode });
    }

    private async save(layout: Glue42Web.Layouts.NewLayoutOptions): Promise<Glue42Web.Layouts.Layout> {
        newLayoutOptionsDecoder.runWithException(layout);

        throw new Error("Save is not supported in Core at the moment");
    }

    private async restore(options: Glue42Web.Layouts.RestoreOptions): Promise<void> {
        restoreOptionsDecoder.runWithException(options);

        throw new Error("Restore is not supported in Core at the moment");
    }

    private async remove(type: Glue42Web.Layouts.LayoutType, name: string): Promise<void> {
        layoutTypeDecoder.runWithException(type);
        nonEmptyStringDecoder.runWithException(name);

        await this.bridge.send<SimpleLayoutConfig, void>("layouts", operations.remove, { type, name });
    }

    private onAdded(callback: (layout: Glue42Web.Layouts.Layout) => void): UnsubscribeFunction {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.export().then((layouts) => layouts.forEach((layout) => callback(layout))).catch(() => { });
        return this.registry.add(operations.layoutAdded.name, callback);
    }

    private onChanged(callback: (layout: Glue42Web.Layouts.Layout) => void): UnsubscribeFunction {
        return this.registry.add(operations.layoutChanged.name, callback);
    }

    private onRemoved(callback: (layout: Glue42Web.Layouts.Layout) => void): UnsubscribeFunction {
        return this.registry.add(operations.layoutRemoved.name, callback);
    }

    private async handleOnAdded(layout: Glue42Web.Layouts.Layout): Promise<void> {
        this.registry.execute(operations.layoutAdded.name, layout);
    }

    private async handleOnChanged(layout: Glue42Web.Layouts.Layout): Promise<void> {
        this.registry.execute(operations.layoutChanged.name, layout);
    }

    private async handleOnRemoved(layout: Glue42Web.Layouts.Layout): Promise<void> {
        this.registry.execute(operations.layoutRemoved.name, layout);
    }
}