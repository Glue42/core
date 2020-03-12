import { Glue42Core } from "../../../glue";
import { Protocol } from "../types";
import { ServerMethodInfo } from "./types";
import ServerSubscription from "./subscription";
import ServerBranch from "./branch";
import Server from "./server";

export default class ServerStream implements Glue42Core.AGM.Stream {
    public readonly name: string;

    constructor(private _protocol: Protocol, private _repoMethod: ServerMethodInfo, private _server: Server) {
        this.name = this._repoMethod.definition.name;
    }

    public branches(): Glue42Core.AGM.StreamBranch[];
    public branches(key: string): Glue42Core.AGM.StreamBranch | undefined;
    public branches(key?: string): Glue42Core.AGM.StreamBranch[] | Glue42Core.AGM.StreamBranch | undefined {
        const bList: string[] = this._protocol.server.getBranchList(this._repoMethod);
        if (key) {
            if (bList.indexOf(key) > -1) {
                return new ServerBranch(key, this._protocol, this._repoMethod);
            }
            return undefined;

        } else {
            return bList.map((branchKey: string) => {
                return new ServerBranch(branchKey, this._protocol, this._repoMethod);
            });
        }
    }

    public branch(key: string) {
        return this.branches(key);
    }

    public subscriptions(): Glue42Core.AGM.StreamSubscription[] {
        const subList = this._protocol.server.getSubscriptionList(this._repoMethod);
        return subList.map((sub) => {
            return new ServerSubscription(this._protocol, this._repoMethod, sub);
        });
    }

    public get definition(): Glue42Core.AGM.MethodDefinition {
        const def2 = this._repoMethod.definition;
        return {
            accepts: def2.accepts,
            description: def2.description,
            displayName: def2.displayName,
            name: def2.name,
            objectTypes: def2.objectTypes,
            returns: def2.returns,
            supportsStreaming: def2.supportsStreaming,
        };
    }

    public close() {
        this._protocol.server.closeAllSubscriptions(this._repoMethod);
        this._server.unregister(this._repoMethod.definition, true);
    }

    public push(data: object, branches: string[]) {
        if (typeof branches !== "string" && !Array.isArray(branches) && branches !== undefined) {
            throw new Error("invalid branches should be string or string array");
        }
        // TODO validate if is plain object
        if (typeof data !== "object") {
            throw new Error("Invalid arguments. Data must be an object.");
        }
        this._protocol.server.pushData(this._repoMethod, data, branches);
    }

    public updateRepoMethod(repoMethod: ServerMethodInfo) {
        this._repoMethod = repoMethod;
    }
}
