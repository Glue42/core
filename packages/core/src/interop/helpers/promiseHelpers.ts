export const waitFor = async (ms: number = 0, callback: () => void) => {
    await resolveAfter(ms);
    callback();
};

export function resolveAfter<T>(ms: number = 0, result?: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(result), ms));
}

export function rejectAfter<T>(ms: number = 0, error?: T): Promise<T> {
    return new Promise((resolve, reject) => setTimeout(() => reject(error), ms));
}
