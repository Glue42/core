import { exec } from "child_process";

export class Npm {
    public async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log("calling init");
            const child = exec("npm init --yes", (_err, stdout) => console.log(stdout));

            child.on("error", reject);
            child.on("exit", resolve);
        });
    }

    public async installDeps(names: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log("calling install");
            const child = exec(`npm install --save ${names.join(" ")}`, (err, stdout) => {
                if (err) {
                    return reject(err);
                }
                console.log(stdout);
            });

            child.on("error", reject);
            child.on("exit", resolve);
        });
    }
}