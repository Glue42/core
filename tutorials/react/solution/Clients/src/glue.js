import { SET_CLIENT_METHOD, SHARED_CONTEXT_NAME, NO_CHANNEL_VALUE } from './constants';


export const setClientPortfolioInterop = glue => ({ clientId, clientName }) => {
    const isMethodRegistered = glue.interop
        .methods()
        .some(({ name }) => name === SET_CLIENT_METHOD.name);
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

// Update the context of the current channel with the newly selected client portfolio.
export const setClientPortfolioChannels = glue => ({
    clientId = '',
    clientName = '',
    portfolio = '',
}) => {
    if (glue.channels.my()) {
        glue.channels.publish({ clientId, clientName, portfolio });
    }
};

export const startApp = glue => () => {
    const isStocksRunning = glue.appManager.application('Stocks').instances.length > 0;
    if (!isStocksRunning) {
        glue.channels.list().then(channels => {
            let channel = {};
            if (glue.channels.my()) {
                const channelDefinition = channels.find(channel => channel.name === glue.channels.my());
                channel = {
                    name: channelDefinition.name,
                    label: channelDefinition.name,
                    color: channelDefinition.meta.color
                };
            } else {
                channel = {
                    name: NO_CHANNEL_VALUE,
                    label: NO_CHANNEL_VALUE
                }
            }
            glue.appManager.application('Stocks').start({ channel });
        });
    }
}

export const startAppWithWorkspace = glue => client => {
    glue.workspaces.restoreWorkspace("example", { context: client });
}