/* eslint-disable no-undef */
const setFields = (stock) => {

    const elementTitle = document.querySelector(".text-center");
    elementTitle.innerText = `Stock Details ${stock.RIC}`;

    const elementRIC = document.querySelectorAll("[data-ric]")[0];
    elementRIC.innerText = stock.RIC;

    const elementBPOD = document.querySelectorAll("[data-bpod]")[0];
    elementBPOD.innerText = stock.BPOD;

    const elementBloomberg = document.querySelectorAll("[data-bloomberg]")[0];
    elementBloomberg.innerText = stock.Bloomberg;

    const elementDescription = document.querySelectorAll("[data-description]")[0];
    elementDescription.innerText = stock.Description;

    const elementExchange = document.querySelectorAll("[data-exchange]")[0];
    elementExchange.innerText = stock.Exchange;

    const elementVenues = document.querySelectorAll("[data-venues]")[0];
    elementVenues.innerText = stock.Venues;

    updateStockPrices(stock.Bid, stock.Ask);
};

const updateStockPrices = (bid, ask) => {
    const elementBid = document.querySelectorAll("[data-bid]")[0];
    elementBid.innerText = bid;

    const elementAsk = document.querySelectorAll("[data-ask]")[0];
    elementAsk.innerText = ask;
};

const toggleGlueAvailable = () => {
    const span = document.getElementById("glueSpan");
    span.classList.remove("label-warning");
    span.classList.add("label-success");
    span.textContent = "Glue42 is available";
};

// const updateClientStatus = (client, stock) => {

//     const message = client.portfolio.includes(stock.RIC) ?
//         `${client.name} has this stock in the portfolio` :
//         `${client.name} does NOT have this stock in the portfolio`;

//     const elementTitle = document.getElementById("clientStatus");
//     elementTitle.innerText = message;
// };

const start = async () => {
    window.glue = await window.GlueWeb();
    toggleGlueAvailable();

    const subscription = await window.glue.interop.subscribe("LivePrices");
    subscription.onData((streamData) => {
        if (!selectedStock) {
            return;
        }
        const newPrices = streamData.data.stocks;
        const selectedStockPrice = newPrices.find((prices) => prices.RIC === selectedStock.RIC);
        updateStockPrices(selectedStockPrice.Bid, selectedStockPrice.Ask);
    });

    const context = await glue.windows.my().getContext();
    let selectedStock;

    if (context && context.stock) {
        selectedStock = context.stock;
        setFields(selectedStock);
    }

    glue.windows.my().onContextUpdated((ctx) => {
        if (ctx.stock) {
            selectedStock = ctx.stock;
            setFields(selectedStock);
        }
    });

    // const stock = await window.glue.windows.my().getContext();

    // const stock = await window.glue.appManager.myInstance.getContext();

    // setFields(stock);

    // const subscription = await window.glue.interop.subscribe("LivePrices");

    // subscription.onData((streamData) => {
    //     const newPrices = streamData.data.stocks;
    //     const selectedStockPrice = newPrices.find((prices) => prices.RIC === stock.RIC);
    //     updateStockPrices(selectedStockPrice.Bid, selectedStockPrice.Ask);
    // });

    // window.glue.contexts.subscribe("SelectedClient", (client) => {
    //     updateClientStatus(client, stock);
    // });
};

start().catch(console.error);