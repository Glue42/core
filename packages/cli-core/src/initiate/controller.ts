import { access, constants, writeFile } from "fs";
import { join } from "path";
import { Npm } from "./npm";
import { gCoreDeps, glueConfigDefaults, glueDevConfigDefaults } from "../defaults";
import { CliConfig } from "../config/cli.config";
import { Logger } from "log4js";

export class InitiationController {

    private logger: Logger;

    constructor(private readonly npm: Npm) { }

    public async start(config: CliConfig, logger: Logger): Promise<void> {
        
        this.logger = logger;

        const pJsonExists = await this.checkPJsonExists(config.rootDirectory);

        if (!pJsonExists) {
            this.logger.info(`Package JSON does not exist in root directory: ${config.rootDirectory}, initiating npm --yes`);
            await this.npm.init();
            this.logger.info("Npm initiated.");
        }

        this.logger.info(`Installing Glue42 Core deps: ${gCoreDeps.join(" ")}`);

        await this.npm.installDeps(gCoreDeps);
        await Promise.all([
            this.createFile(join(config.rootDirectory, glueDevConfigDefaults.name), JSON.stringify(glueDevConfigDefaults.data, null, 4)),
            this.createFile(join(config.rootDirectory, glueConfigDefaults.name), JSON.stringify(glueConfigDefaults.data, null, 4)),
        ]);

        this.logger.info("Glue42 Core development environment completed");
    }

    private checkPJsonExists(rootDirectory: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const location = join(rootDirectory, "package.json");
            access(location, constants.F_OK, (err) => {
                if (err) {
                    return resolve(false);
                }
                resolve(true);
            });
        });
    }

    private createFile(location: string, contents: string): Promise<void> {
        this.logger.info(`Creating: ${location} with defaults`);
        return new Promise((resolve, reject) => {
            writeFile(location, contents, (err) => {

                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }
}
