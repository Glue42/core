const channelsConfig = {
    definitions: [
        {
            name: "Red",
            meta: {
                color: "red"
            },
            data: {}
        },
        {
            name: "Green",
            meta: {
                color: "green"
            },
            data: {}
        },
        {
            name: "Blue",
            meta: {
                color: "blue"
            },
            data: {}
        },
        {
            name: "Pink",
            meta: {
                color: "pink"
            },
            data: {}
        },
        {
            name: "Yellow",
            meta: {
                color: "yellow"
            },
            data: {}
        }
    ]
};

const localApplicationsConfig = [
    {
        name: "Karma",
        type: "window",
        details: {
            url: "http://localhost:9999"
        }
    },
    {
        name: "noGlueApp",
        type: "window",
        details: {
            url: "http://localhost:4242/noGlueApp/index.html"
        }
    },
    {
        name: "dummyApp",
        type: "window",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
        }
    },
    {
        name: "noGlueApp",
        type: "window",
        details: {
            url: "http://localhost:4242/noGlueApp/index.html"
        }
    },
    {
        name: "coreSupport",
        type: "window",
        details: {
            url: "http://localhost:4242/coreSupport/index.html"
        },
        intents: [
            {
                name: "core-intent",
                displayName: "core-intent-displayName",
                contexts: [
                    "test-context"
                ]
            }
        ]
    },
    {
        name: "Test",
        type: "window",
        details: {
            url: "https://glue42.com"
        }
    },
    {
        name: "AppWithDetails-local",
        type: "window",
        title: "AppWithDetails-title",
        version: "AppWithDetails-version",
        icon: "AppWithDetails-icon",
        caption: "AppWithDetails-caption",
        details: {
            url: "https://glue42.com/",
            context: {
                b: 98
            },
            width: 400,
            height: 400,
            top: 100,
            left: 100
        },
        customProperties: {
            a: 97
        },
        intents: [
            {
                name: "AppWithDetails-local-intent",
                displayName: "AppWithDetails-local-intent-displayName",
                contexts: [
                    "test-context"
                ]
            }
        ]
    },
    {
        name: "FDC3App-top-level-url",
        appId: "FDC3App-top-level-url",
        manifestType: "Test-top-level-url",
        manifest: "{\"url\":\"https://glue42.com/\"}",
        intents: [
            {
                name: "FDC3App-top-level-url-intent",
                displayName: "FDC3App-top-level-url-intent-displayName",
                contexts: [
                    "test-context"
                ]
            }
        ]
    },
    {
        name: "FDC3App-url-inside-of-top-level-details",
        appId: "FDC3App-url-inside-of-top-level-details",
        manifestType: "Url-inside-of-top-level-details",
        manifest: "{\"details\":{\"url\":\"https://tick42.com/\"}}"
    }
];

const workspacesConfig = {
    // TODO: Add building and serving the Workspaces application to the e2e script.
    src: "http://localhost:7654"
};

const gatewayConfig = {
    logging: {
        level: "error"
    }
};

const layoutsConfig = {
    mode: "session"
};

if (typeof global === "undefined") {
    window.channelsConfig = channelsConfig;
    window.localApplicationsConfig = localApplicationsConfig;
    window.workspacesConfig = workspacesConfig;
    window.gatewayConfig = gatewayConfig;
    window.layoutsConfig = layoutsConfig;
} else {
    module.exports = {
        channelsConfig,
        localApplicationsConfig,
        workspacesConfig,
        gatewayConfig,
        layoutsConfig
    };
}
