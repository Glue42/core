import { Glue42Core } from "../../glue";
import { Protocol } from "./types";

export default {
    validate: (definition: Glue42Core.Metrics.MetricDefinition, parent: Glue42Core.Metrics.System, transport: Protocol) => {
        if (definition === null || typeof definition !== "object") {
            throw new Error("Missing definition");
        }
        if (parent === null || typeof parent !== "object") {
            throw new Error("Missing parent");
        }
        if (transport === null || typeof transport !== "object") {
            throw new Error("Missing transport");
        }
    },
};
