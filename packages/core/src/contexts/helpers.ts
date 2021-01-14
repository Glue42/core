import { Glue42Core } from "../../glue";
import { ContextDelta } from "./bridges/types";
import { Logger } from "../logger/logger";

export function applyContextDelta(
    context: any,
    delta: ContextDelta,
    logger: Logger) {

    try {
        if (logger?.canPublish("trace")) {
            logger?.trace(`applying context delta ${JSON.stringify(delta)} on context ${JSON.stringify(context)}`);
        }
        if (!delta) {
            return context;
        }

        if (delta.reset) {
            context = { ...delta.reset };
            return context;
        }

        context = deepClone(context, undefined);

        if (delta.commands) {
            for (const command of delta.commands) {
                if (command.type === "remove") {
                    deletePath(context, command.path);
                } else if (command.type === "set") {
                    setValueToPath(context, command.value, command.path);
                }
            }
            // if there is a commands property ignore the rest (v1 added/updated/removed)
            return context;
        }

        const added = delta.added;
        const updated = delta.updated;
        const removed = delta.removed;

        if (added) {
            Object.keys(added).forEach((key) => {
                context[key] = added[key];
            });
        }

        if (updated) {
            Object.keys(updated).forEach((key) => {
                mergeObjectsProperties(key, context, updated);
            });
        }

        if (removed) {
            removed.forEach((key) => {
                delete context[key];
            });
        }

        return context;
    } catch (e) {
        logger?.error(`error applying context delta ${JSON.stringify(delta)} on context ${JSON.stringify(context)}`, e);
        return context;
    }
}

// https://stackoverflow.com/a/40294058/1527706
export function deepClone(obj: any, hash?: WeakMap<any, any>): any {
    hash = hash || new WeakMap<any, any>();
    if (Object(obj) !== obj) { return obj; } // primitives
    if (obj instanceof Set) { return new Set(obj); } // See note about this!
    if (hash.has(obj)) { return hash.get(obj); } // cyclic reference
    const result = obj instanceof Date ? new Date(obj)
        : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
            : obj.constructor ? new obj.constructor()
                : Object.create(null);
    hash.set(obj, result);
    if (obj instanceof Map) {
        Array.from(obj, ([key, val]) => result.set(key, deepClone(val, hash)));
    }
    return Object.assign(result, ...Object.keys(obj).map(
        (key) => ({ [key]: deepClone(obj[key], hash) })));
}

/*
mergeObjectsProperties(
    "a",
    { a: { b: { c: 1, e: 1 }, x: { y: 1 }, foo: { moo: "bar" } } },
    { a: { b: { d: 1, e: 2 }, foo: "bar" } });

    => { a: { b: { c: 1, e: 2 } }, x: { y: 1 }, foo: "bar" }
*/

const mergeObjectsProperties = (key: string, what: any, withWhat: any) => {

    const right = withWhat[key];

    if (right === undefined) {
        return what;
    }

    const left = what[key];

    if (!left || !right) {
        what[key] = right;
        return what;
    }

    if (typeof left === "string" ||
        typeof left === "number" ||
        typeof left === "boolean" ||
        typeof right === "string" ||
        typeof right === "number" ||
        typeof right === "boolean" ||
        Array.isArray(left) ||
        Array.isArray(right)) {
        what[key] = right;
        return what;
    }

    what[key] = Object.assign({}, left, right);

    return what;
};

// https://stackoverflow.com/a/6713782/1527706
export function deepEqual(x: any, y: any) {
    if (x === y) {
        return true;
    }
    // if both x and y are null or undefined and exactly the same

    if (!(x instanceof Object) || !(y instanceof Object)) {
        return false;
    }
    // if they are not strictly equal, they both need to be Objects

    if (x.constructor !== y.constructor) {
        return false;
    }
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

    for (const p in x) {
        if (!x.hasOwnProperty(p)) {
            continue;
        }
        // other properties were tested using x.constructor === y.constructor

        if (!y.hasOwnProperty(p)) {
            return false;
        }
        // allows to compare x[ p ] and y[ p ] when set to undefined

        if (x[p] === y[p]) {
            continue;
        }
        // if they have the same strict value or identity then they are equal

        if (typeof (x[p]) !== "object") {
            return false;
        }
        // Numbers, Strings, Functions, Booleans must be strictly equal

        if (!deepEqual(x[p], y[p])) {
            return false;
        }
        // Objects and Arrays must be tested recursively
    }

    for (const p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
            return false;
        }
        // allows x[ p ] to be set to undefined
    }

    return true;
}

export function setValueToPath(obj: any, value: any, path: string) {
    const pathArr = path.split(".");
    let i;
    for (i = 0; i < pathArr.length - 1; i++) {
        if (!obj[pathArr[i]]) {
            // path does not exist, create empty object
            obj[pathArr[i]] = {};
        }
        if (typeof obj[pathArr[i]] !== "object") {
            // handle the case where we have {a: 1} and we call set({a: {aa: 2}})
            obj[pathArr[i]] = {};
        }
        obj = obj[pathArr[i]];
    }
    obj[pathArr[i]] = value;
}

export function isSubset(superObj: any, subObj: any): boolean {
    return Object.keys(subObj).every((ele) => {
        if (typeof subObj[ele] === "object") {
            return isSubset(superObj?.[ele] || {}, subObj[ele] || {});
        }
        return subObj[ele] === superObj?.[ele];
    });
}

function deletePath(obj: any, path: string) {
    const pathArr = path.split(".");
    let i;
    for (i = 0; i < pathArr.length - 1; i++) {
        if (!obj[pathArr[i]]) {
            // path does not exist, we're not removing anything
            return;
        }
        obj = obj[pathArr[i]];
    }
    delete obj[pathArr[i]];
}
