import { commands } from "./commands";
import { configure, Logger, getLogger } from "log4js";
import { loggerConfig } from "./defaults";
import { configController } from "./config";

export const initiate = async (process: NodeJS.Process): Promise<void> => {
    const cliConfig = await configController.composeCliConfig(process);

    configure(loggerConfig);
    const logger: Logger = getLogger(cliConfig.logging);

    logger.trace(`CLI started with parsed configuration: ${JSON.stringify(cliConfig, null, 2)}`);

    return commands
        .find((command) => command.name === cliConfig.command)
        .action(cliConfig, logger);
};
