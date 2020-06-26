const testConfig = require('../config.json');

let folderGlob;
if (testConfig.run.length === 0) {
    throw new Error('Please specify folder names containing .spec.js files');
} else if (testConfig.run.length > 1) {
    folderGlob = `{${testConfig.run.join(',')}}`;
} else {
    folderGlob = testConfig.run[0];
}

module.exports = function (config) {
    config.set({
        frameworks: ["mocha", "chai"],
        browsers: ["ChromeHeadless"],
        reporters: ["progress"],
        basePath: process.cwd(),
        colors: true,
        client: {
            mocha: {
                timeout: 20000
            }
        },
        files: [
            `e2e/tests/${folderGlob}/**/*.spec.js`,
            {
                pattern: 'e2e/config/glue/web.umd.js'
            },
            {
                pattern: 'e2e/config/glue/gtf.js'
            }
        ],
        port: 9999,
        singleRun: true,
        concurrency: Infinity,
        proxies: {
            '/': 'http://localhost:4242/'
        },
    });
};