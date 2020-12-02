import { Glue42Web } from "../../../packages/web/web.d";
import { Gtf } from "./types";

export class GtfIntents implements Gtf.Intents {
    private intentsMethodPrefix = "Tick42.FDC3.Intents.";

    constructor(private readonly glue: Glue42Web.API) {
    }

    public flattenIntentsToIntentHandlers(intents: Glue42Web.Intents.Intent[]): (Glue42Web.Intents.IntentHandler & { intentName: string; })[] {
        return intents.flatMap((intent) => intent.handlers.map((handler) => ({ ...handler, intentName: intent.name })));
    }

    public waitForIntentListenerAdded(intent: string): Promise<void> {
        return new Promise((resolve) => {
            const unsub = this.glue.interop.methodAdded((addedMethod) => {
                if (addedMethod.name === `${this.intentsMethodPrefix}${intent}`) {
                    unsub();
                    resolve();
                }
            });
        });
    }

    public waitForIntentListenerRemoved(intent: string): Promise<void> {
        return new Promise((resolve) => {
            const unsub = this.glue.interop.methodRemoved((removedMethod) => {
                if (removedMethod.name === `${this.intentsMethodPrefix}${intent}`) {
                    unsub();
                    resolve();
                }
            });
        });
    }
}
