import { Glue42Web } from "@glue42/web";
import { Decoder, object, array, optional, anyJson, oneOf, constant, string } from "decoder-validate";
import { nonEmptyStringDecoder, windowOpenSettingsDecoder } from "../../shared/decoders";
import { IntentsOperationTypes, WrappedIntentFilter, WrappedIntents } from "./types";

export const intentsOperationTypesDecoder: Decoder<IntentsOperationTypes> = oneOf<"findIntent" | "getIntents" | "raiseIntent">(
    constant("findIntent"),
    constant("getIntents"),
    constant("raiseIntent")
);

const intentHandlerDecoder: Decoder<Glue42Web.Intents.IntentHandler> = object({
    applicationName: nonEmptyStringDecoder,
    applicationTitle: string(),
    applicationDescription: optional(string()),
    applicationIcon: optional(string()),
    type: oneOf<"app" | "instance">(constant("app"), constant("instance")),
    displayName: optional(string()),
    contextTypes: optional(array(nonEmptyStringDecoder)),
    instanceId: optional(string()),
    instanceTitle: optional(string())
});

const intentDecoder: Decoder<Glue42Web.Intents.Intent> = object({
    name: nonEmptyStringDecoder,
    handlers: array(intentHandlerDecoder)
});

const intentTargetDecoder: Decoder<"startNew" | "reuse" | { app?: string; instance?: string }> = oneOf<"startNew" | "reuse" | { app?: string; instance?: string }>(
    constant("startNew"),
    constant("reuse"),
    object({
        app: optional(nonEmptyStringDecoder),
        instance: optional(nonEmptyStringDecoder)
    })
);

const intentContextDecoder: Decoder<Glue42Web.Intents.IntentContext> = object({
    type: optional(nonEmptyStringDecoder),
    data: optional(object())
});

export const intentsDecoder: Decoder<Glue42Web.Intents.Intent[]> = array(intentDecoder);

export const wrappedIntentsDecoder: Decoder<WrappedIntents> = object({
    intents: intentsDecoder
});

export const wrappedIntentFilterDecoder: Decoder<WrappedIntentFilter> = object({
    filter: optional(object({
        name: optional(nonEmptyStringDecoder),
        contextType: optional(nonEmptyStringDecoder)
    }))
});

export const intentRequestDecoder: Decoder<Glue42Web.Intents.IntentRequest> = object({
    intent: nonEmptyStringDecoder,
    target: optional(intentTargetDecoder),
    context: optional(intentContextDecoder),
    options: optional(windowOpenSettingsDecoder)
});

export const intentResultDecoder: Decoder<Glue42Web.Intents.IntentResult> = object({
    request: intentRequestDecoder,
    handler: intentHandlerDecoder,
    result: anyJson()
});
