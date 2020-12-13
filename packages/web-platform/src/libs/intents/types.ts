import { Glue42Web } from "@glue42/web";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type IntentsOperationTypes = "findIntent" | "getIntents" | "raiseIntent";

export interface IntentInfo {
    name: string;
    displayName?: string;
    contexts: string[];
}

export interface AppDefinitionWithIntents {
    name: string;
    title: string;
    caption?: string;
    icon?: string;
    intents: IntentInfo[];
}

export interface IntentStore {
    [name: string]: Glue42Web.Intents.IntentHandler[];
}

export interface WrappedIntentFilter {
    filter?: Glue42Web.Intents.IntentFilter;
}

export interface WrappedIntents {
    intents: Glue42Web.Intents.Intent[];
}
