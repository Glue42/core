import { Glue42Core } from "../../../glue";
import { Protocol } from "../types";
import { BaseMetric } from "./base";
import metricTypes from "../const/metric-types";

export class ObjectMetric extends BaseMetric<object> implements Glue42Core.Metrics.ObjectMetric {

    constructor(definition: Glue42Core.Metrics.MetricDefinition, system: Glue42Core.Metrics.System, transport: Protocol, value: object) {
        super(definition, system, transport, value, metricTypes.OBJECT);
    }

    public update(newValue: object) {
        this.mergeValues(newValue);
        this.transport.updateMetric(this);
    }

    private mergeValues(values: any) {
        return Object.keys(this.value).forEach((k) => {
            if (typeof values[k] !== "undefined") {
                (this.value as any)[k] = values[k];
            }
        });
    }
}
