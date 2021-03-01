const { spawn } = require('child_process');
const kill = require('tree-kill');
const path = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http');
const config = require('./config');
const { isHeadless } = require('./config/karma.config');
const {
    PATH_TO_KARMA_CONFIG,
    PATH_TO_APPS_DIR,
    HTTP_SERVER_PORT
} = require('./constants');
const startWorkspacesServer = require('./workspacesServer');
const {
    platformMode,
    deleteTestCollectionDir
} = require('./utils');
const basePolling = require('./ready-conditions/base-polling');

const karmaConfigPath = path.resolve(process.cwd());
const npxCommand = os.type() === 'Windows_NT' ? 'npx.cmd' : 'npx';
const runningProcesses = [];
let httpServer;
let wspServer;
let browser;

const cleanUp = async () => {
    // Kill all running processes.
    for (const runningProcess of runningProcesses) {
        if (!runningProcess.killed) {
            kill(runningProcess.pid);
        }
    }

    httpServer.close();
    wspServer.close();

    // Delete the test collection directory.
    deleteTestCollectionDir();

    // Only applicable when platformMode is false.
    if (typeof browser !== 'undefined') {
        await browser.close();
    }
};

const exitWithError = async () => {
    await cleanUp();

    process.exit(1);
};

process.on('SIGINT', async () => {
    await exitWithError();
});

const extractUniqueProcessNames = (testGroups) => {
    return Array.from(testGroups.reduce((uniqueProcessNames, testGroup) => {
        const testGroupProcesses = testGroup.processes;

        if (typeof testGroupProcesses !== 'undefined') {
            uniqueProcessNames.add(...testGroupProcesses);
        }

        return uniqueProcessNames;
    }, new Set()));
};

const mapProcessNamesToProcessDefinitions = (processesDefinitions, processNames) => {
    return processNames.map((processName) => {
        const processDefinition = processesDefinitions.find((processDefinition) => processDefinition.name === processName);

        if (typeof processDefinition === 'undefined') {
            throw new Error(`Process definition not found for process name: ${processName}`);
        }

        return processDefinition;
    });
};

const validateChildProcessStarted = (childProcess) => {
    if (typeof childProcess.pid === 'undefined') {
        throw new Error(`Failed to spawn ${childProcess.name} process!`);
    }
};

const runHttpServer = () => {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const url = req.url;

            const callback = (error, data) => {
                if (error) {
                    res.writeHead(404);
                    res.end(JSON.stringify(error));
                } else {
                    res.writeHead(200);
                    res.end(data);
                }
            };

            // Serve e2e apps.
            if (url.includes('index.html')) {
                fs.readFile(`${PATH_TO_APPS_DIR}${url}`, callback);
            }

            // Serve other static resources e.g. node modules, tests, the built gtf, etc.
            else {
                fs.readFile(`./${url}`, callback);
            }
        })
            .listen(HTTP_SERVER_PORT, () => resolve(server));
    });
};

const runConfigProcesses = async () => {
    const uniqueProcessNames = extractUniqueProcessNames(config.run);
    const processDefinitions = mapProcessNamesToProcessDefinitions(config.processes, uniqueProcessNames);

    await Promise.all(processDefinitions.map((processDefinition) => {
        const processName = processDefinition.name;
        const processArgs = processDefinition.args || [];

        if (!processDefinition.path) {
            throw new Error(`The processes ${processName} does not have a path!`);
        }
        const spawnedProcess = spawn('node', [`${path.resolve(__dirname, processDefinition.path)}`, ...processArgs], {
            stdio: 'inherit'
        });

        validateChildProcessStarted(spawnedProcess);

        spawnedProcess.on('error', async () => {
            console.log(`${processName} process error!`);

            await exitWithError();
        });

        runningProcesses.push(spawnedProcess);

        return (processDefinition.readyCondition || (() => Promise.resolve()))();
    }));
};

const spawnKarmaServer = () => {
    const karma = spawn(npxCommand, ['karma', 'start', PATH_TO_KARMA_CONFIG], {
        cwd: karmaConfigPath,
        stdio: 'inherit'
    });

    validateChildProcessStarted(karma);

    karma.on('exit', async (code) => {
        if (code === 0) {
            await cleanUp();
        } else {
            await exitWithError();
        }
    });
    karma.on('error', async () => {
        console.log('karma process error!');

        await exitWithError();
    });
};

const startProcessController = async () => {
    try {
        [httpServer, wspServer] = await Promise.all([runHttpServer(), startWorkspacesServer(), runConfigProcesses()]);

        spawnKarmaServer();

        if (!platformMode) {
            // Use logger.js instead of the webPlatform/index.html as a resolve condition for when Karma's proxy server is ready as it won't start an additional test run.
            await basePolling({
                hostname: 'localhost',
                port: 9999,
                path: '/logger.js',
                method: 'GET',
                pollingInterval: 100,
                pollingTimeout: 30 * 1000,
                timeout: 2000
            })();

            const puppeteer = require('puppeteer');

            browser = await puppeteer.launch({
                headless: isHeadless,
                args: [
                    '--enable-automation'
                ]
            });
            const page = await browser.newPage();

            await page.goto('http://localhost:9999/webPlatform/index.html');
        }
    } catch (error) {
        console.log(`Failed to start process controller: ${error.message || error}`);

        kill(process.pid);
    }
};

startProcessController();

process.on('unhandledRejection', (reason) => {
    console.log(JSON.stringify(reason));
    kill(process.pid);
});
