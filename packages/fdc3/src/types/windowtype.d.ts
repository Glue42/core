import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "@glue42/web";
import { Glue42GD } from "./glue42gd";
import { Glue42WebPlatform } from "@glue42/web-platform";
import { Glue42FDC3DesktopAgent } from "./glue42FDC3DesktopAgent";
import { RemoteSource } from "./remoteSource";

export type WindowType = (typeof window) & {
  glue: Glue42.Glue | Glue42Web.API;
  fdc3GluePromise: Promise<void | Glue42.Glue | Glue42Web.API>;
  glue42gd?: Glue42GD;
  webPlatformConfig?: Glue42WebPlatform.Config;
  remoteSources?: Array<RemoteSource>;
  Glue?: (config?: Glue42.Config) => Promise<Glue42.Glue>;
  fdc3?: Glue42FDC3DesktopAgent;
};
