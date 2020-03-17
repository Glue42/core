// import { join, isAbsolute } from "path";
// import { readFile, existsSync } from "fs";
// import { generate } from "shortid";
// import { serverConfigDecoder } from "./config-decoders";
// import { ServerConfig, UserServerApp, DevServerApp, GlueAssets } from "./cli.config";

// export class ConfigParser {
//     private readonly defaultSettings = {
//         port: 5000,
//         disableCache: true,
//         verboseLogging: false
//     };

//     private readonly defaultGlueAssets = {
//         gateway: "./gateway-core",
//         sharedWorker: "./worker-core"
//     };

//     public async parse(argv: string[], rootDirectory: string): Promise<ServerConfig> {

//         const userInputConfigLocation = this.getUserConfigLocation(argv);
        
//         const configAbsLocation = join(rootDirectory, userInputConfigLocation);
//         console.log(`Fetching dev config from: ${configAbsLocation}`);

//         const configAsString = await this.read(configAbsLocation);
//         const userConfig = serverConfigDecoder.runWithException(JSON.parse(configAsString));

//         this.validateApps(userConfig.apps);

//         const config: ServerConfig = Object.assign(
//             { serverSettings: this.defaultSettings, glueAssets: this.getFullDefaultGlueAssetsLocation(argv) },
//             userConfig,
//             { apps: this.addCookieIds(userConfig.apps) }
//         );

//         this.transformAllToAbsolute(config, rootDirectory);

//         console.log(`Merged and transformed config: ${JSON.stringify(config, null, 2)}`);
        
//         this.validateExistenceOfAssets(config);

//         return config;
//     }

//     private validateExistenceOfAssets(config: ServerConfig): void {
//         const appPaths = config.apps.reduce((appFilePaths, app) => {
//             if (app.file) {
//                 appFilePaths.push(app.file.path);
//             }
//             return appFilePaths;
//         }, []);

//         const sharedAssetsPaths = config.sharedAssets?.map((asset) => asset.path) || [];

//         const allFilePaths = [
//             config.glueAssets.sharedWorker,
//             ...appPaths,
//             ...sharedAssetsPaths
//         ];

//         allFilePaths.forEach((filePath) => {
//             if (!existsSync(filePath)) {
//                 throw new Error(`The specified resource path does not exist: ${filePath}`);
//             }
//         });
//     }

//     private validateApps(apps: UserServerApp[]): void {
//         apps.forEach((app) => {
//             if (!app.localhost && !app.file) {
//                 throw new Error(`Invalid app definition: required either url or file properties, received: ${JSON.stringify(app)}`);
//             }

//             if (app.localhost && app.file) {
//                 throw new Error(`Over-specified app definition: required either url or file properties not both, received: ${JSON.stringify(app)}`);
//             }
//         });
//     }

//     private addCookieIds(apps: UserServerApp[]): DevServerApp[] {
//         return apps.map((app) => {
//             return { ...app, cookieID: generate() };
//         });
//     }

//     private read(location: string): Promise<string> {
//         return new Promise<string>((resolve, reject) => {
//             readFile(location, "UTF-8", (err, data) => {
//                 if (err) {
//                     return reject(err);
//                 }

//                 resolve(data);
//             });
//         });
//     }

//     private transformAllToAbsolute(config: ServerConfig, rootDirectory: string): void {
//         config.glueAssets.sharedWorker = this.pathTransform(config.glueAssets.sharedWorker, rootDirectory);
//         config.glueAssets.gateway = this.pathTransform(config.glueAssets.gateway, rootDirectory);
//         config.apps.forEach((app) => app.file ? app.file.path = this.pathTransform(app.file.path, rootDirectory) : null);
//         config.sharedAssets?.forEach((asset) => asset.path = this.pathTransform(asset.path, rootDirectory));
//     }

//     private pathTransform(filePath: string, rootDirectory: string): string {
//         if (!filePath) {
//             throw new Error(`Cannot transform this file path to absolute: ${JSON.stringify(filePath)}`);
//         }

//         if (isAbsolute(filePath)) {
//             return filePath;
//         }

//         return join(rootDirectory, filePath);
//     }

//     private getUserConfigLocation(argv: string[]): string {

//         if (argv.includes("-c")) {
//             return argv[argv.indexOf("-c") + 1];
//         }

//         return "./glue.config.dev.json";
//     }

//     private getFullDefaultGlueAssetsLocation(argv: string[]): GlueAssets {
//         return {
//             sharedWorker: join(argv[1], "../../../", this.defaultGlueAssets.sharedWorker),
//             gateway: join(argv[1], "../../../", this.defaultGlueAssets.gateway)
//         };
//     }
// }
