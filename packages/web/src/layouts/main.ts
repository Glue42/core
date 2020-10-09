import { UnsubscribeFunction } from "callback-registry";
import { Glue42Web } from "../../web";
import { LayoutsController } from "./controller";
import { layoutTypeDecoder, newLayoutOptionsDecoder, restoreOptionsDecoder, layoutDecoder } from "./validation/";
import { nonEmptyStringDecoder } from "./validation/simple";

export class Layouts implements Glue42Web.Layouts.API {

    constructor(private readonly controller: LayoutsController) { }

    public ready(): Promise<void> {
        return this.controller.ready();
    }

    public getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.LayoutSummary[]> {
        layoutTypeDecoder.runWithException(type);

        return this.controller.getAll(type);
    }

    public get(name: string, type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout | undefined> {
        nonEmptyStringDecoder.runWithException(name);
        layoutTypeDecoder.runWithException(type);

        return this.controller.get(name, type);
    }

    public async export(layoutType?: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {
        if (layoutType) {
            layoutTypeDecoder.runWithException(layoutType);
        }

        return this.controller.export(layoutType);
    }

    public import(layouts: Glue42Web.Layouts.Layout[]): Promise<void> {
        layouts.forEach((layout) => layoutDecoder.runWithException(layout));

        return this.controller.import(layouts);
    }

    public save(layout: Glue42Web.Layouts.NewLayoutOptions): Promise<Glue42Web.Layouts.Layout> {
        newLayoutOptionsDecoder.runWithException(layout);

        return this.controller.save(layout);
    }

    public restore(options: Glue42Web.Layouts.RestoreOptions): Promise<void> {
        restoreOptionsDecoder.runWithException(options);

        return this.controller.restore(options);
    }

    public remove(type: Glue42Web.Layouts.LayoutType, name: string): Promise<void> {
        nonEmptyStringDecoder.runWithException(name);
        layoutTypeDecoder.runWithException(type);

        return this.controller.remove(type, name);
    }

    public onAdded(callback: (layout: Glue42Web.Layouts.Layout) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("The provided callback must be of type 'function'");
        }

        return this.controller.onLayoutAdded(callback);
    }

    public onChanged(callback: (layout: Glue42Web.Layouts.Layout) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("The provided callback must be of type 'function'");
        }

        return this.controller.onLayoutChanged(callback);
    }

    public onRemoved(callback: (layout: Glue42Web.Layouts.Layout) => void): UnsubscribeFunction {
        if (typeof callback !== "function") {
            throw new Error("The provided callback must be of type 'function'");
        }

        return this.controller.onLayoutRemoved(callback);
    }

}
