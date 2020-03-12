import { Glue42Core } from "../../../../glue";
import { Protocol, MetricsSettings } from "../../types";
import { composeMsgForRootStateMetric, getMetricValueByType, normalizeMetricName, serializeMetric } from "./serializer";
import Connection from "../../../connection/connection";

export default function (connection: Connection, config: MetricsSettings): Protocol {
    if (!connection || typeof connection !== "object") {
        throw new Error("Connection is required parameter");
    }

    let joinPromise: Promise<any>;

    let session: Glue42Core.Connection.GW3DomainSession;

    const init = (repo: Glue42Core.Metrics.Repository): void => {
        let resolveReadyPromise: (() => void) | undefined;
        joinPromise = new Promise((resolve) => {
            resolveReadyPromise = resolve;
        });

        session = connection.domain("metrics");

        session.onJoined((reconnect) => {
            if (!reconnect && resolveReadyPromise) {
                resolveReadyPromise();
                resolveReadyPromise = undefined;
            }

            // Creating root state metric
            const rootStateMetric: any = {
                name: "/State",
                type: "object",
                composite: {
                    Description: {
                        type: "string",
                        description: "",
                    },
                    Value: {
                        type: "number",
                        description: "",
                    },
                },
                description: "System state",
                context: {},
            };

            const defineRootMetricsMsg = {
                type: "define",
                metrics: [rootStateMetric],
            };

            session.send(defineRootMetricsMsg);

            if (reconnect) {
                replayRepo(repo);
            }

        });
        session.join();
    };

    const replayRepo = (repo: Glue42Core.Metrics.Repository) => {
        replaySystem(repo.root);
    };

    const replaySystem = (system: Glue42Core.Metrics.System) => {
        // replay system
        createSystem(system);

        // replay all metrics in the system
        system.metrics.forEach((m) => {
            createMetric(m);
        });

        // replay all sub-systems
        system.subSystems.forEach((ss) => {
            replaySystem(ss);
        });
    };

    const createSystem = (system: Glue42Core.Metrics.System): void => {
        if (system.parent === undefined) {
            return;
        }

        joinPromise.then(() => {
            const metric = {
                name: normalizeMetricName(system.path.join("/") + "/" + system.name + "/State"),
                type: "object",
                composite: {
                    Description: {
                        type: "string",
                        description: "",
                    },
                    Value: {
                        type: "number",
                        description: "",
                    },
                },
                description: "System state",
                context: {},
            };

            const createMetricsMsg = {
                type: "define",
                metrics: [metric],
            };

            session.send(createMetricsMsg);
        });
    };

    const updateSystem = (system: Glue42Core.Metrics.System, state: Glue42Core.Metrics.State): void => {
        joinPromise.then(() => {

            const shadowedUpdateMetric = {
                type: "publish",
                values: [{
                    name: normalizeMetricName(system.path.join("/") + "/" + system.name + "/State"),
                    value: {
                        Description: state.description,
                        Value: state.state,
                    },
                    timestamp: Date.now(),
                }],
            };

            session.send(shadowedUpdateMetric);

            const stateObj = composeMsgForRootStateMetric(system);
            const rootMetric = {
                type: "publish",
                peer_id: connection.peerId,
                values: [{
                    name: "/State",
                    value: {
                        Description: stateObj.description,
                        Value: stateObj.value,
                    },
                    timestamp: Date.now(),
                }],
            };

            session.send(rootMetric);

        });
    };

    const createMetric = (metric: Glue42Core.Metrics.Metric): void => {
        joinPromise.then(() => {
            const m = serializeMetric(metric);

            const createMetricsMsg = {
                type: "define",
                metrics: [m],
            };

            session.send(createMetricsMsg);
            if (typeof metric.value !== "undefined") {
                updateMetric(metric);
            }
        });
    };

    const updateMetric = (metric: Glue42Core.Metrics.Metric): void => {
        const metricClone: Glue42Core.Metrics.Metric = { ...metric };
        if (typeof metric.value === "object" && metric.value !== null) {
            metricClone.value = { ...metric.value };
        }

        joinPromise.then(() => {
            const value = getMetricValueByType(metricClone);
            const publishMetricsMsg = {
                type: "publish",
                values: [{
                    name: normalizeMetricName(metricClone.path.join("/") + "/" + metricClone.name),
                    value,
                    timestamp: Date.now(),
                }],
            };
            session.send(publishMetricsMsg);
        });
    };

    return {
        init,
        createSystem,
        updateSystem,
        createMetric,
        updateMetric,
    };
}
