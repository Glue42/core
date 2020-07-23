import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";

export type WindowType = (typeof window) & {
  glue: Glue42.Glue | Glue42Web.API;
  gluePromise: Promise<Glue42.Glue | Glue42Web.API>;
  glue42gd?: Glue42.GDObject;
}
