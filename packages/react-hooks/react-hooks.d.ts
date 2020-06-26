import { ReactNode, Context, FC } from "react";
import { Glue42Web } from "@glue42/web";
import { Glue42 } from "@glue42/desktop";

export type Glue42ReactConfig = Glue42Web.Config | Glue42.Config;
export type Glue42ReactFactory = (config?: Glue42ReactConfig) => Promise<Glue42Web.API | Glue42.Glue>;

export interface GlueProviderProps {
    children: ReactNode;
    glueFactory: Glue42ReactFactory;
    fallback?: NonNullable<ReactNode> | null;
    config?: Glue42ReactConfig;
}

export type useGlueInitProps = (
    config: Glue42ReactConfig,
    glueFactory: GlueProviderProps["glueFactory"]
) => Glue42Web.API | Glue42.Glue;

export declare const GlueContext: Context<Glue42Web.API | Glue42.Glue>;
export declare const GlueProvider: FC<GlueProviderProps>;
export declare const useGlue: <T = undefined>(
    cb: (glue: Glue42Web.API | Glue42.Glue, ...dependencies: any[]) => void | T | Promise<T>,
    dependencies?: any[]
) => T;
export declare const useGlueInit: useGlueInitProps;
