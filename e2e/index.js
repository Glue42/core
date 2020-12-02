const { spawn } = require('child_process');
const kill = require('tree-kill');
const path = require('path');
const os = require('os');

const basePolling = require('./ready-conditions/base-polling');
const testConfig = require('./config');

const gluecConfigPath = path.resolve(process.cwd(), 'e2e', 'config');
const karmaConfigPath = path.resolve(process.cwd());
const npxCommand = os.type() === 'Windows_NT' ? 'npx.cmd' : 'npx';
let controllerProcessExitCode = 0;

const runningProcesses = [];

const killRunningProcesses = () => {
    for (const runningProcess of runningProcesses) {
        if (!runningProcess.killed) {
            kill(runningProcess.pid);
        }
    }
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
    if (typeof childProcess.pid === "undefined") {
        throw new Error(`Failed to spawn ${childProcess.name} process!`);
    }
};

const spawnGluecServer = () => {
    const gluec = spawn(npxCommand, ['@glue42/cli-core', 'serve'], {
        cwd: gluecConfigPath,
        stdio: 'inherit'
    });

    validateChildProcessStarted(gluec);

    gluec.on('exit', () => process.exit(controllerProcessExitCode));
    gluec.on('error', () => {
        console.log('gluec serve process error!');
        process.exit(1)
    });

    return gluec;
};

const runGluecServer = async () => {
    const gluec = spawnGluecServer();
    const gluecReadyCondition = basePolling({
        hostname: 'localhost',
        port: 4242,
        path: '/glue/worker.js',
        method: 'GET',
        pollingInterval: 5 * 1000,
        pollingTimeout: 60 * 1000
    });
    runningProcesses.push(gluec);
    await gluecReadyCondition();
    return gluec;
};

const runConfigProcesses = async () => {
    const uniqueProcessNames = extractUniqueProcessNames(testConfig.run);
    const processDefinitions = mapProcessNamesToProcessDefinitions(testConfig.processes, uniqueProcessNames);

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
    const karma = spawn(npxCommand, ['karma', 'start', './e2e/config/karma.conf.js'], {
        cwd: karmaConfigPath,
        stdio: 'inherit'
    });
    validateChildProcessStarted(karma);
    karma.on('exit', (exitCode) => {
        controllerProcessExitCode = exitCode;

        killRunningProcesses();
    });
    karma.on('error', () => {
        console.log('karma process error!');

        killRunningProcesses();

        process.exit(1);
    });
    return karma;
};

const startProcessController = async () => {
    try {
        await runGluecServer();

        await runConfigProcesses();

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
