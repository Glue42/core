import {
    SET_PRICES_STREAM
} from './constants';

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

export const setClientFromWorkspace = setClient => glue => {
    glue.workspaces.getMyWorkspace()
        .then(myWorkspace => {
            myWorkspace
                .onContextUpdated(context => {
                    if (context) {
                        setClient(context);
                        myWorkspace.setTitle(context.clientName);
                    }
                })
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
