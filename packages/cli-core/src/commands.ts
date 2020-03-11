import { CoreDevServer } from "./server/server";
import { ConfigParser } from "./config/config-parser";
import { GlueBundler } from "./builder/glue-bundler";

export const commands = {
    serve: async (): Promise<void> => {
        const parser = new ConfigParser();

        const server = new CoreDevServer(parser, process);
        await server.setup();
        await server.start();
        console.log("server started");
    },
    build: async (): Promise<void> => {
        const parser = new ConfigParser();

        const bundler = new GlueBundler(parser, process);
        const bundleLocation = await bundler.createBundle();
        console.log(`Bundle is compelted at: ${bundleLocation}`);
    }
};
