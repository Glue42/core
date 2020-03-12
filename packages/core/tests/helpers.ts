import { PromiseWrapper } from "../src/utils/pw";
import isEqual from "lodash.isequal";

export interface WaitForResult<T> {
    received: T[];
    next: () => T;
    fn: (key: T) => void;
    promise: Promise<void>;
    tag: any;
}

export function waitForArr<T>(items: T[], keepOrder: boolean = false, tag?: any): WaitForResult<T> {

    const p = new PromiseWrapper<void>();
    const received: T[] = [];

    const fn = (key: T): void => {
        const index = items.findIndex((v) => isEqual(v, key));
        if (index > -1) {
            if (index !== 0 && keepOrder) {
                p.reject(`received '${key}' which is not what should comes next - left->${JSON.stringify(items)}; received->${JSON.stringify(received)}`);
                return;
            }
            received.push(key);
            items.splice(index, 1);
        } else {
            p.reject(`key ${key} not found`);
            return;
        }

        if (items.length === 0) {
            p.resolve();
        }
    };

    return {
        received,
        fn,
        promise: p.promise,
        tag,
        next: () => items[0]
    };
}
