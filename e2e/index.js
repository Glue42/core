const { spawn } = require('child_process');
const kill = require('tree-kill');
const path = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http');
const rimraf = require('rimraf');
const config = require('./config');
const {
    PATH_TO_KARMA_CONFIG,
    PATH_TO_TEST_DIR,
    PATH_TO_TEST_COLLECTION_DIR,
    PATH_TO_APPS_DIR,
    HTTP_SERVER_PORT,
    WARN_TIMES_TO_RUN
} = require('./constants');
const startWorkspacesServer = require("./workspacesServer");

const karmaConfigPath = path.resolve(process.cwd());
const npxCommand = os.type() === 'Windows_NT' ? 'npx.cmd' : 'npx';
const runningProcesses = [];
let httpServer;
let wspServer;

const deleteTestCollectionDir = () => {
    rimraf.sync(PATH_TO_TEST_COLLECTION_DIR);
};

const cleanUp = () => {
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
};

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
            fs.readFile(`${PATH_TO_APPS_DIR}${req.url}`, (error, data) => {
                if (error) {
                    res.writeHead(404);
                    res.end(JSON.stringify(error));
                } else {
                    res.writeHead(200);
                    res.end(data);
                }
            });
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
        spawnedProcess.on('error', () => {
            console.log(`${processName} process error!`);

            process.exit(1);
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
    karma.on('exit', () => {
        cleanUp();
    });
    karma.on('error', () => {
        console.log('karma process error!');

        cleanUp();

        process.exit(1);
    });
    return karma;
};

const copyFileAsync = (src, dest) => {
    return new Promise((resolve) => {
        fs.copyFile(src, dest, () => resolve());
    });
};

const copyDirAsync = async (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    fs.mkdirSync(dest);
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDirAsync(srcPath, destPath);
        } else {
            await copyFileAsync(srcPath, destPath);
        }
    }
};

const prepareTestCollection = async () => {
    if (fs.existsSync(PATH_TO_TEST_COLLECTION_DIR)) {
        deleteTestCollectionDir();
    }
    fs.mkdirSync(PATH_TO_TEST_COLLECTION_DIR);

    const groupsWithNameAndTimesToRun = config.run.map(({ groupName, timesToRun }) => {
        if (typeof groupName !== 'string') {
            throw new Error('Please provide groupName as a string!');
        }
        if (typeof timesToRun !== 'undefined' && typeof timesToRun !== 'number') {
            throw new Error('When provided, please make sure timesToRun is a number!');
        }

        return {
            groupName: groupName,
            timesToRun: typeof timesToRun === "undefined" ? 1 : timesToRun
        };
    });

    if (groupsWithNameAndTimesToRun.some(({ timesToRun }) => timesToRun > WARN_TIMES_TO_RUN)) {
        console.warn('Please note that running a test group too many times could cause file system problems as the tests are being copied.');
    }

    const groupNames = groupsWithNameAndTimesToRun.map((groupWithNameAndTimesToRun) => groupWithNameAndTimesToRun.groupName);
    if (groupNames.length > new Set(groupNames).size) {
        throw new Error('Multiple groups have the same name. Make sure to provide groups with unique names. If you want to run a certain group multiple times use the timesToRun property.');
    }

    console.log(`Group names: ${groupsWithNameAndTimesToRun.map(({ groupName, timesToRun }) => `${groupName} (x${timesToRun})`).join('; ')}`);

    const prepareTestCollectionPromise = Promise.all([groupsWithNameAndTimesToRun.map(({ groupName, timesToRun }) => {
        const copyDirPromises = [];

        for (let i = 0; i < timesToRun; i++) {
            copyDirPromises.push(copyDirAsync(`${PATH_TO_TEST_DIR}${groupName}`, `${PATH_TO_TEST_COLLECTION_DIR}${groupName}-${i}`))
        }

        return copyDirPromises;
    })]);

    await prepareTestCollectionPromise;
};

const startProcessController = async () => {
    try {
        [httpServer, wspServer] = await Promise.all([runHttpServer(), startWorkspacesServer(), runConfigProcesses(), prepareTestCollection()]);

        spawnKarmaServer();
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
