import { CliConfig, CliServerApp, FullDevConfig } from "./cli.config";
import { commands, CommandDefinition } from "../commands";
import { GlueDevConfig, ServerApp } from "./user.config";
import { join, isAbsolute } from "path";
import { access, constants, readFile } from "fs";
import { glueDevConfigDefaults } from "../defaults";
import { glueDevConfigDecoder } from "./config-decoders";
import deepMerge from "deepmerge";
import { generate } from "shortid";

export class ConfigController {

    public async composeCliConfig(process: NodeJS.Process): Promise<CliConfig> {
        const command = this.getCommand(process.argv);

        const userConfig = await this.getUserDefinedConfig(process.cwd(), command);

        const cliConfig = this.mergeDefaults(userConfig, process.cwd(), command);

        this.transFormAllToAbsolute(cliConfig, process.cwd());

        if (command.name !== "init") {
            await this.validateExistence(cliConfig);
        }
        
        return cliConfig;
    }

    private async validateExistence(config: CliConfig): Promise<void> {
        const allPaths = this.getAllPaths(config);

        await Promise.all(allPaths.map((assetPath) => this.checkFileExistence(assetPath, true)));
    }

    private transFormAllToAbsolute(config: CliConfig, rootDirectory: string): void {
        config.glueAssets.worker = this.pathTransform(config.glueAssets.worker, rootDirectory);
        config.glueAssets.gateway.location = this.pathTransform(config.glueAssets.gateway.location, rootDirectory);
        config.glueAssets.config = this.pathTransform(config.glueAssets.config, rootDirectory);

        config.server.sharedAssets.forEach((sharedAsset) => sharedAsset.path = this.pathTransform(sharedAsset.path, rootDirectory));

        config.server.apps.forEach((app) => app.file ? app.file.path = this.pathTransform(app.file.path, rootDirectory) : null);
    }

    private pathTransform(filePath: string, rootDirectory: string): string {
        if (!filePath) {
            throw new Error(`Cannot transform this file path to absolute: ${JSON.stringify(filePath)}`);
        }

        if (isAbsolute(filePath)) {
            return filePath;
        }

        return join(rootDirectory, filePath);
    }

    private getAllPaths(config: CliConfig): string[] {
        return [
            config.glueAssets.worker,
            config.glueAssets.gateway.location,
            config.glueAssets.config,
            ...config.server.sharedAssets.map((sha) => sha.path),
            ...config.server.apps.reduce<string[]>((paths, app) => {
                if (app.file) {
                    paths.push(app.file.path);
                }
                return paths;
            }, [])
        ];
    }

    private mergeDefaults(userConfig: GlueDevConfig, rootDirectory: string, command: CommandDefinition): CliConfig {
        const defaults = glueDevConfigDefaults.data;

        if (userConfig.server?.apps) {
            userConfig.server.apps = this.addCookieIds(userConfig.server.apps);
        }

        const mergedConfig = (deepMerge(defaults, userConfig) as FullDevConfig);

        return Object.assign({}, { rootDirectory, command: command.name }, mergedConfig);
    }

    private addCookieIds(apps: ServerApp[]): CliServerApp[] {
        return apps.reduce<CliServerApp[]>((ready, app) => {
            const appWithCookie: CliServerApp = Object.assign({}, app, { cookieID: generate() });
            ready.push(appWithCookie);
            return ready;
        }, []);
    }

    private getCommand(argv: string[]): CommandDefinition {
        const command = argv[2];

        const matchingCommand = commands.find((cmd) => cmd.name === command);

        if (!matchingCommand) {
            throw new Error(`Unrecognized command: ${command}`);
        }

        return matchingCommand;
    }

    private async getUserDefinedConfig(rootDirectory: string, command: CommandDefinition): Promise<GlueDevConfig> {
        const configLocation = join(rootDirectory, glueDevConfigDefaults.location, glueDevConfigDefaults.name);

        const fileExists = await this.checkFileExistence(configLocation);

        if (!fileExists) {
            if (command.requiredConfig) {
                throw new Error(`Command: ${command.name} requires a dev config file`);
            } else {
                return {};
            }
        }

        const configAsString = await this.readFilePromise(configLocation);

        const userConfig = glueDevConfigDecoder.runWithException(JSON.parse(configAsString));

        if (command.decoderDecorator) {
            command.decoderDecorator.runWithException(userConfig);
        }

        if (userConfig.server?.apps && userConfig.server.apps.length) {
            this.validateApps(userConfig.server.apps);
            this.setDefaultSpa(userConfig.server.apps);
        }

        return userConfig;
    }

    private setDefaultSpa(apps: ServerApp[]): void {
        apps.forEach((app) => {
            if (app.localhost) {
                app.localhost.spa = typeof app.localhost.spa === "undefined" ? true : app.localhost.spa;
            }
        });
    }

    private validateApps(apps: ServerApp[]): void {
        apps.forEach((app) => {
            if (!app.localhost && !app.file) {
                throw new Error(`Invalid app definition: required either url or file properties, received: ${JSON.stringify(app)}`);
            }

            if (app.localhost && app.file) {
                throw new Error(`Over-specified app definition: required either url or file properties not both, received: ${JSON.stringify(app)}`);
            }
        });
    }

    private readFilePromise(location: string): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(location, "UTF-8", (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve(data);
            });
        });
    }

    private checkFileExistence(location: string, unsafeCheck?: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            access(location, constants.F_OK, (err) => {

                if (!err) {
                    return resolve(true);
                }

                if (unsafeCheck) {
                    return reject(`File at location: ${location} does not exist`);
                }

                resolve(false);
            });
        });
    }
}
