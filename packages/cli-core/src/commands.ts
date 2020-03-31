import { Logger } from "log4js";
import { CliConfig } from "./config/cli.config";
import { coreDevServer } from "./server";
import { buildController } from "./builder";
import { initController } from "./initiate";
import { serverDecoderDecorator } from "./config/config-decoders";
import { Decoder } from "@mojotech/json-type-validation";

export type Command = "serve" | "build" | "init";

export interface CommandDefinition {
    name: Command;
    action: (config: CliConfig, logger: Logger) => Promise<void>;
    requiredConfig: boolean;
    decoderDecorator?: Decoder<unknown>;
}

export const commands: CommandDefinition[] = [
    {
        name: "serve",
        action: async (config: CliConfig, logger: Logger): Promise<void> => {            
            await coreDevServer.setup(config, logger);
            await coreDevServer.start();
        },
        requiredConfig: true,
        decoderDecorator: serverDecoderDecorator
    },
    {
        name: "build",
        action: async (config: CliConfig, logger: Logger): Promise<void> => {
            await buildController.build(config, logger);
        },
        requiredConfig: true
    },
    {
        name: "init",
        action: async (config: CliConfig, logger: Logger): Promise<void> => {
            await initController.start(config, logger);
        },
        requiredConfig: false
    }
];
