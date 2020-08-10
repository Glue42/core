/* eslint-disable no-unused-vars */
const glueReady = GlueWeb({ libraries: [GlueWorkspaces] }).then((glue) => window.glue = glue);

const gtfReady = new Promise((resolve) => {
    let windowNameCounter = 0;
    const waitFor = (num, funcToCall) => {
        let left = num;
        return () => {
            left--;

            if (left === 0) {
                funcToCall();
            }
        };
    };

    const getWindowName = (prefix) => {
        windowNameCounter++;
        return `${prefix}.${Date.now()}.${windowNameCounter}`;
    };

    const getGlueConfigJson = async (url = 'http://localhost:9999/glue/glue.config.json') => {
        const data = await (await fetch(url)).json();

        return data;
    };

    const getChannelNames = async () => {
        const channelContexts = (await getGlueConfigJson()).channels;

        return channelContexts.map((channelContext) => channelContext.name);
    };

    // wait for init;
    window.gtf = {
        waitFor,
        getWindowName,
        getGlueConfigJson,
        getChannelNames
    };

    resolve();
});
