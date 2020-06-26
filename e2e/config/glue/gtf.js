/* eslint-disable no-unused-vars */
const glueReady = GlueWeb().then((glue) => window.glue = glue);

const gtfReady = new Promise((resolve) => {
    // wait for init;
    window.gtf = {};
    resolve();
});
