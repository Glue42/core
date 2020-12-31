const setFields = (client) => {

    const elementName = document.querySelectorAll('[data-name]')[0];
    elementName.innerText = client.name;

    const elementAddress = document.querySelectorAll('[data-address]')[0];
    elementAddress.innerText = client.address;

    const elementPhone = document.querySelectorAll('[data-phone]')[0];
    elementPhone.innerText = client.contactNumbers;

    const elementOccupation = document.querySelectorAll('[data-email]')[0];
    elementOccupation.innerText = client.email;

    const elementManager = document.querySelectorAll('[data-manager]')[0];
    elementManager.innerText = client.accountManager;
};

const toggleGlueAvailable = () => {
    const span = document.getElementById('glueSpan');
    span.classList.remove('label-warning');
    span.classList.add('label-success');
    span.textContent = 'Glue42 is available';
};

const start = async () => {
    window.glue = await window.GlueWeb({
        libraries: [window.GlueWorkspaces]
    });

    toggleGlueAvailable();

    const myWorkspace = await glue.workspaces.getMyWorkspace();

    if (myWorkspace) {
        myWorkspace.onContextUpdated((ctx) => {
            if (ctx.client) {
                setFields(ctx.client);
                myWorkspace.setTitle(ctx.client.name);
            }
        });
    }
};

start().catch(console.error);