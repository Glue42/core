import GlueWeb, { Glue42Web } from "@glue42/web";
import { Glue42WebPlatform } from "../../platform";
import { Glue42API } from "../common/types";

export const fallbackToEnterprise = async (config?: Glue42WebPlatform.Config): Promise<{ glue: Glue42Web.API | Glue42API; platform?: Glue42WebPlatform.API }> => {
    const glue = config?.glueFactory ?
        await config?.glueFactory(config?.glue) :
        await GlueWeb(config?.glue);

    if (config?.applications?.local?.length) {
        // if fdc3 definition -> convert to gd definition and import
        await glue.appManager.inMemory.import((config.applications.local as Glue42Web.AppManager.Definition[]), "merge");
    }

    if (config?.layouts?.local?.length) {
        await glue.layouts.import(config.layouts.local, "merge");
    }

    return { glue };
};
