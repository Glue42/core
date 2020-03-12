/*
 * A store for holding method back-objects registered by this instance's server
 */
import { ServerMethodInfo } from "./types";

export default class ServerRepository {

    private nextId = 0;
    private methods: ServerMethodInfo[] = [];

    public add(method: Partial<ServerMethodInfo>): ServerMethodInfo {
        method.repoId = String(this.nextId);
        this.nextId += 1;
        this.methods.push(method as ServerMethodInfo);
        return method as ServerMethodInfo;
    }

    public remove(repoId: string) {
        if (typeof repoId !== "string") {
            return new TypeError("Expecting a string");
        }

        this.methods = this.methods.filter((m) => {
            return m.repoId !== repoId;
        });
    }

    public getById(id: string): ServerMethodInfo | undefined {
        if (typeof id !== "string") {
            return undefined;
        }

        return this.methods.find((m) => {
            return m.repoId === id;
        });
    }

    public getList() {
        return this.methods.map((m) => m);
    }

    public length() {
        return this.methods.length;
    }

    public reset() {
        this.methods = [];
    }
}
