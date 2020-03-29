import { spawn } from "child_process";

export class Npm {

    private get npmCmd(): string {
        return process.platform === "win32"
            ? "npm.cmd"
            : "npm";
    }

    public async init(): Promise<void> {
        return new Promise((resolve, reject) => {

            const spawnArgs = ["init", "--yes"];

            this.spawnProcess(spawnArgs, resolve, reject);
        });
    }

    public async installDeps(names: string[]): Promise<void> {
        return new Promise((resolve, reject) => {

            const spawnArgs = ["install"].concat(names).concat(["--save"]);

            this.spawnProcess(spawnArgs, resolve, reject);
        });
    }

    private spawnProcess(spawnArgs: string[], resolve: (value?: void | PromiseLike<void>) => void, reject: (reason?: unknown) => void): void {
        const child = spawn(this.npmCmd, spawnArgs, { stdio: "inherit" });

        child.on("error", reject);
        child.on("exit", resolve);
    }
}