import { ReactNode, Context, FC } from "react";
import { Glue42Web, GlueWebFactoryFunction } from "@glue42/web";
import { Glue42Core } from "@glue42/core";

export interface GlueProviderProps {
    children: ReactNode;
    fallback?: NonNullable<ReactNode> | null;
    config?: Glue42Web.Config;
    glueFactory?: GlueWebFactoryFunction;
}

export type useGlueInitProps = (
    config: Glue42Web.Config,
    glueFactory: GlueProviderProps["glueFactory"]
) => Glue42Core.GlueCore;

export declare const GlueContext: Context<Glue42Core.GlueCore>;
export declare const GlueProvider: FC<GlueProviderProps>;
export declare const useGlue: <T = undefined>(
    cb: (glue: Glue42Core.GlueCore, ...dependencies: any[]) => void | T | Promise<T>,
    dependencies?: any[]
) => T;
export declare const useGlueInit: useGlueInitProps;
