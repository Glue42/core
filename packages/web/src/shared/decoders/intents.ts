import { Decoder, object, optional, array, string, number, anyJson, constant, oneOf } from "decoder-validate";
import { Glue42Web } from "../../../web";

const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");

const glue42CoreCreateOptionsDecoder: Decoder<Glue42Web.AppManager.ApplicationStartOptions> = object({
    url: optional(nonEmptyStringDecoder),
    top: optional(number()),
    left: optional(number()),
    width: optional(number()),
    height: optional(number()),
    context: optional(anyJson()),
    relativeTo: optional(nonEmptyStringDecoder),
    relativeDirection: optional(oneOf<"top" | "left" | "right" | "bottom">(
        constant("top"),
        constant("left"),
        constant("right"),
        constant("bottom")
    ))
});

const glue42CoreIntentContextDecoder: Decoder<Glue42Web.Intents.IntentContext> = object({
    type: optional(nonEmptyStringDecoder),
    data: optional(object())
});

export const glue42CoreIntentFilterDecoder: Decoder<string | Glue42Web.Intents.IntentFilter> = oneOf<string | Glue42Web.Intents.IntentFilter>(
    object({
        name: optional(string()),
        contextType: optional(string())
    }),
    nonEmptyStringDecoder
);

export const glue42CoreIntentDefinitionDecoder: Decoder<string | { intent: string, contextTypes?: string[], displayName?: string }> = oneOf<string | { intent: string, contextTypes?: string[], displayName?: string }>(
    object({
        intent: nonEmptyStringDecoder,
        contextTypes: optional(array(string())),
        displayName: optional(string())
    }),
    nonEmptyStringDecoder
);

export const glue42CoreIntentRequestDecoder: Decoder<string | Glue42Web.Intents.IntentRequest> = oneOf<string | Glue42Web.Intents.IntentRequest>(
    object({
        intent: nonEmptyStringDecoder,
        target: optional(oneOf<"startNew" | "reuse" | { app?: string; instance?: string }>(
            constant("startNew"),
            constant("reuse"),
            object({
                app: optional(string()),
                instance: optional(string())
            })
        )),
        context: optional(glue42CoreIntentContextDecoder),
        options: optional(glue42CoreCreateOptionsDecoder)
    }),
    nonEmptyStringDecoder
);
