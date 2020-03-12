import { Glue42Core } from "../../../glue";
import { Protocol } from "../types";
import { BaseMetric } from "./base";
import metricTypes from "../const/metric-types";

export class StringMetric extends BaseMetric<string> implements Glue42Core.Metrics.StringMetric {
    constructor(definition: Glue42Core.Metrics.MetricDefinition, system: Glue42Core.Metrics.System, transport: Protocol, value: string) {
        super(definition, system, transport, value, metricTypes.STRING);
    }
}
