import { access, constants, writeFile } from "fs";
import { join } from "path";
import { Npm } from "./npm";
// todo: remove with disable when the deps are available
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { gCoreDeps, glueConfigDefaults, glueDevConfigDefaults } from "../defaults";
import { CliConfig } from "../config/cli.config";
import { Logger } from "log4js";

export class InitiationController {

    constructor(private readonly npm: Npm) { }

    public async start(config: CliConfig, logger: Logger): Promise<void> {
        logger.info("using");
        const pJsonExists = await this.checkPJsonExists(config.rootDirectory);

        if (!pJsonExists) {
            await this.npm.init();
        }

        // todo: uncomment when the deps are available
        // await this.npm.installDeps(gCoreDeps);
        await Promise.all([
            this.createFile(join(config.rootDirectory, glueDevConfigDefaults.name), JSON.stringify(glueDevConfigDefaults.data, null, 4)),
            this.createFile(join(config.rootDirectory, glueConfigDefaults.name), JSON.stringify(glueConfigDefaults.data, null, 4))
        ]);
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
