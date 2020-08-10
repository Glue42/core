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

const processPIDQueue = [];

const extractProcessNames = testConfig => {
    return testConfig.run.reduce((processesNames, folderToRun) => {
        if (folderToRun.processes) {
            processesNames.push(...folderToRun.processes);
        }
        return processesNames;
    }, []);
}

const removeDuplicateNames = processesNames => {
    const processNamesSeen = {};
    return processesNames.filter(processName => {
        if (!processNamesSeen[processName]) {
            processNamesSeen[processName] = true;
            return processName;
        }
    });
}

const sortProcessesByNamesOrder = (processesDefinition, processNames) => {
    return processNames.reduce((processesToSpawn, processName) => {
        const processToSpawn = processesDefinition.find(processDefinition => processDefinition.name === processName);
        if (processToSpawn === undefined) {
            throw new Error(`Process definition not found for process name: ${processName}`);
        }
        processesToSpawn.push(processToSpawn);
        return processesToSpawn;
    }, []);
}

const spawnGluecServer = () => {
    const gluec = spawn(npxCommand, ['@glue42/cli-core', 'serve'], {
        cwd: gluecConfigPath,
        stdio: 'inherit'
    });

    if (gluec.pid === undefined) {
        throw new Error('Could not spawn gluec proces');
    }

    gluec.on('exit', () => process.exit(controllerProcessExitCode));
    gluec.on('error', () => {
        console.log('proccess exit 1 because of gluec error');
        process.exit(1)
    });

    return gluec;
}

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
    await gluecReadyCondition();
    return gluec;
}

const runConfigProcesses = async () => {
    const processNames = extractProcessNames(testConfig);
    const uniqueProcessNames = removeDuplicateNames(processNames);
    const processDefinitions = sortProcessesByNamesOrder(testConfig.processes, uniqueProcessNames);
    while (processDefinitions.length) {
        const currentProcessDef = processDefinitions.shift();
        let currentProcessArgs = [];
        if (currentProcessDef.args) {
            currentProcessArgs = currentProcessDef.args;
        }
        if (!currentProcessDef.path) {
            throw new Error(`The processes ${currentProcessDef.name} does not have a path`);
        }
        const spawnedProcess = spawn('node', [`${path.resolve(__dirname, currentProcessDef.path)}`, ...currentProcessArgs], {
            stdio: 'inherit'
        });
        if (spawnedProcess.pid === undefined) {
            throw new Error(`Could not spawn process ${currentProcessDef.name}`);
        }
        spawnedProcess.on('error', () => {
            console.log('we have an error with one of the spawned processes');
            process.exit(1);
        });
        try {
            await currentProcessDef.readyCondition();
        } catch (e) {
            throw e;
        }
        processPIDQueue.push(spawnedProcess.pid);
    }
}

const spawnKarmaServer = gluec => {
    const karma = spawn(npxCommand, ['karma', 'start', './e2e/config/karma.conf.js'], {
        cwd: karmaConfigPath,
        stdio: 'inherit'
    });

    if (karma.pid === undefined) {
        throw new Error('Could not spawn karma process');
    }
    karma.on('exit', code => {
        controllerProcessExitCode = code;
        processPIDQueue.forEach(pid => kill(pid));
        kill(gluec.pid);
    });
    karma.on('error', () => {
        if (gluec && !gluec.killed) {
            return kill(gluec.pid, () => {
                console.log('exxiting with 1 in karma error gluec is alive');
                process.exit(1)
            });
        }
        console.log('exxiting with 1 in karma error');
        process.exit(1);
    });
    return karma;
}

const startProcessController = async () => {
    try {
        const gluec = await runGluecServer();

        await runConfigProcesses();

        spawnKarmaServer(gluec);
    } catch (error) {
        console.log(error);
        kill(process.pid);
    }

}

startProcessController();

process.on('unhandledRejection', reason => {
    console.log(JSON.stringify(reason));
    kill(process.pid);
});
