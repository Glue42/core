import { Glue42Web } from "../../../packages/web/web.d";
import { Glue42WebPlatform } from "../../../packages/web-platform/platform.d";

export interface ControlArgs {
    operation: string;
    params: any;
}

export interface StreamFacade {
    close: () => Promise<void>;
    push: (data: object, branches?: string | string[]) => Promise<void>;
    name: string;
}

export interface SubscriptionFacade {
    onData: (callback: (data: any) => void) => void;
}

export interface CancellablePromise<T> extends Promise<T> {
    cancel: () => void;
}

export namespace Gtf {
    export interface Agm {
        getMethodName(): string;

        waitForMethodAdded(methodDefinition: string | Glue42Web.Interop.MethodDefinition, targetAgmInstance?: string, timeoutMilliseconds?: number): Promise<void>;

        waitForMethodRemoved(methodDefinition: string | Glue42Web.Interop.MethodDefinition, targetAgmInstance?: string, timeoutMilliseconds?: number): Promise<void>;

        unregisterAllMyNonSystemMethods(): Promise<void>;

        unregisterMyStreams(myStreams: Glue42Web.Interop.Stream[]): Promise<void>;

        compareServers(actualServer: Glue42Web.Interop.Instance, expectedServer: Glue42Web.Interop.Instance): boolean;
    }

    export interface App {
        agm: {
            instance: Glue42Web.Interop.Instance,
            register: (methodDefinition: string | Glue42Web.Interop.MethodDefinition) => Promise<void>;
            unregister: (methodDefinition: string | Glue42Web.Interop.MethodDefinition) => Promise<void>;
            registerAsync: (methodDefinition: string | Glue42Web.Interop.MethodDefinition, callback: (args: any, caller: Glue42Web.Interop.Instance, successCallback: (args?: any) => void, errorCallback: (error?: string | object) => void) => void) => Promise<void>;
            createStream: (methodDefinition: string | Glue42Web.Interop.MethodDefinition) => Promise<StreamFacade>;
            subscribe: (methodDefinition: string | Glue42Web.Interop.MethodDefinition, parameters?: Glue42Web.Interop.SubscriptionParams) => Promise<SubscriptionFacade>;
            unsubscribe: (methodDefinition: string | Glue42Web.Interop.MethodDefinition) => Promise<void>;
            waitForMethodAdded: (methodDefinition: string | Glue42Web.Interop.MethodDefinition, targetAgmInstance?: string) => Promise<void>;
        };

        intents: {
            addIntentListener: (intent: string | Glue42Web.Intents.AddIntentListenerRequest) => Promise<ReturnType<Glue42Web.Intents.API['addIntentListener']>>;
        };

        stop(): Promise<void>;

        setContext(ctxName: string, ctxData: any): Promise<void>;

        updateContext(ctxName: string, ctxData: any): Promise<void>;

        getContext(ctxName: string): Promise<any>;

        getAllContextNames(): Promise<string[]>;
    }

    export interface Core {
        waitFor(invocations: number, callback: () => any): () => void;

        waitForFetch(): Promise<void>;

        getWindowName(prefix?: string): string;

        getChannelsConfigDefinitions(): Glue42WebPlatform.Channels.ChannelDefinition[];

        getChannelNames(): Promise<string[]>;

        createApp(appName?: string): Promise<App>;

        post(url: string, body: string): Promise<Response>;
    }

    export interface Channels {
        resetContexts(): Promise<void[]>;
    }

    export interface AppManager {
        getLocalApplications(): (Glue42Web.AppManager.Definition | Glue42WebPlatform.Applications.FDC3Definition)[];

        stopAllOtherInstances(): Promise<void>;
    }

    export interface Intents {
        flattenIntentsToIntentHandlers(intents: Glue42Web.Intents.Intent[]): (Glue42Web.Intents.IntentHandler & { intentName: string })[];

        waitForIntentListenerAdded(intent: string): Promise<void>;

        waitForIntentListenerRemoved(intent: string): Promise<void>;
    }

    export interface Connection {
        disconnectGlues(gluesToDisconnect: Glue42Web.API[]): Promise<void>;
    }

    export interface Logger {
        patchLogMessages(): void;

        register(): Promise<void>;
    }

    export interface Windows {
        getWindowName(): string;

        compareWindows(actualWindow: Glue42Web.Windows.WebWindow, expectedWindow: Glue42Web.Windows.WebWindow): Promise<boolean>;

        closeAllOtherWindows(): Promise<void>;

        getPlatformWindow(): Promise<Glue42Web.Windows.WebWindow>;

        resetTitles(): Promise<void>;

        resetWindowContexts(): Promise<void>;

        resetWindowDimensions(): Promise<void>;
    }
}
