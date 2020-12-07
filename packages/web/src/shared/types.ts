/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { Decoder } from "decoder-validate";
import { IoC } from "./ioc";

export interface LibController {
    start(coreGlue: Glue42Core.GlueCore, ioc: IoC): Promise<void>;
    handleBridgeMessage(args: any): Promise<void>;
}

export type LibDomains = "windows" | "appManager" | "layouts" | "notifications";

export interface BridgeOperation {
    name: string;
    dataDecoder?: Decoder<any>;
    resultDecoder?: Decoder<any>;
    execute?: (args: any) => Promise<any>;
}
