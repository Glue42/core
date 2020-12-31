const setFields = (client) => {

    const elementName = document.querySelectorAll("[data-name]")[0];
    elementName.innerText = client.name;

    const elementAddress = document.querySelectorAll("[data-address]")[0];
    elementAddress.innerText = client.address;

    const elementPhone = document.querySelectorAll("[data-phone]")[0];
    elementPhone.innerText = client.contactNumbers;

    const elementOccupation = document.querySelectorAll("[data-email]")[0];
    elementOccupation.innerText = client.email;

    const elementManager = document.querySelectorAll("[data-manager]")[0];
    elementManager.innerText = client.accountManager;
};

// TODO: Chapter 2
// const toggleGlueAvailable = () => {
//     const span = document.getElementById("glueSpan");
//     span.classList.remove("label-warning");
//     span.classList.add("label-success");
//     span.textContent = "Glue42 is available";
// };

const start = async () => {
    // TODO: Chapter 2

    // TODO: Chapter 8.5
};

start().catch(console.error);