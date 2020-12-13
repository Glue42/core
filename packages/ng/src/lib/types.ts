import { Glue42Web, Glue42WebFactoryFunction } from "@glue42/web";
import { Glue42 } from "@glue42/desktop";
import { Glue42WebPlatform, Glue42WebPlatformFactoryFunction } from "@glue42/web-platform";

export type Glue42DesktopFactoryFunction = (config?: Glue42.Config) => Promise<Glue42.Glue>;
export type Glue42NgFactoryConfig = Glue42.Config | Glue42Web.Config | Glue42WebPlatform.Config;
export type Glue42NgFactory = Glue42WebFactoryFunction | Glue42WebPlatformFactoryFunction | Glue42DesktopFactoryFunction;

export interface Glue42NgSettings {
    holdInit?: boolean;
    web?: {
        factory?: Glue42WebFactoryFunction;
        config?: Glue42Web.Config;
    };
    webPlatform?: {
        factory?: Glue42WebPlatformFactoryFunction;
        config?: Glue42WebPlatform.Config;
    };
    desktop?: {
        factory?: Glue42DesktopFactoryFunction;
        config?: Glue42.Config;
    };
}
