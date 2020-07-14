import { Timer, Mark } from "../types";

const timers: { [index: string]: Timer } = {};

export function getAllTimers() {
    return timers;
}

export default function (timerName: string): Timer {
    const existing = timers[timerName];
    if (existing) {
        return existing;
    }

    const marks: Mark[] = [];
    function now(): number {
        return new Date().getTime();
    }

    const startTime = now();
    mark("start", startTime);
    let endTime: number;
    let period: number;

    function stop(): number {
        endTime = now();
        mark("end", endTime);
        period = endTime - startTime;
        return period;
    }

    function mark(name: string, time?: number): void {
        const currentTime = time ?? now();
        let diff = 0;
        if (marks.length > 0) {
            diff = currentTime - marks[marks.length - 1].time;
        }
        marks.push({ name, time: currentTime, diff });
    }

    const timerObj = {
        get startTime(): number {
            return startTime;
        },
        get endTime(): number {
            return endTime;
        },
        get period(): number {
            return period;
        },
        stop,
        mark,
        marks
    };

    timers[timerName] = timerObj;
    return timerObj;
}
