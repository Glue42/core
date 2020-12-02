const testConfig = require('../config.js');

let folderGlob;

const testGroupsCount = testConfig.run.length;

if (testGroupsCount === 0) {
    throw new Error('Please specify folder names containing .spec.js files!');
} else if (testGroupsCount === 1) { // Can't match a single group using { }.
    const onlyGroupName = testConfig.run[0].groupName
    folderGlob = onlyGroupName;
    console.log(`Group name: ${onlyGroupName}`);
} else {
    const groupNames = testConfig.run.map((group) => group.groupName);
    folderGlob = `{${groupNames.join(',')}}`;
    console.log(`Group names: ${groupNames}`);
}

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
                timeout: 20000
            },
            captureConsole: true
        },
        files: [
            {
                pattern: 'packages/web/dist/web.umd.js'
            },
            {
                pattern: 'packages/workspaces-api/dist/workspaces.umd.js'
            },
            {
                pattern: 'e2e/config/gtf.js'
            },
            `e2e/tests/${folderGlob}/**/*.spec.js`
        ],
        port: 9999,
        singleRun: true,
        concurrency: Infinity,
        proxies: {
            '/': 'http://localhost:4242/'
        }
    });
};
