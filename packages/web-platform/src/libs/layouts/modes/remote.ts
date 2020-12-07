/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Glue42Web } from "@glue42/web";
import { UnsubscribeFunction } from "callback-registry";
import { InternalLayoutsConfig } from "../../../common/types";
import { LayoutEvent, LayoutModeExecutor } from "../types";

export class RemoteLayoutsMode implements LayoutModeExecutor {
    public setup(config: InternalLayoutsConfig): Promise<void> {
        throw new Error("Remote layouts mode is not available in Glue42 Core at the moment");
    }

    public onLayoutEvent(callback: (payload: { operation: LayoutEvent; data: any }) => void): UnsubscribeFunction {
        throw new Error("Remote layouts mode is not available in Glue42 Core at the moment");
    }

    public getAll(type: Glue42Web.Layouts.LayoutType): Promise<Glue42Web.Layouts.Layout[]> {
        throw new Error("Remote layouts mode is not available in Glue42 Core at the moment");
    }

    public save(layouts: Glue42Web.Layouts.Layout[]): Promise<void> {
        throw new Error("Remote layouts mode is not available in Glue42 Core at the moment");
    }

    public delete(name: string, type: Glue42Web.Layouts.LayoutType): Promise<boolean> {
        throw new Error("Remote layouts mode is not available in Glue42 Core at the moment");
    }


}