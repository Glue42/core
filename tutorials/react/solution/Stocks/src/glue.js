import { SET_CLIENT_METHOD, SET_PRICES_STREAM, SHARED_CONTEXT_NAME } from './constants';

export const openStockDetails = glue => symbol => {
    glue.windows.open(
        `StockDetailsReact${Math.random().toFixed(2) * 100}`,
        `http://${window.location.host}/details`,
        { top: 100, left: 100, height: 660, width: 660, context: { symbol } }
    );
};

export const getMyWindowContext = glue => glue.windows.my().context;

export const registerSetClientMethod = setClient => glue => {
    glue.interop.register(SET_CLIENT_METHOD, setClient);
};

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

export const setClientPortfolioSharedContext = glue => ({
    clientId = '',
    clientName = '',
    portfolio = '',
}) => {
    glue.contexts.update(SHARED_CONTEXT_NAME, { clientId, clientName, portfolio });
};

export const subscribeForSharedContext = handler => glue => {
    glue.contexts.subscribe(SHARED_CONTEXT_NAME, handler);
};
