/* eslint-disable @typescript-eslint/no-explicit-any */

export const PromiseWrap = <T>(promise: () => Promise<T>, timeoutMilliseconds: number, timeoutMessage?: string): Promise<T> => {
    return new Promise<T>((resolve, reject) => {

        let promiseActive = true;

        const timeout = setTimeout(() => {
            if (!promiseActive) {
                return;
            }
            promiseActive = false;
            const message = timeoutMessage || `Promise timeout hit: ${timeoutMilliseconds}`;

            reject(message);
        }, timeoutMilliseconds);

        promise()
            .then((result) => {
                if (!promiseActive) {
                    return;
                }
                promiseActive = false;
                clearTimeout(timeout);
                resolve(result);
            })
            .catch((error) => {
                if (!promiseActive) {
                    return;
                }
                promiseActive = false;
                clearTimeout(timeout);
                reject(error);
            });
    });
};

export const PromisePlus = <T>(executor: (resolve: (value?: T | PromiseLike<T> | undefined) => void, reject: (reason?: any) => void) => void, timeoutMilliseconds: number, timeoutMessage?: string): Promise<T> => {

    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {

            const message = timeoutMessage || `Promise timeout hit: ${timeoutMilliseconds}`;

            reject(message);
        }, timeoutMilliseconds);

        const providedPromise = new Promise<T>(executor);

        providedPromise
            .then((result) => {
                clearTimeout(timeout);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timeout);
                reject(error);
            });
    });

};
