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
    span.textContent = 'Glue is available';
};

const clientClickedHandler = (client) => {
    // const selectClientStocks = window.glue.interop.methods().find((method) => method.name === 'SelectClient');

    // if (selectClientStocks) {
    //     window.glue.interop.invoke(selectClientStocks, { client });
    // }

    window.glue.contexts.update('SelectedClient', client).catch(console.error);
};

const start = async () => {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }

    const clientsResponse = await fetch('http://localhost:8080/api/clients');

    const clients = await clientsResponse.json();

    setupClients(clients);

    window.glue = await GlueWeb();

    toggleGlueAvailable();
};

start().catch(console.error);