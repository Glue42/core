import { CoreDevServer } from "./server";
import { ConfigParser } from "./config/config-parser";

const parser = new ConfigParser();
const argv = process.argv;
const rootDirectory = process.cwd();

(new CoreDevServer(parser, argv, rootDirectory))
    .setup()
    .then((server) => server.start())
    .then(() => console.log("server started"))
    .catch(console.error);
