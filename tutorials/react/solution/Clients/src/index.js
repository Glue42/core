import React from 'react';
import ReactDOM from 'react-dom';
import { GlueProvider } from '@glue42/react-hooks';
import GlueWorkspaces from '@glue42/workspaces-api';
import GlueWebPlatform from '@glue42/web-platform';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './App.css';
import Clients from './Clients';
import * as serviceWorker from './serviceWorker';

const channels = {
    definitions: [
        {
            name: "Red",
            meta: {
                color: "red"
            }
        },
        {
            name: "Green",
            meta: {
                color: "green"
            }
        },
        {
            name: "Blue",
            meta: {
                color: "#66ABFF"
            }
        },
        {
            name: "Pink",
            meta: {
                color: "#F328BB"
            }
        },
        {
            name: "Yellow",
            meta: {
                color: "#FFE733"
            }
        },
        {
            name: "Dark Yellow",
            meta: {
                color: "#b09b00"
            }
        },
        {
            name: "Orange",
            meta: {
                color: "#fa5a28"
            }
        },
        {
            name: "Purple",
            meta: {
                color: "#c873ff"
            }
        },
        {
            name: "Lime",
            meta: {
                color: "#8af59e"
            }
        },
        {
            name: "Cyan",
            meta: {
                color: "#80f3ff"
            }
        }
    ]
}

const applications = {
    local: [
        {
            name: "Clients",
            details: {
                url: "http://localhost:3000/clients"
            }
        },
        {
            name: "Stocks",
            details: {
                url: "http://localhost:3001/stocks",
                left: 0,
                top: 0,
                width: 860,
                height: 600
            }
        },
        {
            name: "Stock Details",
            details: {
                url: "http://localhost:3002/details",
                left: 100,
                top: 100,
                width: 400,
                height: 400
            }
        },
        {
            name: "Client Details",
            details: {
                url: "http://localhost:3003/client-details"
            }
        }
    ]
}

const layouts = {
    mode: "idb",
    local: [
        {
            name: "example",
            type: "Workspace",
            metadata: {},
            components: [
                {
                    type: "Workspace",
                    state: {
                        children: [
                            {
                                type: "column",
                                children: [
                                    {
                                        type: "row",
                                        children: [
                                            {
                                                type: "group",
                                                children: [
                                                    {
                                                        type: "window",
                                                        config: {
                                                            appName: "Client Details",
                                                            title: "React App",
                                                            context: {}
                                                        }
                                                    }
                                                ],
                                                config: {}
                                            },
                                            {
                                                type: "column",
                                                children: [
                                                    {
                                                        type: "group",
                                                        children: [
                                                            {
                                                                type: "window",
                                                                config: {
                                                                    appName: "Stocks",
                                                                    title: "React App",
                                                                    context: {}
                                                                }
                                                            }
                                                        ],
                                                        config: {}
                                                    }
                                                ],
                                                config: {}
                                            }
                                        ],
                                        config: {}
                                    }
                                ],
                                config: {}
                            }
                        ],
                        config: {
                            name: "example",
                            title: "Untitled 1"
                        },
                        context: {}
                    }
                }
            ]
        }
    ]
}

const config = {
    glue: { libraries: [GlueWorkspaces] },
    workspaces: { src: "http://localhost:9300/" },
    channels,
    applications,
    layouts
};

const settings  = {
    webPlatform: {
        factory: GlueWebPlatform,
        config
    }
}

ReactDOM.render(
    <GlueProvider settings={settings}>
        <Clients />
    </GlueProvider>,
    document.getElementById('root')
);

serviceWorker.register();
