import { CoreDevServer } from "./server";
import { ConfigParser } from "./config/config-parser";
import { GlueBundler } from "./glue-bundler";

const parser = new ConfigParser();
const bundler = new GlueBundler();

(new CoreDevServer(bundler, parser, process))
    .setup()
    .then((server) => server.start())
    .then(() => console.log("server started"))
    .catch(console.error);
