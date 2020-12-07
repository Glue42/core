import { Glue42Core } from "@glue42/core";
import { Glue42Web } from "@glue42/web";
import { IdbStore } from "./idbStore";
import { LayoutEvent, LayoutModeExecutor } from "../types";
import logger from "../../../shared/logger";
import { InternalLayoutsConfig } from "../../../common/types";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";

export class LocalLayoutsMode implements LayoutModeExecutor {
    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private config!: InternalLayoutsConfig;

    constructor(
        private readonly idbStore: IdbStore
    ) { }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("layouts.local");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public onLayoutEvent(callback: (payload: { operation: LayoutEvent; data: Glue42Web.Layouts.Layout }) => void): UnsubscribeFunction {
        return this.registry.add("layoutEvent", callback);
    }

    public async setup(config: InternalLayoutsConfig): Promise<void> {
        this.config = config;

        const localLayouts = config.local;

        await Promise.all(localLayouts.map((layout) => this.idbStore.store(layout, layout.type)));

        this.logger?.trace("All initial layouts have been imported in the local store");
    }

    public async getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {
        const allLayouts = await this.idbStore.getAll(type);

        this.logger?.trace(`fetched all layouts with type: ${type} from the local store`);

        return allLayouts;
    }

    public async save(layouts: Glue42Web.Layouts.Layout[]): Promise<void> {
        await Promise.all(layouts.map(async (layout) => {
            this.logger?.trace(`starting the save and announce procedure for layout: ${layout.name} of type: ${layout.type}`);

            const allLayouts = await this.getAll(layout.type);

            const existingLayout = allLayouts.find((l) => l.name === layout.name && l.type === layout.type);

            if (existingLayout && JSON.stringify(layout) === JSON.stringify(existingLayout)) {
                this.logger?.trace(`skipping local save, because no change was detected in layout ${layout.name} of type ${layout.type}`);
                return;
            }

            const layoutEvent = existingLayout ? "layoutChanged" : "layoutAdded";

            await this.idbStore.store(layout, layout.type);

            this.registry.execute("layoutEvent", { operation: layoutEvent, data: layout });

            this.logger?.trace(`layout: ${layout.name} of type: ${layout.type} has been successfully saved in the local store and announced as ${layoutEvent}`);
        }));
    }

    public async delete(name: string, type: Glue42Web.Layouts.LayoutType): Promise<boolean> {
        const layoutToRemove = (await this.getAll(type)).find((layout) => layout.name === name && layout.type === type);

        if (!layoutToRemove) {
            return false;
        }

        await this.idbStore.delete(name, type);

        this.registry.execute("layoutEvent", { operation: "layoutRemoved", data: layoutToRemove });

        this.logger?.trace(`layout with name ${name} and type ${type} has been successfully removed from the local store and announced`);

        return true;
    }

}