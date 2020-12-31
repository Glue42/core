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

// TODO: Chapter 2
// const toggleGlueAvailable = () => {
//     const span = document.getElementById("glueSpan");
//     span.classList.remove("label-warning");
//     span.classList.add("label-success");
//     span.textContent = "Glue42 is available";
// };

// TODO: Chapter 5.2
// const updateClientStatus = (client, stock) => {

//     const message = client.portfolio.includes(stock.RIC) ?
//         `${client.name} has this stock in the portfolio` :
//         `${client.name} does NOT have this stock in the portfolio`;

//     const elementTitle = document.getElementById("clientStatus");
//     elementTitle.innerText = message;
// };

const start = async () => {
    // TODO: Chapter 2

    // TODO: Chapter 3.3

    setFields(stock);

    // TODO: Chapter 4.4

    // TODO: Chapter 5.2

    // TODO: Chapter 8.6
};

start().catch(console.error);