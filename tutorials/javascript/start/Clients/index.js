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

// TODO: Chapter 2
// const toggleGlueAvailable = () => {
//     const span = document.getElementById('glueSpan');
//     span.classList.remove('label-warning');
//     span.classList.add('label-success');
//     span.textContent = 'Glue42 is available';
// };

const clientClickedHandler = (client) => {
    // TODO: Chapter 3.2

    // TODO: Chapter 3.3

    // TODO: Chapter 5.1

    // TODO: Chapter 6.3

    // TODO: Chapter 7.3
};

const start = async () => {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }

    const clientsResponse = await fetch('http://localhost:8080/api/clients');

    const clients = await clientsResponse.json();

    setupClients(clients);

    // TODO: Chapter 2

    // TODO: Chapter 6.2

    // TODO: Chapter 8.3
};

start().catch(console.error);