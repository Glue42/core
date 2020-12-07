/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "../../web";

export const enterprise = (config: Glue42Web.Config): Glue42.Glue => {

    const enterpriseConfig = {
        windows: true,
        layouts: "full",
        appManager: "full",
        channels: true,
        libraries: config.libraries,
        logger: config?.systemLogger?.level ?? "warn"
    };

    return (window as any).Glue(enterpriseConfig);
};