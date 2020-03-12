import { CoreDevServer } from "./server/server";
import { ConfigParser } from "./config/config-parser";

export const commands = {
    serve: async (): Promise<void> => {
        const parser = new ConfigParser();

        const server = new CoreDevServer(parser, process);
        await server.setup();
        await server.start();
        console.log("server started");
    },
    build: async (): Promise<void> => {
        throw new Error("The build command is not implemented");
    }
};
