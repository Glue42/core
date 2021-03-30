import { CallbackRegistry, UnsubscribeFunction } from "callback-registry";
import { SubscriptionConfig, ActiveSubscription, WorkspaceEventType, WorkspaceEventAction, WorkspacePayload, WorkspaceEventScope } from "../types/subscription";
import { STREAMS } from "./constants";
import { OPERATIONS } from "./constants";
import { eventTypeDecoder, streamRequestArgumentsDecoder, workspaceEventActionDecoder } from "../shared/decoders";
import { Glue42Workspaces } from "../../workspaces";
import { InteropTransport } from "./interop-transport";

export class Bridge {

    private readonly activeSubscriptions: ActiveSubscription[] = [];

    constructor(
        private readonly transport: InteropTransport,
        private readonly registry: CallbackRegistry
    ) { }

    public async createCoreEventSubscription(): Promise<void> {
        await this.transport.coreSubscriptionReady(this.handleCoreEvent.bind(this));
    }

    public handleCoreSubscription(config: SubscriptionConfig): UnsubscribeFunction {
        const registryKey = `${config.eventType}-${config.action}`;
        const scope = config.scope;
        const scopeId = config.scopeId;

        return this.registry.add(registryKey, (args) => {
            const scopeConfig = {
                type: scope,
                id: scopeId
            };

            const receivedIds = {
                frame: args.frameSummary?.id || args.windowSummary?.config.frameId,
                workspace: args.workspaceSummary?.id || args.windowSummary?.config.workspaceId,
                window: args.windowSummary?.config.windowId
            };

            const shouldInvokeCallback = this.checkScopeMatch(scopeConfig, receivedIds);

            if (!shouldInvokeCallback) {
                return;
            }

            config.callback(args);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async send<T>(operationName: string, operationArgs?: any): Promise<T> {

        const operationDefinition = Object.values(OPERATIONS).find((operation) => operation.name === operationName);

        if (!operationDefinition) {
            throw new Error(`Cannot find definition for operation name: ${operationName}`);
        }

        if (operationDefinition.argsDecoder) {
            try {
                operationDefinition.argsDecoder.runWithException(operationArgs);
            } catch (error) {
                throw new Error(`Unexpected internal outgoing validation error: ${error.message}, for input: ${JSON.stringify(error.input)}, for operation ${operationName}`);
            }
        }

        let operationResult;

        try {
            const operationResultRaw = await this.transport.transmitControl(operationDefinition.name, operationArgs);
            operationResult = operationDefinition.resultDecoder.runWithException(operationResultRaw);
        } catch (error) {
            if (error.kind) {
                throw new Error(`Unexpected internal incoming validation error: ${error.message}, for input: ${JSON.stringify(error.input)}, for operation ${operationName}`);
            }
            throw new Error(error.message);
        }

        return operationResult;
    }

    public async subscribe(config: SubscriptionConfig): Promise<Glue42Workspaces.Unsubscribe> {
        let activeSub = this.getActiveSubscription(config);
        const registryKey = this.getRegistryKey(config);

        if (!activeSub) {
            const stream = STREAMS[config.eventType];
            const gdSub = await this.transport.subscribe(stream.name, this.getBranchKey(config), config.eventType);

            gdSub.onData((streamData) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = streamData.data as { action: string; payload: any };

                // important to decode without exception, because we do not want to throw an exception here
                const requestedArgumentsResult = streamRequestArgumentsDecoder.run(streamData.requestArguments);
                const actionResult = workspaceEventActionDecoder.run(data.action);

                if (!requestedArgumentsResult.ok || !actionResult.ok) {
                    return;
                }

                const streamType = requestedArgumentsResult.result.type;
                const branch = requestedArgumentsResult.result.branch;

                const validatedPayload = STREAMS[streamType].payloadDecoder.run(data.payload);

                if (!validatedPayload.ok) {
                    return;
                }

                const keyToExecute = `${streamType}-${branch}-${actionResult.result}`;
                this.registry.execute(keyToExecute, validatedPayload.result);
            });

            activeSub = {
                streamType: config.eventType,
                level: config.scope,
                levelId: config.scopeId,
                callbacksCount: 0,
                gdSub
            };

            this.activeSubscriptions.push(activeSub);
        }

        const unsubscribe = this.registry.add(registryKey, config.callback);

        ++activeSub.callbacksCount;

        return (): void => {
            unsubscribe();

            --activeSub.callbacksCount;

            if (activeSub.callbacksCount === 0) {
                activeSub.gdSub.close();
                this.activeSubscriptions.splice(this.activeSubscriptions.indexOf(activeSub), 1);
            }
        };
    }

    private checkScopeMatch(scope: { type: WorkspaceEventScope; id?: string }, receivedIds: { frame: string; workspace: string; window: string }): boolean {

        if (scope.type === "global") {
            return true;
        }

        if (scope.type === "frame" && scope.id === receivedIds.frame) {
            return true;
        }

        if (scope.type === "workspace" && scope.id === receivedIds.workspace) {
            return true;
        }

        if (scope.type === "window" && scope.id === receivedIds.window) {
            return true;
        }

        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handleCoreEvent(args: any): void {
        const data = args.data;
        try {
            const verifiedAction: WorkspaceEventAction = workspaceEventActionDecoder.runWithException(data.action);
            const verifiedType: WorkspaceEventType = eventTypeDecoder.runWithException(data.type);
            const verifiedPayload: WorkspacePayload = STREAMS[verifiedType].payloadDecoder.runWithException(data.payload);

            const registryKey = `${verifiedType}-${verifiedAction}`;

            this.registry.execute(registryKey, verifiedPayload);
        } catch (error) {
            console.warn(`Cannot handle event with data ${JSON.stringify(data)}, because of validation error: ${error.message}`);
        }
    }

    private getBranchKey(config: SubscriptionConfig): string {
        return config.scope === "global" ? config.scope : `${config.scope}_${config.scopeId}`;
    }

    private getRegistryKey(config: SubscriptionConfig): string {
        return `${config.eventType}-${this.getBranchKey(config)}-${config.action}`;
    }

    private getActiveSubscription(config: SubscriptionConfig): ActiveSubscription {
        return this.activeSubscriptions
            .find((activeSub) => activeSub.streamType === config.eventType &&
                activeSub.level === config.scope &&
                activeSub.levelId === config.scopeId
            );
    }
}
