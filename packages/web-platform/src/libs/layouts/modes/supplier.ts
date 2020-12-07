/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Glue42Web } from "@glue42/web";
import { Glue42WebPlatform } from "../../../../platform";
import { InternalLayoutsConfig } from "../../../common/types";
import { SessionStorageController } from "../../../controllers/session";
import { LayoutEvent, LayoutModeExecutor } from "../types";
import asyncIntervals from "../../../shared/asyncIntervals";
import { Glue42Core } from "@glue42/core";
import logger from "../../../shared/logger";
import { glueLayoutDecoder } from "../../../shared/decoders";
import { PromiseWrap } from "../../../shared/promisePlus";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";
import { objEqual } from "../../../shared/utils";

export class SupplierLayoutsMode implements LayoutModeExecutor {
    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private supplier!: Glue42WebPlatform.Supplier<Array<Glue42Web.Layouts.Layout>>;
    private currentIntervalId: string | undefined;
    private pollMs!: number;
    private supplierTimeoutMs!: number;

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("layouts.supplier");
    }

    constructor(private readonly sessionController: SessionStorageController) { }

    public async setup(config: InternalLayoutsConfig): Promise<void> {
        this.logger?.trace("setting up supplier mode for layouts");

        if (!config.supplier) {
            throw new Error("Cannot set up a supplier mode for layouts, because there is not supplier provided");
        }

        if (!config.supplier.save || !config.supplier.delete) {
            throw new Error("Cannot set up a supplier mode for layouts, because the provided supplier is missing either a save or delete methods or both0");
        }

        this.supplier = config.supplier;

        this.pollMs = config.supplier.pollingInterval ?? 30000;
        this.supplierTimeoutMs = config.supplier.timeout ?? 10000;

        try {
            await this.nativeChangeDetection();
        } catch (error) {
            let errorMessage: string;

            if (error && error.stack && error.message) {
                errorMessage = error.message;
            } else {
                errorMessage = JSON.stringify(error);
            }

            this.logger?.trace(`Cannot initiate Layouts, because the provided supplier threw: ${errorMessage}`);

            throw new Error(`Cannot initiate Layouts, because the provided supplier threw: ${errorMessage}`);
        }

        if (this.supplier.pollingInterval) {
            this.logger?.trace("activating polling, because poll interval was specified");
            this.startInterval();
        }

        this.logger?.trace("supplier mode is completed, initial poll was successful.");
    }

    public onLayoutEvent(callback: (payload: { operation: LayoutEvent; data: Glue42Web.Layouts.Layout }) => void): UnsubscribeFunction {
        return this.registry.add("layoutEvent", callback);
    }

    public async getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {
        this.stopInterval();

        await this.doChangeDetection();

        this.startInterval();

        return this.sessionController.getLayoutSnapshot().layouts;
    }

    public async save(layouts: Glue42Web.Layouts.Layout[]): Promise<void> {
        if (!this.supplier.save) {
            throw new Error("Cannot proceed save to supplier request, because the saved supplier does not have a save method");
        }

        this.stopInterval();

        this.supplier.save(layouts);

        await this.doChangeDetection();

        this.startInterval();
    }

    public async delete(name: string, type: Glue42Web.Layouts.LayoutType): Promise<boolean> {
        if (!this.supplier.delete) {
            throw new Error("Cannot proceed delete to supplier request, because the saved supplier does not have a delete method");
        }

        this.stopInterval();

        const layoutToDelete = this.sessionController.getLayoutSnapshot().layouts.find((l) => l.name === name && l.type === type);

        if (!layoutToDelete) {
            return false;
        }

        await this.supplier.delete([layoutToDelete]);

        await this.doChangeDetection();

        const isDeleted = this.sessionController.getLayoutSnapshot().layouts.every((l) => l.name !== name && l.type !== type);

        this.startInterval();

        return isDeleted;
    }

    private doChangeDetection(): Promise<void> {
        return this.nativeChangeDetection()
            .catch((error) => {
                let errorMessage: string;

                if (error && error.stack && error.message) {
                    errorMessage = error.message;
                } else {
                    errorMessage = JSON.stringify(error);
                }
                this.logger?.trace(`Supplier change detection error during building snapshot: ${errorMessage}`);
            });
    }

    private async startInterval(): Promise<void> {
        this.currentIntervalId = asyncIntervals.set(this.doChangeDetection.bind(this), this.pollMs, false);
    }

    private stopInterval(): void {
        if (this.currentIntervalId) {
            asyncIntervals.clear(this.currentIntervalId);
            delete this.currentIntervalId;
        }
    }

    private async nativeChangeDetection(): Promise<void> {

        const supplierSnapshot = await PromiseWrap(this.supplier.fetch.bind(this), this.supplierTimeoutMs, "The provided supplied timed out when fetching new layouts");

        supplierSnapshot.forEach((layout) => glueLayoutDecoder.runWithException(layout));

        const snapshot = this.sessionController.getLayoutSnapshot();

        for (const layout of supplierSnapshot) {
            const layoutCurrentIdx = snapshot.layouts.findIndex((l) => l.name === layout.name && l.type === layout.type);

            if (layoutCurrentIdx < 0) {
                this.logger?.trace(`new layout: ${layout.name} - ${layout.type} detected, adding and announcing`);
                this.registry.execute("layoutEvent", { operation: "layoutAdded", data: layout });
                continue;
            }

            if (!objEqual(layout, snapshot.layouts[layoutCurrentIdx])) {
                this.logger?.trace(`change detected at layout ${layout.name} - ${layout.type}`);
                this.registry.execute("layoutEvent", { operation: "layoutChanged", data: layout });
            }

            snapshot.layouts.splice(layoutCurrentIdx, 1);
        }

        // everything that is left in the old snap here, means it is removed in the latest one
        snapshot.layouts.forEach((l) => {
            this.logger?.trace(`layout ${l.name} - ${l.type} missing, removing and announcing`);
            this.registry.execute("layoutEvent", { operation: "layoutRemoved", data: l });
        });

        this.sessionController.saveLayoutSnapshot({ layouts: supplierSnapshot });
        this.logger?.trace("poll completed, setting next");
    }

}
