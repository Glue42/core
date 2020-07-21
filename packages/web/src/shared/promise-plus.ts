export const promisePlus = <T>(promise: () => Promise<T>, timeoutMilliseconds: number, timeoutMessage?: string): Promise<T> => {
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
