const { platformMode } = require('../utils');

const isHeadless = true;

const karmaConfig = {
    browsers: platformMode ? [isHeadless ? 'ChromeHeadless' : 'Chrome'] : [],
    frameworks: ['mocha', 'chai'],
    reporters: ['spec'],
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
            pattern: 'packages/web/dist/web.umd.js',
        },
        {
            pattern: 'packages/web-platform/dist/platform.web.umd.js',
        },
        {
            pattern: 'packages/workspaces-api/dist/workspaces.umd.js',
        },
        {
            pattern: 'e2e/config/gtf.js'
        },
        'e2e/tests/temp-test-collection/**/*.spec.js'
    ],
    port: 9999,
    singleRun: true,
    concurrency: Infinity,
    proxies: {
        '/webPlatform/index.html': 'http://localhost:4242/webPlatform/index.html',
        '/logger.js': 'http://localhost:4242/e2e/config/apps/shared/logger.js',
        '/config.js': 'http://localhost:4242/e2e/config/gtf/config.js',
        '/web.umd.js': 'http://localhost:4242/e2e/config/apps/libs/web.umd.js',
        '/platform.web.umd.js': 'http://localhost:4242/e2e/config/apps/libs/platform.web.umd.js',
        '/workspaces.umd.js': 'http://localhost:4242/e2e/config/apps/libs/workspaces.umd.js'
    }
};

module.exports = {
    isHeadless,
    karmaConfig
};
