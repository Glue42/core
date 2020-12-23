import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import { Glue42GD } from "./glue42gd";
import { DesktopAgent } from "@finos/fdc3";
import { Glue42WebPlatform } from "@glue42/web-platform";

export type WindowType = (typeof window) & {
  glue: Glue42.Glue | Glue42Web.API;
  fdc3GluePromise: Promise<void | Glue42.Glue | Glue42Web.API>;
  glue42gd?: Glue42GD;
  webPlatformConfig?: Glue42WebPlatform.Config;
  Glue?: (config?: Glue42.Config) => Promise<Glue42.Glue>;
  fdc3?: DesktopAgent;
}
