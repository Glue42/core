const { spawn } = require('child_process');
const kill = require('tree-kill');
const path = require('path');
const os = require('os');
const http = require('http');

const gluecConfigPath = path.resolve(process.cwd(), 'e2e', 'config');
const karmaConfigPath = path.resolve(process.cwd());
const npxCommand = os.type() === 'Windows_NT' ? 'npx.cmd' : 'npx';
let controllerProcessExitCode = 0;


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

const waitForGluecServer = () => {

    const MAX_REQUESTS = 50;
    let reqCounter = 0;

    const options = {
        hostname: 'localhost',
        port: 4242,
        path: '/glue/worker.js',
        method: 'GET'
    }

    return new Promise((resolve, reject) => {
        const pingServer = () => {
            if (reqCounter >= MAX_REQUESTS) {
                reject('Could not connect to glue-cli server');
            }
            const req = http.request(options, res => {
                if (res.statusCode === 200) {
                    return resolve();
                }
                reject(`Server responded with status code: ${res.statusCode}`);
            });
            req.on('error', () => {
                console.log('Request timeout...');
                ++reqCounter;
                setTimeout(pingServer, 100);
            });
            req.end();
        }
        pingServer();
    });
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
        await waitForGluecServer();
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
