import { anyDecoder } from "../shared/decoders";
import { BridgeOperation } from "../shared/types";

export type SystemOperationTypes = "getEnvironment" | "getBase";

export const operations: { [key in SystemOperationTypes]: BridgeOperation } = {
    getEnvironment: { name: "getEnvironment", resultDecoder: anyDecoder },
    getBase: { name: "getBase", resultDecoder: anyDecoder }
};
