export interface IntentInfo {
    name: string;
    displayName?: string;
    contexts: string[];
}

export interface AppDefinition {
    name: string;
    title: string;
    intents: IntentInfo[];
}
