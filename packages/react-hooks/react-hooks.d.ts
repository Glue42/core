import { ReactNode, Context, FC } from "react";
import { Glue42Web, Glue42WebFactoryFunction } from "@glue42/web";
import { Glue42 } from "@glue42/desktop";
import { Glue42WebPlatform, Glue42WebPlatformFactoryFunction } from "@glue42/web-platform";

export type Glue42ReactConfig = Glue42Web.Config | Glue42.Config;
export type Glue42ReactFactory = (config?: Glue42ReactConfig) => Promise<Glue42Web.API | Glue42.Glue>;
type Glue42DesktopFactory = (config?: Glue42.Config) => Promise<Glue42.Glue>;

export interface GlueProviderProps {
    children: ReactNode;
    settings: GlueInitSettings;
    fallback?: NonNullable<ReactNode> | null;
}

export interface GlueInitSettings {
    web?: {
        config?: Glue42Web.Config;
        factory?: Glue42WebFactoryFunction;
    };
    webPlatform?: {
        config?: Glue42WebPlatform.Config;
        factory?: Glue42WebPlatformFactoryFunction;
    };
    desktop?: {
        config?: Glue42.Config;
        factory?: Glue42DesktopFactory;
    };
}

export type UseGlueInitFunc = (
    settings: GlueInitSettings
) => Glue42Web.API | Glue42.Glue;

export declare const GlueContext: Context<Glue42Web.API | Glue42.Glue>;
export declare const GlueProvider: FC<GlueProviderProps>;
export declare const useGlue: <K = Glue42Web.API | Glue42.Glue, T = void>(
    cb: (glue: K, ...dependencies: any[]) => T | Promise<T>,
    dependencies?: any[]
) => T;
export declare const useGlueInit: UseGlueInitFunc;
