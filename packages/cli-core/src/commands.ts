import { Logger } from "log4js";
import { CliConfig } from "./config/cli.config";
import { coreDevServer } from "./server";
import { buildController } from "./builder";
import { initController } from "./initiate";

export type Command = "serve" | "build" | "init";

export const commands: { [key in Command]: (config: CliConfig, logger: Logger) => Promise<void> } = {
    serve: async (config: CliConfig, logger: Logger): Promise<void> => {
        await coreDevServer.setup(config, logger);
        await coreDevServer.start();
    },
    build: async (config: CliConfig, logger: Logger): Promise<void> => {
        await buildController.build(config, logger);
    },
    init: async (config: CliConfig, logger: Logger): Promise<void> => {
        await initController.start(config, logger);
    }
};
