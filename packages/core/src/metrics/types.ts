import { Glue42Core } from "../../glue";
import { Identity } from "../connection/types";
import { Logger } from "../logger/logger";
import Connection from "../connection/connection";

export interface MetricsSettings {
    connection?: Connection;
    logger: Logger;
    /** If true will auto create click stream metrics in root system */
    clickStream?: boolean;
    settings?: object;
}

export interface Protocol {
    init(repo: Glue42Core.Metrics.Repository): void;
    createSystem(system: Glue42Core.Metrics.System): void;
    updateSystem(metric: Glue42Core.Metrics.System, state: Glue42Core.Metrics.State): void;
    createMetric(metric: Glue42Core.Metrics.Metric): void;
    updateMetric(metric: Glue42Core.Metrics.Metric): void;
}
