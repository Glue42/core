import { Glue42Core } from "../../../../glue";
import MetricTypes from "../../const/metric-types";

function getMetricTypeByValue(metric: Glue42Core.Metrics.Metric): string {

    if (metric.type === MetricTypes.TIMESTAMP) {
        return "timestamp";
    } else if (metric.type === MetricTypes.NUMBER) {
        return "number";
    } else if (metric.type === MetricTypes.STRING) {
        return "string";
    } else if (metric.type === MetricTypes.OBJECT) {
        return "object";
    }

    return "unknown";
}

function getTypeByValue(value: any): string {

    if (value.constructor === Date) {
        return "timestamp";
    } else if (typeof value === "number") {
        return "number";
    } else if (typeof value === "string") {
        return "string";
    } else if (typeof value === "object") {
        return "object";
    } else {
        return "string";
    }
}

function serializeMetric(metric: Glue42Core.Metrics.Metric): any {

    const serializedMetrics: any = {};
    const type = getMetricTypeByValue(metric);
    if (type === "object") {
        const values = Object.keys(metric.value).reduce((memo: any, key: any) => {
            const innerType = getTypeByValue(metric.value[key]);
            if (innerType === "object") {
                const composite = defineNestedComposite(metric.value[key]);
                memo[key] = {
                    type: "object",
                    description: "",
                    context: {},
                    composite,
                };
            } else {
                memo[key] = {
                    type: innerType,
                    description: "",
                    context: {},
                };
            }

            return memo;
        }, {});

        serializedMetrics.composite = values;
    }

    serializedMetrics.name = normalizeMetricName(metric.path.join("/") + "/" + metric.name);
    serializedMetrics.type = type;
    serializedMetrics.description = metric.description;
    serializedMetrics.context = {};

    return serializedMetrics;
}

function defineNestedComposite(values: any): any {
    return Object.keys(values).reduce((memo: any, key: any) => {
        const type = getTypeByValue(values[key]);
        if (type === "object") {
            memo[key] = {
                type: "object",
                description: "",
                context: {},
                composite: defineNestedComposite(values[key]),
            };
        } else {
            memo[key] = {
                type,
                description: "",
                context: {},
            };
        }

        return memo;
    }, {});
}

function normalizeMetricName(name: string): string {
    if (typeof name !== "undefined" && name.length > 0 && name[0] !== "/") {
        return "/" + name;
    } else {
        return name;
    }
}

function getMetricValueByType(metric: Glue42Core.Metrics.Metric) {
    const type: string = getMetricTypeByValue(metric);
    if (type === "timestamp") {
        return Date.now();
    } else {
        return publishNestedComposite(metric.value);
    }
}

function publishNestedComposite(values: any) {
    if (typeof values !== "object") {
        return values;
    }
    return Object.keys(values).reduce((memo: any, key: any) => {
        const value = values[key];
        if (typeof value === "object" && value.constructor !== Date) {
            memo[key] = publishNestedComposite(value);
        } else if (value.constructor === Date) {
            memo[key] = new Date(value).getTime();
        } else if (value.constructor === Boolean) {
            memo[key] = value.toString();
        } else {
            memo[key] = value;
        }

        return memo;
    }, {});
}

function flatten(arr: any[]): Glue42Core.Metrics.SystemStateInfo[] {
    return arr.reduce((flat: Glue42Core.Metrics.SystemStateInfo[], toFlatten: Glue42Core.Metrics.SystemStateInfo | Glue42Core.Metrics.SystemStateInfo[]): Glue42Core.Metrics.SystemStateInfo[] => {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

function getHighestState(arr: Glue42Core.Metrics.SystemStateInfo[]): Glue42Core.Metrics.SystemStateInfo {
    return arr.sort((a, b) => {
        if (!a.state) { return 1; }
        if (!b.state) { return -1; }

        return b.state - a.state;
    })[0];
}

function aggregateDescription(arr: Glue42Core.Metrics.SystemStateInfo[]): string {
    let msg = "";
    arr.forEach((m: any, idx: number, a: any[]) => {
        const path = m.path.join(".");
        if (idx === a.length - 1) {
            msg += path + "." + m.name + ": " + m.description;
        } else {
            msg += path + "." + m.name + ": " + m.description + ",";
        }
    });
    if (msg.length > 100) {
        return msg.slice(0, 100) + "...";
    } else {
        return msg;
    }
}

function composeMsgForRootStateMetric(system: Glue42Core.Metrics.System): any {
    const aggregatedState: Glue42Core.Metrics.SystemStateInfo[] = system.root.getAggregateState();
    const merged = flatten(aggregatedState);
    const highestState = getHighestState(merged);
    const aggregateDesc = aggregateDescription(merged);
    return {
        description: aggregateDesc,
        value: highestState.state,
    };
}

export { normalizeMetricName, serializeMetric, getMetricValueByType, composeMsgForRootStateMetric };
