import { Glue42Web } from "@glue42/web";
import { Glue42 } from "@glue42/desktop";

export type Glue42NgSettings = { config?: Glue42NgConfig; factory?: Glue42NgFactory; holdInit?: boolean };
export type Glue42NgConfig = Glue42Web.Config | Glue42.Config;
export type Glue42NgFactory = (config?: Glue42NgConfig) => Promise<Glue42Web.API | Glue42.Glue>;