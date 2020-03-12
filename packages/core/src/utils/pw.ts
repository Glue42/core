export class PromiseWrapper<T> {

    public static delay(time: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    public resolve!: (arg?: T | PromiseLike<T>) => void;
    public reject!: (err: any) => void;
    public promise: Promise<T>;
    public rejected: boolean = false;
    public resolved: boolean = false;
    public get ended(): boolean {
        return this.rejected || this.resolved;
    }

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = (t: any) => {
                this.resolved = true;
                resolve(t);
            };

            this.reject = (err: any) => {
                this.rejected = true;
                reject(err);
            };
        });
    }
}
