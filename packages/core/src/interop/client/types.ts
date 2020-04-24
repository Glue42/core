import { Glue42Core } from "../../../glue";
import { InstanceWrapper } from "../instance";

/** Server info used on client side */
export interface ServerInfo {
    id: string;
    instance: Glue42Core.Interop.Instance;
    wrapper: InstanceWrapper;
    methods: { [name: string]: ClientMethodInfo };
}

/** Method info used on client side */
export interface ClientMethodInfo extends Glue42Core.Interop.Method {
    identifier: string;
    gatewayId: string;
}

/** Methods per server */
export interface ServerMethodsPair {
    server: ServerInfo;
    methods: ClientMethodInfo[];
}
