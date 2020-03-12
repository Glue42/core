import { Protocol } from "../../types";
import { Glue42Core } from "../../../../glue";

export class NullProtocol implements Protocol {
    public init(repo: Glue42Core.Metrics.Repository): void {
        // do nothing
    }

    public createSystem(system: Glue42Core.Metrics.System): void {
        // do nothing
    }

    public updateSystem(metric: Glue42Core.Metrics.System, state: Glue42Core.Metrics.State): void {
        // do nothing
    }

    public createMetric(metric: Glue42Core.Metrics.Metric): void {
        // do nothing
    }

    public updateMetric(metric: Glue42Core.Metrics.Metric): void {
        // do nothing
    }
}
