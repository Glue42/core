import { mkdir, copyFile } from "fs";
import { join } from "path";
import { CliConfig } from "../config/cli.config";
import rimraf from "rimraf";
import { Logger } from "log4js";

export class BuildController {

    private logger: Logger;

    public async build(config: CliConfig, logger: Logger): Promise<void> {
        this.logger = logger;

        const targetDir = join(config.rootDirectory, "glue");

        await this.deleteExistingGlueDir(targetDir);

        await this.createGlueDir(targetDir);
        this.logger.info(`Target directory created at: ${targetDir}`);

        const copyDefinitions = [
            { from: config.glueAssets.gateway.location, to: join(targetDir, "gateway.js") },
            { from: config.glueAssets.worker, to: join(targetDir, "worker.js") },
            { from: config.glueAssets.config, to: join(targetDir, "glue.config.js") },
        ];

        if (config.glueAssets.gateway.gwLogAppender) {
            copyDefinitions.push({
                from: config.glueAssets.gateway.gwLogAppender,
                to: join(targetDir, "gwLogAppender.js")
            });
        }

        await Promise.all(copyDefinitions.map((definition) => this.copyFile(definition.from, definition.to)));

        this.logger.info(`Glue42 Core build is completed at: ${targetDir}`);
    }

    private copyFile(from: string, to: string): Promise<void> {
        this.logger.info(`Copying ${from} to ${to}`);
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
