export const promisePlus = <T>(promise: () => Promise<T>, timeoutMilliseconds: number, timeoutMessage?: string): Promise<T> => {
    return new Promise<T>((resolve, reject) => {

        const timeout = setTimeout(() => {

            const message = timeoutMessage || `Promise timeout hit: ${timeoutMilliseconds}`;

            reject(message);
        }, timeoutMilliseconds);

        promise()
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
