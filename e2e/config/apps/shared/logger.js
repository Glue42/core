const loggerMethodName = 'G42Core.E2E.Logger';

const patchLogMessages = () => {
    const stringifyMessages = (messages) => {
        return messages.map((message) => {
            let stringifiedMessage = message;

            if (typeof message === 'object') {
                try {
                    stringifiedMessage = JSON.stringify(message);
                }
                catch (error) {
                    stringifiedMessage = 'Failed to stringify message (most likely a circular structure).';
                }
            }

            return stringifiedMessage;
        });
    };

    const log = (stringifiedMessages, type) => {
        // Handle the case when console.log, etc. are called before glue is initialized.
        if (typeof glue !== 'undefined') {
            glue.interop.invoke(loggerMethodName, { message: stringifiedMessages, type });
        }
    };

    const oldConsoleLog = console.log;
    const oldConsoleWarn = console.warn;
    const oldConsoleError = console.error;

    console.log = (...args) => {
        log(stringifyMessages(args), 'log');
        oldConsoleLog(...args);
    };

    console.warn = (...args) => {
        log(stringifyMessages(args), 'warn');
        oldConsoleWarn(...args);
    };

    console.error = (...args) => {
        log(stringifyMessages(args), 'error');
        oldConsoleError(...args);
    };

    const callback = (event) => {
        console.warn(event);
    };
    window.addEventListener('unhandledrejection', callback);
    window.addEventListener('error', callback);
};

patchLogMessages();
