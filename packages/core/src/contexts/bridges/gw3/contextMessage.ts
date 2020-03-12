// union of interesting fields
export interface ContextMessage {
    domain: string;
    type: string;
    peer_id: string;
    updater_id: string;

    activity_id: any;
    creator_id: string;
    context_id: string;
    name: string;

    context_snapshot: any;
    delta: any;
    data: any;
}
