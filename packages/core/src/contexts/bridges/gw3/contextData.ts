import { Glue42Core } from "../../../../glue";

export class GW3ContextData {
    // invariants:
    // - at least one of { isAnnounced, hasCallbacks() } must be truthy
    //     (so no state (0) instances are kept)
    // - name is defined
    // - isAnnounced cannot go from true to false
    // - !isAnnounced => activityId === undefined
    // - !isAnnounced => contextId === undefined
    // - isAnnounced => contextId !== undefined
    // - !isAnnounced => context == {}
    // - !isAnnounced => !joinedActivity
    // - activityId === undefined => !joinedActivity
    // - joinedActivity => activityId !== undefined !
    // - activityId != undefined => name === activityId
    // - !isAnnounced => sentExplicitSubscription === false
    // - !hasCallbacks => sentExplicitSubscription === false
    // - context is defaulted to {}, not null or undefined

    // the name of this context; it's what our clients use to (un)subscribe
    // to it; for an activity context it's the same as activityId
    public name: string;

    // the id of the context as assigned by the GW; only known after it has
    // been announced
    public contextId: string | undefined;

    // since GW3 only sends a snapshot on subscription/activity creation,
    // we need to keep track of the context state ourselves, for the sake
    // of any additional subsequent subscribers (i.e. so we can give them
    // the context snapshot so far)
    public context: {};

    // has the context been announced by the GW?
    public isAnnounced: boolean;

    public joinedActivity: boolean | undefined;

    // callbacks to invoke on context update
    public updateCallbacks: { [index: number]: (data: any, delta: any, removed: string[], key: Glue42Core.Contexts.ContextSubscriptionKey, extraData?: any) => void } = {};

    // iff activity context, the id of the activity to which it belongs
    public activityId: string | undefined;

    public sentExplicitSubscription: boolean | undefined;

    constructor(contextId: string | undefined, name: string, isAnnounced: boolean, activityId?: string) {
        this.contextId = contextId;
        this.name = name;
        this.isAnnounced = isAnnounced;
        this.activityId = activityId;
        this.context = {};
    }

    public hasCallbacks() {
        return Object.keys(this.updateCallbacks).length > 0;
    }

    // for reference only
    // should never return 0
    public getState(): number {
        if (this.isAnnounced && this.hasCallbacks()) {
            return 3;
        }

        if (this.isAnnounced) {
            return 2;
        }

        if (this.hasCallbacks()) {
            return 1;
        }

        return 0;
    }
}
