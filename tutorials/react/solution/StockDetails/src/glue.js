import {
    SET_PRICES_STREAM,
} from './constants';

export const getMyWindowContext = setWindowContext => glue => {
    const myWindow = glue.windows.my();
    myWindow.getContext()
        .then(context => {
            setWindowContext({ symbol: context.stock });
        })
    myWindow.onContextUpdated(context => {
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
