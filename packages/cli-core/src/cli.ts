import { commands, Command } from "./commands";

export const initiate = (argv: string[]): Promise<void> => {
    const command = argv[2];

    const allCommandNames = Object.keys(commands);

    if (!allCommandNames.includes(command)) {
        throw new Error(`Unrecognized command: ${command}`);
    }

    return commands[command as Command]();
};
