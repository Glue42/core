const config = require('../config.js');

module.exports = (config) => {
    config.set({
        frameworks: ["mocha", "chai"],
        browsers: ["ChromeHeadless"],
        reporters: ["spec"],
        specReporter: {
            suppressFailed: false,
            suppressPassed: false,
            suppressSkipped: true
        },
        basePath: process.cwd(),
        colors: true,
        client: {
            mocha: {
                timeout: 10000
            },
            captureConsole: true
        },
        files: [
            {
                pattern: 'packages/web-platform/dist/platform.web.umd.js'
            },
            {
                pattern: 'packages/workspaces-api/dist/workspaces.umd.js'
            },
            {
                pattern: 'e2e/config/gtf.js'
            },
            `e2e/tests/temp-test-collection/**/*.spec.js`
        ],
        port: 9999,
        singleRun: true,
        concurrency: Infinity
    });
};
