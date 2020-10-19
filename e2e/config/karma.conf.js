const testConfig = require('../config.js');

let folderGlob;
if (testConfig.run.length === 0) {
    throw new Error('Please specify folder names containing .spec.js files');
} else if (testConfig.run.length > 1) {
    const groupNames = testConfig.run.reduce((groupNames, folderToRun) => {
        groupNames.push(folderToRun.groupName);
        return groupNames;
    }, []);
    folderGlob = `{${groupNames.join(',')}}`;
    console.log('group names', groupNames);
} else {
    folderGlob = testConfig.run[0].groupName;
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
            },
            captureConsole: true
        },
        files: [
            `e2e/tests/${folderGlob}/**/*.spec.js`,
            {
                pattern: 'packages/web/dist/web.umd.js'
            },
            {
                pattern: 'packages/workspaces-api/dist/workspaces.umd.js'
            },
            {
                pattern: 'e2e/config/gtf.js'
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
