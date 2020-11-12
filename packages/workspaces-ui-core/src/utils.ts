import GoldenLayout, { Container } from "@glue42/golden-layout";

export const idAsString = (id: string | string[]) => Array.isArray(id) ? id[0] : id;

export const getAllWindowsFromConfig = (contents: GoldenLayout.ItemConfig[] = []): GoldenLayout.ComponentConfig[] => {
    const recursiveElementTraversal = (currItem: GoldenLayout.ItemConfig) => {
        if (currItem.type === "component") {
            return currItem.id ? [currItem] : [];
        }

        return currItem.content.reduce((acc: GoldenLayout.ItemConfig[], currContent: GoldenLayout.ItemConfig) => {
            acc = [...acc, ...recursiveElementTraversal(currContent)];
            return acc;
        }, []);
    };

    return contents.reduce((acc, ci) => {
        return [...acc, ...recursiveElementTraversal(ci)];
    }, []);
};

export const getElementBounds = (element: Element | Container | JQuery<Element>) => {
    const rawBounds = ($(element) as JQuery)[0].getBoundingClientRect();
    return {
        x: Math.round(rawBounds.x),
        y: Math.round(rawBounds.y),
        left: Math.round(rawBounds.left),
        top: Math.round(rawBounds.top),
        width: Math.round(rawBounds.width),
        height: Math.round(rawBounds.height),
    };
};

export const createWaitFor = (signalsToWait: number, timeout?: number) => {
    let resolve: (result?: object) => void;
    let reject: (error?: Error) => void;
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
    const rejectWaitFor = (e: Error) => {
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

export const getWorkspaceContextName = (id: string) => `___workspace___${id}`;
