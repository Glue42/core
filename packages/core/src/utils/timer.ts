import {Timer} from "../types";

export default function(): Timer {

    function now(): number {
        return new Date().getTime();
    }

    const startTime = now();
    let endTime: number;
    let period: number;

    function stop(): number {
        endTime = now();
        period = now() - startTime;
        return period;
    }

    return {
        get startTime(): number {
            return startTime;
        },
        get endTime(): number {
            return endTime;
        },
        get period(): number {
            return period;
        },
        stop
    };
}
