/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "@glue42/core";
import { IoC } from "../shared/ioc";
import { LibController } from "../shared/types";
import { Glue42Web } from "../../web";
import { GlueBridge } from "../communication/bridge";
import { UnsubscribeFunction } from "callback-registry";
import { intentsOperationTypesDecoder, raiseRequestDecoder, findFilterDecoder, addIntentListenerIntentDecoder } from "../shared/decoders";
import { operations, WrappedIntentFilter, WrappedIntents } from "./protocol";

export class IntentsController implements LibController {
    private bridge!: GlueBridge;
    private logger!: Glue42Web.Logger.API;
    private interop!: Glue42Core.AGM.API;
    private myIntents = new Set<string>();

    private readonly GlueWebIntentsPrefix = "Tick42.FDC3.Intents.";

    public async start(coreGlue: Glue42Core.GlueCore, ioc: IoC): Promise<void> {
        this.logger = coreGlue.logger.subLogger("intents.controller.web");

        this.logger.trace("starting the web intents controller");

        this.bridge = ioc.bridge;

        this.interop = coreGlue.interop;

        const api = this.toApi();

        this.logger.trace("no need for platform registration, attaching the intents property to glue and returning");

        (coreGlue as Glue42Web.API).intents = api;
    }

    public async handleBridgeMessage(args: any): Promise<void> {
        const operationName = intentsOperationTypesDecoder.runWithException(args.operation);

        const operation = operations[operationName];

        if (!operation.execute) {
            return;
        }

        let operationData: any = args.data;

        if (operation.dataDecoder) {
            operationData = operation.dataDecoder.runWithException(args.data);
        }

        return await operation.execute(operationData);
    }

    private toApi(): Glue42Web.Intents.API {
        const api: Glue42Web.Intents.API = {
            raise: this.raise.bind(this),
            all: this.all.bind(this),
            addIntentListener: this.addIntentListener.bind(this),
            find: this.find.bind(this)
        };

        return Object.freeze(api);
    }

    private async raise(request: string | Glue42Web.Intents.IntentRequest): Promise<Glue42Web.Intents.IntentResult> {
        const requestObj = raiseRequestDecoder.runWithException(request);

        let data: Glue42Web.Intents.IntentRequest;

        if (typeof requestObj === "string") {
            data = {
                intent: requestObj
            };
        } else {
            data = requestObj;
        }

        const result = await this.bridge.send<Glue42Web.Intents.IntentRequest, Glue42Web.Intents.IntentResult>("intents", operations.raiseIntent, data);

        return result;
    }

    private async all(): Promise<Glue42Web.Intents.Intent[]> {
        const result = await this.bridge.send<void, WrappedIntents>("intents", operations.getIntents, undefined);

        return result.intents;
    }

    private addIntentListener(intent: string | Glue42Web.Intents.AddIntentListenerRequest, handler: (context: Glue42Web.Intents.IntentContext) => any): { unsubscribe: UnsubscribeFunction } {
        addIntentListenerIntentDecoder.runWithException(intent);
        if (typeof handler !== "function") {
            throw new Error("Cannot add intent listener, because the provided handler is not a function!");
        }

        let subscribed = true;

        // `addIntentListener()` is sync.
        const intentName = typeof intent === "string" ? intent : intent.intent;
        const methodName = `${this.GlueWebIntentsPrefix}${intentName}`;

        const alreadyRegistered = this.myIntents.has(intentName);
        if (alreadyRegistered) {
            throw new Error(`Intent listener for intent ${intentName} already registered!`);
        }
        this.myIntents.add(intentName);

        const result = {
            unsubscribe: (): void => {
                subscribed = false;
                try {
                    this.interop.unregister(methodName);
                    this.myIntents.delete(intentName);
                } catch (error) {
                    this.logger.trace(`Unsubscribed intent listener, but ${methodName} unregistration failed!`);
                }
            }
        };
        const flags = typeof intent === "string" ? { intent } : intent;

        this.interop.register({ name: methodName, flags }, (args: Glue42Web.Intents.IntentContext) => {
            if (subscribed) {
                return handler(args);
            }
        });

        return result;
    }

    private async find(intentFilter?: string | Glue42Web.Intents.IntentFilter): Promise<Glue42Web.Intents.Intent[]> {
        let data: WrappedIntentFilter | undefined = undefined;

        if (typeof intentFilter !== "undefined") {
            const intentFilterObj = findFilterDecoder.runWithException(intentFilter);

            if (typeof intentFilterObj === "string") {
                data = {
                    filter: {
                        name: intentFilterObj
                    }
                };
            } else if (typeof intentFilterObj === "object") {
                data = {
                    filter: intentFilterObj
                };
            }
        }

        const result = await this.bridge.send<WrappedIntentFilter | undefined, WrappedIntents>("intents", operations.findIntent, data);

        return result.intents;
    }
}
