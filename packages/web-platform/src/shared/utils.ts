/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import deepEqual from "deep-equal";

export const getRelativeBounds = (rect: Glue42Web.Windows.Bounds, relativeTo: Glue42Web.Windows.Bounds, relativeDirection: Glue42Web.Windows.RelativeDirection): Glue42Web.Windows.Bounds => {
    const edgeDistance = 0;

    if (relativeDirection === "bottom") {
        return {
            left: relativeTo.left,
            top: relativeTo.top + relativeTo.height + edgeDistance,
            width: relativeTo.width,
            height: rect.height
        };
    }

    if (relativeDirection === "top") {
        return {
            left: relativeTo.left,
            top: relativeTo.top - rect.height - edgeDistance,
            width: relativeTo.width,
            height: rect.height
        };
    }

    if (relativeDirection === "right") {
        return {
            left: relativeTo.left + relativeTo.width + edgeDistance,
            top: relativeTo.top,
            width: rect.width,
            height: relativeTo.height
        };
    }

    if (relativeDirection === "left") {
        return {
            left: relativeTo.left - rect.width - edgeDistance,
            top: relativeTo.top,
            width: rect.width,
            height: relativeTo.height
        };
    }

    throw new Error("invalid relativeDirection");
};

export const objEqual = (objOne: object, objTwo: object): boolean => deepEqual(objOne, objTwo, { strict: true });

export const waitFor = (invocations: number, callback: () => any): () => void => {
    let left = invocations;
    return (): void => {
        left--;

        if (left === 0) {
            callback();
        }
    };
};
