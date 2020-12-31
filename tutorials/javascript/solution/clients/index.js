/* eslint-disable no-undef */
const setupClients = (clients) => {
    const table = document.getElementById("clientsTable").getElementsByTagName("tbody")[0];

    const addRowCell = (row, cellData, cssClass) => {

        const cell = document.createElement("td");

        cell.innerText = cellData;

        if (cssClass) {
            cell.className = cssClass;
        }
        row.appendChild(cell);
    };

    const addRow = (table, client) => {
        const row = document.createElement("tr");
        addRowCell(row, client.name || "");
        addRowCell(row, client.pId || "");
        addRowCell(row, client.gId || "");
        addRowCell(row, client.accountManager || "");

        row.onclick = () => {
            clientClickedHandler(client);
        };
        table.appendChild(row);
    };

    clients.forEach((client) => {
        addRow(table, client);
    });
};

const toggleGlueAvailable = () => {
    const span = document.getElementById("glueSpan");
    span.classList.remove("label-warning");
    span.classList.add("label-success");
    span.textContent = "Glue42 is available";
};

const clientClickedHandler = (client) => {
    // const selectClientStocks = window.glue.interop.methods().find((method) => method.name === "SelectClient");

    // if (selectClientStocks) {
    //     window.glue.interop.invoke(selectClientStocks, { client });
    // }

    // window.glue.contexts.update("SelectedClient", client).catch(console.error);

    // Update the context of the current channel with the newly selected client portfolio.
    // const myChannel = window.glue.channels.my();

    // if (myChannel) {
    //     window.glue.channels.publish(client).catch(console.error);
    // }

    // const isStocksRunning = window.glue.appManager.application("Stocks").instances.length > 0;

    // if (!isStocksRunning) {
    //     window.glue.appManager.application("Stocks").start({ channel: myChannel }).catch(console.error);
    // }

    glue.workspaces.restoreWorkspace("Client Space", { context: { client } }).catch(console.error);
};

// let counter = 1;

// const stocksButtonHandler = () => {
    // const instanceID = sessionStorage.getItem("counter");

    // TODO: Chapter 3.1
    // const windowName = `Stocks-${instanceID || counter}`;
    // const URL = "http://localhost:9100/";

    // glue.windows.open(windowName, URL).catch(console.error);

    // counter++;
    // sessionStorage.setItem("counter", counter);

    // TODO: Chapter 7.2

    // const stocksApp = glue.appManager.application("Stocks");
    // const currentChannel = glue.channels.my();
    //
    // stocksApp.start({ channel: currentChannel }).catch(console.error);
// };

const start = async () => {

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js");
    }

    const clientsResponse = await fetch("http://localhost:8080/api/clients");

    const clients = await clientsResponse.json();

    setupClients(clients);

    // const stocksButton = document.getElementById("stocks-btn");

    // stocksButton.onclick = stocksButtonHandler;

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
    };

    const applications = {
        local: [
            {
                name: "Clients",
                details: {
                    url: "http://localhost:9000/"
                }
            },
            {
                name: "Stocks",
                details: {
                    url: "http://localhost:9100/",
                    left: 0,
                    top: 0,
                    width: 860,
                    height: 600
                },
                customProperties: {
                    includeInWorkspaces: true
                }
            },
            {
                name: "Stock Details",
                details: {
                    url: "http://localhost:9100/details",
                    left: 100,
                    top: 100,
                    width: 400,
                    height: 400
                },
                customProperties: {
                    includeInWorkspaces: true
                }
            },
            {
                name: "Client Details",
                details: {
                    url: "http://localhost:9200/"
                },
                customProperties: {
                    includeInWorkspaces: true
                }
            }
        ]
    };

    const layouts = {
        mode: "idb",
        local: [
            {
                name: "Client Space",
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
                                                                title: "Client Details"
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
                                                                        title: "Stocks"
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
                                name: "Client Space",
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
        glue: { libraries: [window.GlueWorkspaces] },
        workspaces: { src: "http://localhost:9300/" },
        channels,
        applications,
        layouts
    };

    const { glue } = await GlueWebPlatform(config);
    window.glue = glue;

    toggleGlueAvailable();

    // // The value that will be displayed inside the channel selector widget to leave the current channel.
    // const NO_CHANNEL_VALUE = "No channel";

    // // Get the channel names and colors using the Channels API.
    // const channelContexts = await window.glue.channels.list();
    // const channelNamesAndColors = channelContexts.map(channelContext => ({
    //     name: channelContext.name,
    //     color: channelContext.meta.color
    // }));

    // const onChannelSelected = (channelName) => {
    //     if (channelName === NO_CHANNEL_VALUE) {
    //         if (window.glue.channels.my()) {
    //             window.glue.channels.leave().catch(console.error);
    //         }
    //     } else {
    //         window.glue.channels.join(channelName).catch(console.error);
    //     }
    // };

    // createChannelSelectorWidget(
    //     NO_CHANNEL_VALUE,
    //     channelNamesAndColors,
    //     onChannelSelected
    // );
};

start().catch(console.error);