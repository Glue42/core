const http = require('http');

const waitForServer = ({ pollingInterval = 100, pollingTimeout = 1000, ...httpOptions }) => () => {
    const maxRequests = Math.floor(pollingTimeout / pollingInterval);
    let reqCounter = 0;

    return new Promise((resolve, reject) => {
        const pingServer = () => {
            if (reqCounter >= maxRequests) {
                return reject('Failed to connect to server!');
            }
            const req = http.request(httpOptions, (res) => {
                if (res.statusCode === 200) {
                    return resolve();
                }

                reject(`Server responded with status code: ${res.statusCode}`);
            });
            req.on('error', () => {
                console.log('Request timeout...');
                ++reqCounter;
                setTimeout(pingServer, pollingInterval);
            });
            req.end();
        };

        pingServer();
    });
};

module.exports = waitForServer;
