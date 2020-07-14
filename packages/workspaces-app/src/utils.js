"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWaitFor = exports.getElementBounds = exports.getAllWindowsFromConfig = exports.idAsString = void 0;
exports.idAsString = (id) => Array.isArray(id) ? id[0] : id;
exports.getAllWindowsFromConfig = (contents = []) => {
    const recursiveElementTraversal = (currItem) => {
        if (currItem.type === "component") {
            return currItem.id ? [currItem] : [];
        }
        return currItem.content.reduce((acc, currContent) => {
            acc = [...acc, ...recursiveElementTraversal(currContent)];
            return acc;
        }, []);
    };
    return contents.reduce((acc, ci) => {
        return [...acc, ...recursiveElementTraversal(ci)];
    }, []);
};
exports.getElementBounds = (element) => {
    const rawBounds = $(element)[0].getBoundingClientRect();
    return {
        x: Math.round(rawBounds.x),
        y: Math.round(rawBounds.y),
        left: Math.round(rawBounds.left),
        top: Math.round(rawBounds.top),
        width: Math.round(rawBounds.width),
        height: Math.round(rawBounds.height),
    };
};
exports.createWaitFor = (signalsToWait, timeout) => {
    let resolve;
    let reject;
    let signals = 0;
    const t = setTimeout(() => {
        reject();
    }, timeout || 10000);
    const signal = () => {
        signals++;
        if (signals >= signalsToWait) {
            clearTimeout(t);
            resolve();
        }
    };
    const rejectWaitFor = (e) => {
        clearTimeout(t);
        reject(e);
    };
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        reject: rejectWaitFor,
        signal,
        promise
    };
};
//# sourceMappingURL=utils.js.map