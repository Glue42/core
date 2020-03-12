import { Glue42Core} from "../../glue";

import * as msg from "./bridges/gw3/messages";

export const ContextMessageReplaySpec: Glue42Core.Connection.MessageReplaySpec = {
    get name(): string {
        return "context";
    },

    get types(): string[] {
        return [
            msg.GW_MESSAGE_CREATE_CONTEXT,
            msg.GW_MESSAGE_ACTIVITY_CREATED,
            msg.GW_MESSAGE_ACTIVITY_DESTROYED,
            msg.GW_MESSAGE_CONTEXT_CREATED,
            msg.GW_MESSAGE_CONTEXT_ADDED,
            msg.GW_MESSAGE_SUBSCRIBE_CONTEXT,
            msg.GW_MESSAGE_SUBSCRIBED_CONTEXT,
            msg.GW_MESSAGE_UNSUBSCRIBE_CONTEXT,
            msg.GW_MESSAGE_DESTROY_CONTEXT,
            msg.GW_MESSAGE_CONTEXT_DESTROYED,
            msg.GW_MESSAGE_UPDATE_CONTEXT,
            msg.GW_MESSAGE_CONTEXT_UPDATED,
            msg.GW_MESSAGE_JOINED_ACTIVITY
        ];
    }
};
