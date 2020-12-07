const basePolling = require('./ready-conditions/base-polling');

module.exports = {
    libPaths: [
        'packages/web/dist/web.umd.js',
        'packages/workspaces-api/dist/workspaces.umd.js'
    ],
    run: [
        // {
        //     groupName: 'Example',
        //     timesToRun: 1,
        //     processes: ['exampleServer']
        // },
        // {
        //     groupName: 'contexts'
        // },
        {
            groupName: 'interop',
            timesToRun: 1
        },
        // {
        //     groupName: 'channels'
        // },
        // {
        //     groupName: 'app-manager',
        //     processes: ['remoteSource']
        // }
    ],
    processes: [
        {
            name: 'exampleServer',
            path: './exampleServer/index.js',
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
            name: 'remoteSource',
            path: './remote-source/index.js',
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
