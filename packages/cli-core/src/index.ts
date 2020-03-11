import { commands } from "./commands";

const command = process.argv[2];

if (command !== "serve" && command !== "build") {
    throw new Error(`Unrecognized command: ${command}`);
}

commands[command]();
