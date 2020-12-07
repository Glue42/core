import GlueWeb, { Glue42Web } from "@glue42/web";
import { WebPlatformFactoryFunction, Glue42WebPlatform } from "../platform";
import { Glue42API } from "./common/types";
import { IoC } from "./shared/ioc";

export const glueWebPlatformFactory: WebPlatformFactoryFunction = async (config?: Glue42WebPlatform.Config): Promise<{ glue: Glue42Web.API | Glue42API; platform?: Glue42WebPlatform.API }> => {

    // when running the package in Enterprise, we do not initialize anything from the platform
    // because we cannot provide runtime environment configuration to Enterprise
    if (window.glue42gd) {
        const glue = config?.glueFactory ?
            await config?.glueFactory(config?.glue) :
            await GlueWeb(config?.glue);

        return { glue };
    }

    const ioc = new IoC(config);

    await ioc.platform.ready();

    const glue = await ioc.platform.createClientGlue(config?.glue, config?.glueFactory);

    return { glue, platform: ioc?.platform.exposeAPI() };
};
