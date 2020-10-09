import { Decoder, object, optional, array, string, number, anyJson, constant, oneOf } from "decoder-validate";
import { FDC3ApplicationConfig, Glue42CoreApplicationConfig, AppImage, Icon, Intent } from "../../glue.config";
import { Glue42Web } from "../../../web";

const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");

const fdc3AppImageDecoder: Decoder<AppImage> = object({
    url: optional(nonEmptyStringDecoder)
});

const fdc3IconDecoder: Decoder<Icon> = object({
    icon: optional(nonEmptyStringDecoder)
});

const fdc3IntentDecoder: Decoder<Intent> = object({
    name: nonEmptyStringDecoder,
    displayName: optional(string()),
    contexts: optional(array(string())),
    customConfig: optional(object())
});

const glue42CoreCreateOptionsDecoder: Decoder<Glue42Web.Windows.CreateOptions> = object({
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

export const fdc3ApplicationConfigDecoder: Decoder<FDC3ApplicationConfig> = object({
    name: nonEmptyStringDecoder,
    title: optional(string()),
    version: optional(string()),

    appId: nonEmptyStringDecoder,
    manifest: nonEmptyStringDecoder,
    manifestType: nonEmptyStringDecoder,
    tooltip: optional(string()),
    description: optional(string()),
    contactEmail: optional(string()),
    supportEmail: optional(string()),
    publisher: optional(string()),
    images: optional(array(fdc3AppImageDecoder)),
    icons: optional(array(fdc3IconDecoder)),
    customConfig: optional(object()),
    intents: optional(array(fdc3IntentDecoder))
});

export const glue42CoreApplicationConfigDecoder: Decoder<Glue42CoreApplicationConfig> = object({
    name: nonEmptyStringDecoder,
    title: optional(string()),
    version: optional(string()),

    details: glue42CoreCreateOptionsDecoder,
    customProperties: optional(object()),
    icon: optional(string()),
    caption: optional(string())
});
