import {
    SET_PRICES_STREAM, 
    NO_CHANNEL_VALUE
} from './constants';

export const getMyWindowContext = glue => glue.appManager.myInstance.context;

export const createInstrumentStream = glue =>
    glue.interop.createStream(SET_PRICES_STREAM).then(publishInstrumentPrice);

export const publishInstrumentPrice = stream => {
    setInterval(() => {
        const stocks = {
            'VOD.L': {
                Bid: Number(70 - Math.random() * 10).toFixed(2),
                Ask: Number(70 + Math.random() * 10).toFixed(2),
            },
            'TSCO.L': {
                Bid: Number(90 - Math.random() * 10).toFixed(2),
                Ask: Number(90 + Math.random() * 10).toFixed(2),
            },
            'BARC.L': {
                Bid: Number(105 - Math.random() * 10).toFixed(2),
                Ask: Number(105 + Math.random() * 10).toFixed(2),
            },
            'BMWG.DE': {
                Bid: Number(29 - Math.random() * 10).toFixed(2),
                Ask: Number(29 + Math.random() * 10).toFixed(2),
            },
            'AAL.L': {
                Bid: Number(46 - Math.random() * 10).toFixed(2),
                Ask: Number(46 + Math.random() * 10).toFixed(2),
            },
            'IBM.N': {
                Bid: Number(70 - Math.random() * 10).toFixed(2),
                Ask: Number(70 + Math.random() * 10).toFixed(2),
            },
            'AAPL.OQ': {
                Bid: Number(90 - Math.random() * 10).toFixed(2),
                Ask: Number(90 + Math.random() * 10).toFixed(2),
            },
            'BA.N': {
                Bid: Number(105 - Math.random() * 10).toFixed(2),
                Ask: Number(105 + Math.random() * 10).toFixed(2),
            },
            'TSLA:OQ': {
                Bid: Number(29 - Math.random() * 10).toFixed(2),
                Ask: Number(29 + Math.random() * 10).toFixed(2),
            },
            'ENBD.DU': {
                Bid: Number(46 - Math.random() * 10).toFixed(2),
                Ask: Number(46 + Math.random() * 10).toFixed(2),
            },
            'AMZN.OQ': {
                Bid: Number(29 - Math.random() * 10).toFixed(2),
                Ask: Number(29 + Math.random() * 10).toFixed(2),
            },
            'MSFT:OQ': {
                Bid: Number(46 - Math.random() * 10).toFixed(2),
                Ask: Number(46 + Math.random() * 10).toFixed(2),
            },
        };
        stream.push(stocks);
    }, 1500);
};

export const subscribeForInstrumentStream = handler => async (glue, symbol) => {
    if (symbol) {
        const subscription = await glue.interop.subscribe(SET_PRICES_STREAM);
        subscription.onData(({ data: stocks }) => {
            if (symbol && stocks[symbol]) {
                handler(stocks[symbol]);
            } else if (Array.isArray(symbol)) {
                handler(stocks);
            }
        });
        subscription.onFailed(console.log);

        return subscription;
    }
};

// Get the channel names and colors using the Channels API.
export const getChannelNamesAndColors = async glue => {
    const channelContexts = await glue.channels.list();
    const channelNamesAndColors = channelContexts.map(channelContext => ({
        name: channelContext.name,
        color: channelContext.meta.color
    }));
    return channelNamesAndColors;
};

// Join the given channel (or leave the current channel if NO_CHANNEL_VALUE is selected).
export const joinChannel = glue => ({ value: channelName }) => {
    if (channelName === NO_CHANNEL_VALUE) {
        if (glue.channels.my()) {
            glue.channels.leave();
        }
    } else {
        glue.channels.join(channelName);
    }
};

// Subscribe for the current channel with the provided callback.
export const subscribeForChannels = handler => glue => {
    glue.channels.subscribe(handler);
};

export const setClientFromWorkspace = setClient => glue => {
    glue.windows.my().onContextUpdated(context => {
        if (context) {
            setClient({ clientId: context.clientId, clientName: context.clientName });
        }
    });
}

export const openStockDetailsInWorkspace = glue => async stock => {
    let detailsGlue42Window;
    const myWorkspace = await glue.workspaces.getMyWorkspace();
    let detailsWorkspaceWindow = myWorkspace.getWindow(window => window.appName === 'Stock Details');
    if (detailsWorkspaceWindow) {
        detailsGlue42Window = detailsWorkspaceWindow.getGdWindow();
    } else {
        const myId = glue.windows.my().id;
        const myImmediateParent = myWorkspace.getWindow(window => window.id === myId).parent;
        const group = await myImmediateParent.parent.addGroup();
        detailsWorkspaceWindow = await group.addWindow({ appName: 'Stock Details' });
        await detailsWorkspaceWindow.forceLoad();
        detailsGlue42Window = detailsWorkspaceWindow.getGdWindow();
    }
    detailsGlue42Window.updateContext({ stock });
}