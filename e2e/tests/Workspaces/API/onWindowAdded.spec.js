// should return a promise, which resolves with a function

// by opening a workspace
    // should notify when a window was added
    // should notify with a valid workspace window when a window was added
    // should notify twice when the restored workspace was two windows
    // should notify twice when restoring two workspaces with one window each
    // the provided workspace window should have correct workspace id and frame id
    // the loaded window should exist in the workspace windows collection by appName

// already opened workspace
    // should notify when a window was added
    // should notify with a valid workspace window when a window was added
    // the provided workspace window should have correct workspace id and frame id
    // the loaded window should exist in the workspace windows collection by appName

// should not notify when immediately unsubscribed
// should not notify when unsubscribing after receiving notifications
// should reject if the provided parameter is not a function