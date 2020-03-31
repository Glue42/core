/* eslint-disable @typescript-eslint/no-explicit-any */
export const httpMock = {
    createServer: (): { on: () => void } => {
        console.log("calling create server");
        return {
            on: (): void => console.log("calling on server")
        };
    }
};

export const httpProxyMock = {
    createProxyServer: (): { on: () => void; ws: () => void; web: () => void } => {
        console.log("calling create proxy server");
        return {
            on: (): void => console.log("calling on proxy"),
            ws: (): void => console.log("calling ws proxy"),
            web: (): void => console.log("calling web proxy")
        };
    }
};

const expressMock = (): { get: () => void; use: () => void } => {
    console.log("calling express");
    return {
        get: (): void => console.log("calling on server"),
        use: (): void => console.log("calling use server")
    };
};

expressMock.static = (): void => console.log("calling static");

export { expressMock };

export const requestMock = {
    get: (): { pipe: () => void } => {
        console.log("calling request get");
        return {
            pipe: (): void => console.log("calling pipe of request")
        };
    }
};

export const concatStreamMock = (): void => console.log("calling concat stream");

export const parserMock = {
    parse: (): Promise<any> => {
        return Promise.resolve<any>({
            serverSettings: {
                disableCache: true,
                verboseLogging: true,
            },
            apps: [
                {
                    url: {
                        base: "localhost:3000",
                        path: "/"
                    },
                    route: "/rc"
                },
                {
                    file: {
                        path: "./src"
                    },
                    route: "/ng"
                }
            ],
            glueAssets: {
                sharedWorker: "./"
            }
        });
    }
};

export const processMock = {
    cwd: (): string => {
        console.log("calling process cwd");
        return "C://Users/flash/Desktop/";
    }
};
