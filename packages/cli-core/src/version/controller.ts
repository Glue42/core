import { readFile } from "fs";
import { join } from "path";

export class VersionController {
    public getCurrentVersion(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const pkgLocation = join(__dirname, "../package.json");
            readFile(pkgLocation, "UTF-8", (err, data) => {
                if (err) {
                    return reject(err);
                }

                const pkg = JSON.parse(data);
                resolve(pkg.version);
            });
        });
    }
}