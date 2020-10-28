import { DesktopAgent } from "@finos/fdc3";

export type ChannelsAPI = Pick<
  DesktopAgent,
  "getSystemChannels" | "joinChannel" | "getOrCreateChannel" | "broadcast" | "addContextListener" | "getCurrentChannel"
> & {
  leaveCurrentChannel(): Promise<void>;
};
