/* eslint-disable no-undef */
const setupClients = (clients) => {
    const table = document.getElementById('clientsTable').getElementsByTagName('tbody')[0];

    const addRowCell = (row, cellData, cssClass) => {

        const cell = document.createElement('td');

        cell.innerText = cellData;

        if (cssClass) {
            cell.className = cssClass;
        }
        row.appendChild(cell);
    };

    const addRow = (table, client) => {
        const row = document.createElement('tr');
        addRowCell(row, client.name || '');
        addRowCell(row, client.pId || '');
        addRowCell(row, client.gId || '');
        addRowCell(row, client.accountManager || '');

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
    const span = document.getElementById('glueSpan');
    span.classList.remove('label-warning');
    span.classList.add('label-success');
    span.textContent = 'Glue42 is available';
};

const clientClickedHandler = (client) => {
    // const selectClientStocks = window.glue.interop.methods().find((method) => method.name === 'SelectClient');

    // if (selectClientStocks) {
    //     window.glue.interop.invoke(selectClientStocks, { client });
    // }

    window.glue.contexts.update('SelectedClient', client).catch(console.error);

    // Update the context of the current channel with the newly selected client portfolio.
    const myChannel = window.glue.channels.my();

    if (myChannel) {
        window.glue.channels.publish(client).catch(console.error);
    }

    const isStocksRunning = window.glue.appManager.application('Stocks').instances.length > 0;

    if (!isStocksRunning) {
        window.glue.appManager.application('Stocks').start({ channel: myChannel }).catch(console.error);
    }
};

const start = async () => {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }

    const clientsResponse = await fetch('http://localhost:8080/api/clients');

    const clients = await clientsResponse.json();

    setupClients(clients);

    window.glue = await window.GlueWeb({
        channels: true,
        appManager: true,
        application: 'Clients'
    });

    toggleGlueAvailable();

    // The value that will be displayed inside the channel selector widget to leave the current channel.
    const NO_CHANNEL_VALUE = 'No channel';

    // Get the channel names and colors using the Channels API.
    const channelContexts = await window.glue.channels.list();
    const channelNamesAndColors = channelContexts.map(channelContext => ({
        name: channelContext.name,
        color: channelContext.meta.color
    }));

    const onChannelSelected = (channelName) => {
        if (channelName === NO_CHANNEL_VALUE) {
            if (window.glue.channels.my()) {
                window.glue.channels.leave().catch(console.error);
            }
        } else {
            window.glue.channels.join(channelName).catch(console.error);
        }
    };

    createChannelSelectorWidget(
        NO_CHANNEL_VALUE,
        channelNamesAndColors,
        onChannelSelected
    );
};

start().catch(console.error);
