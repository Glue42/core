import { ContextName, ContextSubscriptionKey } from "./bridges/types";
import { Glue42Core } from "../../glue";

export interface ContextBridge {
    setPathSupported: any;

    all(): ContextName[];

    createContext(name: ContextName, data: any, options?: Glue42Core.Contexts.CreateOptions): Promise<string>;

    update(name: ContextName, delta: any): Promise<void>;

    set(name: ContextName, data: any): Promise<void>;

    get(name: ContextName): Promise<any>;

    setPath(name: ContextName, path: string, data: any): Promise<void>;

    setPaths(name: ContextName,  paths: Glue42Core.Contexts.PathValue[]): Promise<void>;

    subscribe(name: ContextName,
              callback: (data: any, delta: any, removed: string[], key: ContextSubscriptionKey, extraData?: any) => void): Promise<ContextSubscriptionKey>;

    unsubscribe(key: ContextSubscriptionKey): void;

    destroy(name: string): Promise<any>;
}
