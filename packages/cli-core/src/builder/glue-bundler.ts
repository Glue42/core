import { join } from "path";
import { mkdir } from "fs";
import rimraf from "rimraf";
import { ConfigParser } from "../config/config-parser";

export class GlueBundler {
    private readonly glueBundleName = "glue";
    private readonly rootDirectory: string;

    constructor(
        private readonly parser: ConfigParser,
        nodeProcess: NodeJS.Process
    ) {
        this.rootDirectory = nodeProcess.cwd();
    }

    public async createBundle(): Promise<string> {
        const bundlePath = join(this.rootDirectory, this.glueBundleName);

        console.log("starting removal");
        await this.removeExistingBundle(`${bundlePath}`);
        console.log("removal completed");

        await this.createBundleDir(bundlePath);
        console.log("dir created");

        // copy contents of the gateway to the 

        console.log(JSON.stringify(this.parser, null, 2));
        // if existing -> remove
        // make a directory /glue
        // copy the assets there
        // static serve the dir
        return bundlePath;
    }

    private removeExistingBundle(glob: string): Promise<void> {
        return new Promise((resolve, reject) => {
            rimraf(glob, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    private createBundleDir(location: string): Promise<void> {
        return new Promise((resolve, reject) => {
            mkdir(location, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }
}
