import { Glue42Core } from "../../glue";
import gw3 from "./protocols/gw3/gw3";
import { Repository } from "./repository";
import { Protocol, MetricsSettings } from "./types";
import { NullProtocol } from "./protocols/null/null";

export default (options: MetricsSettings): Glue42Core.Metrics.System => {

    let protocol: Protocol;
    if (!options.connection || typeof options.connection !== "object") {
        protocol = new NullProtocol();
    } else {
        protocol = gw3(options.connection, options);
    }

    const repo = new Repository(options, protocol);
    return repo.root;
};

export function addFAVSupport(system: Glue42Core.Metrics.System): Glue42Core.Metrics.API {
    // Creating subsystem for reporting and feature metric
    const reportingSystem: Glue42Core.Metrics.System = system.subSystem("reporting");
    const def = {
        name: "features"
    };

    let featureMetric: Glue42Core.Metrics.ObjectMetric;

    const featureMetricFunc = (name: string, action: string, payload: string) => {
        if (typeof name === "undefined" || name === "") {
            throw new Error("name is mandatory");
        } else if (typeof action === "undefined" || action === "") {
            throw new Error("action is mandatory");
        } else if (typeof payload === "undefined" || payload === "") {
            throw new Error("payload is mandatory");
        }

        if (!featureMetric) {
            featureMetric = reportingSystem.objectMetric(def, { name, action, payload });
        } else {
            featureMetric.update({
                name,
                action,
                payload
            });
        }
    };
    (system as any).featureMetric = featureMetricFunc;
    return system as Glue42Core.Metrics.API;
}
