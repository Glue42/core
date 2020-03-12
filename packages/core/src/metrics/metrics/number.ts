import { Glue42Core } from "../../../glue";
import { Protocol } from "../types";
import { BaseMetric } from "./base";
import metricTypes from "../const/metric-types";

export class NumberMetric extends BaseMetric<number> implements Glue42Core.Metrics.NumberMetric {

    constructor(definition: Glue42Core.Metrics.MetricDefinition, system: Glue42Core.Metrics.System, transport: Protocol, value: number) {
        super(definition, system, transport, value, metricTypes.NUMBER);
    }

    public incrementBy(num: number): void {
        this.update(this.value + num);
    }

    public increment(): void {
        this.incrementBy(1);
    }

    public decrement(): void {
        this.incrementBy(-1);
    }

    public decrementBy(num: number): void {
        this.incrementBy(num * -1);
    }
}
