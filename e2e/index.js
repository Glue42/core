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
    const processNamesSeen = {};
    const processesNames = testConfig.run.reduce((processesNames, folderToRun) => {
        if (folderToRun.processes) {
            processesNames.push(...folderToRun.processes);
        }
        return processesNames;
    }, []);

    return processesNames.filter(processName => {
        if (!processNamesSeen[processName]) {
            processNamesSeen[processName] = true;
            return processName;
        }
    });
}

const sortProcessesByNamesOrder = (processesDefinition, processNames) => processNames.reduce((processesToSpawn, processName) => {
    const processToSpawn = processesDefinition.find(processDefinition => processDefinition.name === processName);
    if (processToSpawn === undefined) {
        throw new Error(`Process definition not found for process name: ${processName}`);
    }
    processesToSpawn.push(processToSpawn);
    return processesToSpawn;
}, []);


const spawnGluecServer = () => {
    const gluec = spawn(npxCommand, ['gluec', 'serve'], {
        cwd: gluecConfigPath,
        stdio: 'inherit'
    });

    if (gluec.pid === undefined) {
        throw new Error('Could not spawn gluec proces');
    }

    gluec.on('exit', () => process.exit(controllerProcessExitCode));
    gluec.on('error', () => process.exit(1));

    return gluec;
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
        processPIDQueue.forEach(processPID => kill(processPID));
        kill(gluec.pid);
    });
    karma.on('error', () => {
        if (gluec && !gluec.killed) {
            return kill(gluec.pid, () => process.exit(1));
        }
        process.exit(1);
    });
    return karma;
}

const startProcessController = async () => {
    try {
        const gluec = spawnGluecServer();
        const gluecReadyCondition = basePolling({
            hostname: 'localhost',
            port: 4242,
            path: '/glue/worker.js',
            method: 'GET',
            pollingInterval: 100,
            pollingTimeout: 5000
        });
        await gluecReadyCondition();

        const processNames = extractProcessNames(testConfig);
        const processesToSpawn = sortProcessesByNamesOrder(testConfig.processes, processNames);
        while (processesToSpawn.length) {
            const currentProcess = processesToSpawn.shift();
            const spawnedProcess = spawn('node', [`${path.resolve(__dirname, currentProcess.path)}`, ...currentProcess.args]);
            if (spawnedProcess.pid === undefined) {
                throw new Error(`Could not spawn process ${currentProcess.name}`);
            }
            spawnedProcess.on('exit', code => controllerProcessExitCode = code);
            spawnedProcess.on('error', () => kill(process.pid));
            try {
                await currentProcess.readyCondition();
            } catch (e) {
                throw e;
            }
            processPIDQueue.push(spawnedProcess.pid);
        }

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
