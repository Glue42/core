import { SET_CLIENT_METHOD, SHARED_CONTEXT_NAME } from './constants';


export const setClientPortfolioInterop = glue => ({ clientId, clientName }) => {
    const isMethodRegistered = glue.interop
        .methods()
        .find(({ name }) => name === SET_CLIENT_METHOD.name);
    if (isMethodRegistered) {
        glue.interop.invoke(SET_CLIENT_METHOD.name, { clientId, clientName });
    }
};

export const setClientPortfolioSharedContext = glue => ({
    clientId = '',
    clientName = '',
    portfolio = '',
}) => {
    glue.contexts.update(SHARED_CONTEXT_NAME, { clientId, clientName, portfolio });
};
