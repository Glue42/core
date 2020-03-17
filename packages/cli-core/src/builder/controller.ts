import { mkdir, copyFile } from "fs";
import { join } from "path";
import { CliConfig } from "../config/cli.config";
import rimraf from "rimraf";
import { Logger } from "log4js";

export class BuildController {
    public async build(config: CliConfig, logger: Logger): Promise<void> {
        logger.info("using");
        const targetDir = join(config.rootDirectory, "glue");
        await this.deleteExistingGlueDir(targetDir);
        await this.createGlueDir(targetDir);

        // todo: need to add the config once agreed on
        const copyDefinitions = [
            { from: config.glueAssets.gateway, to: join(targetDir, "gateway.js") },
            { from: config.glueAssets.sharedWorker, to: join(targetDir, "worker.js") }
        ];

        await Promise.all(copyDefinitions.map((definition) => this.copyFile(definition.from, definition.to)));
    }

    private copyFile(from: string, to: string): Promise<void> {
        return new Promise((resolve, reject) => {
            copyFile(from, to, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    private createGlueDir(glueDir: string): Promise<void> {
        return new Promise((resolve, reject) => {
            mkdir(glueDir, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    private deleteExistingGlueDir(glob: string): Promise<void> {
        return new Promise((resolve, reject) => {
            rimraf(glob, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

}
