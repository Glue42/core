import { generate } from "shortid";

export class AsyncIntervals {
    private readonly intervalsLookup: { [key: string]: boolean } = {};

    public set(callback: () => Promise<void>, interval: number, immediateStart = true): string {
        if (callback && typeof callback === "function") {

            const intervalId = generate();
    
            this.intervalsLookup[intervalId] = true;
    
            this.runAsyncInterval(callback, interval, intervalId, immediateStart);
    
            return intervalId;
        } else {
            throw new Error("Callback must be a function");
        }
    }

    public clear(id: string): void {
        delete this.intervalsLookup[id];
    }

    private async runAsyncInterval(callback: () => Promise<void>, interval: number, intervalId: string, execute: boolean): Promise<void> {
        if (!this.intervalsLookup[intervalId]) {
            return;
        }
    
        if (execute) {
            await callback();
        }
    
        if (this.intervalsLookup[intervalId]) {
            setTimeout(() => this.runAsyncInterval(callback, interval, intervalId, true), interval);
        }
    }
}

export default new AsyncIntervals();