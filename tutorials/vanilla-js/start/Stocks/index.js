const generateStockPrices = (handleNewPrices) => {
    setInterval(() => {

        const priceUpdate = {
            stocks: [
                {
                    RIC: 'VOD.L',
                    Bid: Number(70 - Math.random() * 10).toFixed(2),
                    Ask: Number(70 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'TSCO.L',
                    Bid: Number(90 - Math.random() * 10).toFixed(2),
                    Ask: Number(90 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'BARC.L',
                    Bid: Number(105 - Math.random() * 10).toFixed(2),
                    Ask: Number(105 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'BMWG.DE',
                    Bid: Number(29 - Math.random() * 10).toFixed(2),
                    Ask: Number(29 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'AAL.L',
                    Bid: Number(46 - Math.random() * 10).toFixed(2),
                    Ask: Number(46 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'IBM.N',
                    Bid: Number(70 - Math.random() * 10).toFixed(2),
                    Ask: Number(70 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'AAPL.OQ',
                    Bid: Number(90 - Math.random() * 10).toFixed(2),
                    Ask: Number(90 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'BA.N',
                    Bid: Number(105 - Math.random() * 10).toFixed(2),
                    Ask: Number(105 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'TSLA:OQ',
                    Bid: Number(29 - Math.random() * 10).toFixed(2),
                    Ask: Number(29 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'ENBD.DU',
                    Bid: Number(46 - Math.random() * 10).toFixed(2),
                    Ask: Number(46 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'AMZN.OQ',
                    Bid: Number(29 - Math.random() * 10).toFixed(2),
                    Ask: Number(29 + Math.random() * 10).toFixed(2)
                },
                {
                    RIC: 'MSFT:OQ',
                    Bid: Number(46 - Math.random() * 10).toFixed(2),
                    Ask: Number(46 + Math.random() * 10).toFixed(2)
                }
            ]
        };

        handleNewPrices(priceUpdate);
    }, 1500);
};

const setupStocks = (stocks) => {
    const table = document.getElementById('stocksTable').getElementsByTagName('tbody')[0];

    table.innerHTML = '';
    const addRowCell = (row, cellData, cssClass) => {

        const cell = document.createElement('td');

        cell.innerText = cellData;

        if (cssClass) {
            cell.className = cssClass;
        }
        row.appendChild(cell);
    };

    const addRow = (table, stock) => {
        const row = document.createElement('tr');
        addRowCell(row, stock.RIC || '');
        addRowCell(row, stock.Description || '');
        addRowCell(row, stock.Bid || '');
        addRowCell(row, stock.Ask || '');

        row.setAttribute('data-ric', stock.RIC);

        row.onclick = () => {
            stockClickedHandler(stock);
        };
        table.appendChild(row);
    };

    stocks.forEach((stock) => {
        addRow(table, stock);
    });
};

// TODO: Chapter 2
// const toggleGlueAvailable = () => {
//     const span = document.getElementById('glueSpan');
//     span.classList.remove('label-warning');
//     span.classList.add('label-success');
//     span.textContent = 'Glue is available';
// };

const newPricesHandler = (priceUpdate) => {
    priceUpdate.stocks.forEach((stock) => {
        const row = document.querySelectorAll(`[data-ric='${stock.RIC}']`)[0];

        if (!row) {
            return;
        }

        const bidElement = row.children[2];
        bidElement.innerText = stock.Bid;

        const askElement = row.children[3];
        askElement.innerText = stock.Ask;
    });
};

const stockClickedHandler = (stock) => {
    console.log(stock);
    window.location.href = `http://${window.location.host}/stocks/details/index.html`;
    sessionStorage.setItem('stock', JSON.stringify(stock));
};

const start = async () => {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }

    const stocksResponse = await fetch('http://localhost:8080/api/portfolio');

    const stocks = await stocksResponse.json();

    setupStocks(stocks);

    generateStockPrices(newPricesHandler);

    // TODO: Chapter 2
};

start().catch(console.error);