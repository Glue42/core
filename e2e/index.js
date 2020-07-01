const { spawn } = require('child_process');
const kill = require('tree-kill');
const path = require('path');
const os = require('os');

const gluecConfigPath = path.resolve(process.cwd(), 'e2e', 'config');
const karmaConfigPath = path.resolve(process.cwd());
const npxCommand = os.type() === 'Windows_NT' ? 'npx.cmd' : 'npx';
let controllerProcessExitCode = 0;

const gluec = spawn(npxCommand, ['gluec', 'serve'], {
    cwd: gluecConfigPath,
    stdio: 'inherit'
});

const karma = spawn(npxCommand, ['karma', 'start', './e2e/config/karma.conf.js'], {
    cwd: karmaConfigPath,
    stdio: 'inherit'
});

gluec.on('exit', () => process.exit(controllerProcessExitCode));
gluec.on('error', () => {
    if (karma && !karma.killed) {
        return kill(karma.pid, () => process.exit(1));
    }
    process.exit(1);
});

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

process.on('unhandledRejection', e => console.log('Unhandled rejection exception'));
