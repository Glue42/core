import GlueWeb, { Glue42Web } from "@glue42/web";
import { Glue42WebPlatformFactoryFunction, Glue42WebPlatform } from "../platform";
import { Glue42API } from "./common/types";
import { checkIsOpenerGlue } from "./fallbacks/core";
import { fallbackToEnterprise } from "./fallbacks/enterprise";
import { IoC } from "./shared/ioc";

export const glueWebPlatformFactory: Glue42WebPlatformFactoryFunction = async (config?: Glue42WebPlatform.Config): Promise<{ glue: Glue42Web.API | Glue42API; platform?: Glue42WebPlatform.API }> => {

    // when running the package in Enterprise, we do not initialize anything from the platform
    // because we cannot provide runtime environment configuration to Enterprise
    // the same is valid when the platform is instructed to start as a client only
    if (window.glue42gd) {
        return fallbackToEnterprise(config);
    }

    // check if in Core and started by another platform and add the flag to the if
    const isOpenerGlue = await checkIsOpenerGlue();

    if (config?.clientOnly || isOpenerGlue) {
        const glue = config?.glueFactory ?
            await config?.glueFactory(config?.glue) :
            await GlueWeb(config?.glue);

        return { glue };
    }

    const ioc = new IoC(config);

    await ioc.platform.ready();

    const glue = await ioc.platform.getClientGlue();

    return { glue, platform: ioc?.platform.exposeAPI() };
};
