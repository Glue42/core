const basePolling = require('./ready-conditions/base-polling');

module.exports = {
    run: [
        {
            groupName: "contexts"
        },
        {
            groupName: "interop"
        },
        {
            groupName: "channels"
        },
        {
            groupName: "app-manager",
            processes: ["remoteSource"]
        }
    ],
    processes: [
        {
            name: "exampleServer",
            path: "./testServer/exampleServer.js",
            args: ['first', 'second', 'third'],
            readyCondition: basePolling({
                hostname: 'localhost',
                port: 7777,
                path: '/',
                method: 'GET',
                pollingInterval: 100,
                pollingTimeout: 30 * 1000
            })
        },
        {
            name: "remoteSource",
            path: "./remote-source/index.js",
            readyCondition: basePolling({
                hostname: 'localhost',
                port: 9998,
                path: '/v1/apps/search',
                method: 'GET',
                pollingInterval: 100,
                pollingTimeout: 30 * 1000
            })
        }
    ]
};
