import { Glue42Core } from "../../glue";
import { count } from "console";

export class PerfTracker {

    private lastCount = 0;

    private initialPublishTimeout = 10 * 1000; // 10 sec
    private publishInterval = 60 * 1000; // 60 sec
    private system: Glue42Core.Metrics.System;

    constructor(private api: Glue42Core.Metrics.API, initialPublishTimeout?: number, publishInterval?: number) {
        this.initialPublishTimeout = initialPublishTimeout ?? this.initialPublishTimeout;
        this.publishInterval = publishInterval ?? this.publishInterval;
        this.scheduleCollection();
        this.system = this.api.subSystem("performance", "Performance data published by the web application");
    }

    private scheduleCollection() {
        setTimeout(() => {
            this.collect();
            setInterval(() => {
                this.collect();
            }, this.publishInterval);
        }, this.initialPublishTimeout);
    }

    private collect() {
        try {
            // tslint:disable-next-line:no-console
            this.collectMemory();
            this.collectEntries();
        } catch {
            // DO NOTHING
        }
    }

    private collectMemory() {
        // memory - use performance.memory
        const memory = (window.performance as any).memory;
        this.system.stringMetric("memory", JSON.stringify({
            totalJSHeapSize: memory.totalJSHeapSize,
            usedJSHeapSize: memory.usedJSHeapSize
        }));
    }

    private collectEntries() {
        const allEntries = window.performance.getEntries();
        if (allEntries.length <= this.lastCount) {
            return;
        }
        this.lastCount = allEntries.length;

        this.system.stringMetric("entries", JSON.stringify(allEntries));
    }
}
