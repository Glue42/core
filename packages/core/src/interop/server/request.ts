import { Protocol } from "../types";
import { Glue42Core } from "../../../glue";
import { ServerMethodInfo, RequestContext } from "./types";

export default class Request implements Glue42Core.AGM.SubscriptionRequest {
    public arguments: object;
    public instance: Glue42Core.AGM.Instance;

    constructor(private protocol: Protocol, private repoMethod: ServerMethodInfo, private requestContext: RequestContext) {
        this.arguments = requestContext.arguments;
        this.instance = requestContext.instance;
    }

    public accept() {
        this.protocol.server.acceptRequestOnBranch(this.requestContext, this.repoMethod, "");
    }

    public acceptOnBranch(branch: string) {
        this.protocol.server.acceptRequestOnBranch(this.requestContext, this.repoMethod, branch);
    }

    public reject(reason: string) {
        this.protocol.server.rejectRequest(this.requestContext, this.repoMethod, reason);
    }
}
