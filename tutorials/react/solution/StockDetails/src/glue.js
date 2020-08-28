import {
    SET_PRICES_STREAM, 
    SHARED_CONTEXT_NAME
} from './constants';

export const getMyWindowContext = setWindowContext => glue => {
    glue.windows.my().onContextUpdated(context => {
        if (context.stock) {
            setWindowContext({ symbol: context.stock });
        }
    })
}

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

export const subscribeForSharedContext = handler => glue => {
    glue.contexts.subscribe(SHARED_CONTEXT_NAME, handler);
};
