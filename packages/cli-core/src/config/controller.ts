import { CliConfig } from "./cli.config";

export class ConfigController {

    public async composeCliConfig(process: NodeJS.Process): Promise<CliConfig> {
        // validate command
        // parse the cli args
        // parse the json args
        // compose a CliConfig

        // call a command implementation with the logger and the config


        // const command = process.argv[2];

        // const allCommandNames = Object.keys(commands);

        // if (!allCommandNames.includes(command)) {
        //     throw new Error(`Unrecognized command: ${command}`);
        // }

        // return commands[command as Command](process);
        console.log(process);
        return {} as CliConfig;
    }
}
