import { Glue42Core } from "../../../glue";
import { Protocol } from "../types";
import { BaseMetric } from "./base";
import metricTypes from "../const/metric-types";

export class TimestampMetric extends BaseMetric<Date> implements Glue42Core.Metrics.TimestampMetric {
    constructor(definition: Glue42Core.Metrics.MetricDefinition, system: Glue42Core.Metrics.System, transport: Protocol, value: Date) {
        super(definition, system, transport, value, metricTypes.TIMESTAMP);
    }

    public now(): void {
        this.update(new Date());
    }
}
