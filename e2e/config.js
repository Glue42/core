const basePolling = require('./ready-conditions/base-polling');

module.exports = {
  run: [
    {
      groupName: "Example",
      processes: ["exampleServer"]
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
}
