import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";

export type WindowType = (typeof window) & {
  glue: Glue42.Glue | Glue42Web.API;
  gluePromise: Promise<void | Glue42.Glue | Glue42Web.API>;
  glue42gd?: Glue42.GDObject;
  fdc3AppName?: string;
  Glue?: (config?: Glue42.Config) => Promise<Glue42.Glue>;
}
