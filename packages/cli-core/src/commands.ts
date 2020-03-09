import { CoreDevServer } from "@glue42/dev-server-core";
import { ConfigParser } from "./config/config-parser";
import { InitiationController } from "./initiate/controller";
import { Npm } from "./initiate/npm";
import { BuildController } from "./builder/controller";

export type Command = "serve" | "build" | "init";

export const commands: { [key in Command]: () => Promise<void> } = {
    serve: async (): Promise<void> => {
        const parser = new ConfigParser();
        const config = await parser.parse(process.argv, process.cwd());

        const server = new CoreDevServer(config);
        await server.setup();
        await server.start();
        console.log("server started");
    },
    build: async (): Promise<void> => {
        const parser = new ConfigParser();
        const config = await parser.parse(process.argv, process.cwd());

        const buildController = new BuildController();
        await buildController.build(config, process.cwd());
    },
    init: async (): Promise<void> => {
        const npm = new Npm();
        const initController = new InitiationController(npm);

        await initController.start(process.cwd());
    }
};
