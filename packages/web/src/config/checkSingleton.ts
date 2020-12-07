/* eslint-disable @typescript-eslint/no-explicit-any */
export const checkSingleton = (): void => {
    const glue42CoreNamespace = (window as any).glue42core;

    if (!glue42CoreNamespace) {
        (window as any).glue42core = { webStarted: true };
        return;
    }

    if (glue42CoreNamespace.webStarted) {
        throw new Error("The Glue42 Core Web has already been started for this application.");
    }

    glue42CoreNamespace.webStarted = true;
};
