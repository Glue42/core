export const REQUEST_OPTIONS = {
    headers: { accept: 'application/json' }
};

export const SET_CLIENT_METHOD = {
    name: 'T42.Demo.SetClient',
};

export const SET_PRICES_STREAM = {
    name: 'T42.Demo.SetPrices',
};

export const SHARED_CONTEXT_NAME = 'T42.Demo.Client';

// The value that will be displayed as an option in the channel selector widget when the application has not joined a channel yet.
// The user can select this option from the UI to make the application leave the current channel.
export const NO_CHANNEL_VALUE = 'No channel';
