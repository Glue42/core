import { ServerConfig } from "./config.d";

export declare class CoreDevServer {
    constructor(config: ServerConfig);
    start(): Promise<void>;
    setup(): Promise<CoreDevServer>;
}