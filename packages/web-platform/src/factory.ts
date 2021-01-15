import GlueWeb, { Glue42Web } from "@glue42/web";
import { Glue42WebPlatformFactoryFunction, Glue42WebPlatform } from "../platform";
import { Glue42API } from "./common/types";
import { IoC } from "./shared/ioc";

export const glueWebPlatformFactory: Glue42WebPlatformFactoryFunction = async (config?: Glue42WebPlatform.Config): Promise<{ glue: Glue42Web.API | Glue42API; platform?: Glue42WebPlatform.API }> => {

    // when running the package in Enterprise, we do not initialize anything from the platform
    // because we cannot provide runtime environment configuration to Enterprise
    // the same is valid when the platform is instructed to start as a client only
    if (window.glue42gd || config?.clientOnly) {
        const glue = config?.glueFactory ?
            await config?.glueFactory(config?.glue) :
            await GlueWeb(config?.glue);

        if (window.glue42gd && config?.applications?.local?.length) {
            // if fdc3 definition -> convert to gd definition and import
            await glue.appManager.inMemory.import((config.applications.local as Glue42Web.AppManager.Definition[]), "merge");
        }

        if (window.glue42gd && config?.layouts?.local?.length) {
            await glue.layouts.import(config.layouts.local, "merge");
        }

        return { glue };
    }

    const ioc = new IoC(config);

    await ioc.platform.ready();

    const glue = await ioc.platform.getClientGlue();

    return { glue, platform: ioc?.platform.exposeAPI() };
};
