import { Glue42Core } from "../../../glue";
import Helpers from "../helpers";
import { Protocol } from "../types";

export class BaseMetric<T> implements Glue42Core.Metrics.Metric {
    public readonly path: string[] = [];
    public readonly name: string;
    public readonly description: string | undefined;

    public get repo() {
        return this.system?.repo;
    }

    public get id() { return `${this.system.path}/${name}`; }

    constructor(public definition: Glue42Core.Metrics.MetricDefinition, public system: Glue42Core.Metrics.System, protected transport: Protocol, public value: T, public type: number) {
        Helpers.validate(definition, system, transport);

        this.path = system.path.slice(0);
        this.path.push(system.name);

        this.name = definition.name;
        this.description = definition.description;

        transport.createMetric(this);
    }

    public update(newValue: T) {
        this.value = newValue;
        this.transport.updateMetric(this);
    }
}
