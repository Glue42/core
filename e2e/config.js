const basePolling = require('./ready-conditions/base-polling');

module.exports = {
    run: [
        {
            groupName: "Example",
            processes: ["exampleServer"]
        },
        {
            groupName: "Play"
        },
        {
            groupName: "channels"
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
                pollingTimeout: 1000
            })
        }
    ]
};
