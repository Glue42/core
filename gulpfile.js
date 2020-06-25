// npm run release -- --addition,subtraction
const { series } = require('gulp');
const fs = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');
const { PublishCommand } = require('@lerna/publish');
const git = require('simple-git/promise')(__dirname);
const sync = require('./scripts/preversion/sync.js');

const stableBranch = 'master';
const releaseBranch = 'release';
const ignored = ['.git', '.log', 'node_modules', 'packages', '.md', 'package-lock', '.vscode'];
const packagesDirectory = join(__dirname, '/packages/');
let packagesDirNamesToRelease = [];
let fullRelease = false;

const readDirPromise = (directory) => {
    return new Promise((resolve, reject) => {
        fs.readdir(directory, (err, files) => {
            if (err) {
                return reject(err);
            }

            resolve(files);
        });
    });
};

const validateReleasePackages = async () => {
    packagesDirNamesToRelease = process.argv[3].replace('--', '').split(',');

    if (packagesDirNamesToRelease.includes('all')) {
        fullRelease = true;
        return;
    }

    const areNamesValidType = packagesDirNamesToRelease.every((name) => (typeof name === 'string') && name.length > 0);

    if (!areNamesValidType) {
        throw new Error(`Invalid packages names: ${JSON.stringify(packagesDirNamesToRelease)}`);
    }

    const areNamesExisting = packagesDirNamesToRelease.every((pkgName) => fs.existsSync(join(packagesDirectory, pkgName)));

    if (!areNamesExisting) {
        throw new Error(`Non-existent packages names: ${JSON.stringify(packagesDirNamesToRelease)}`);
    }
};

const checkout = async (branchName) => {
    await git.checkout(branchName);
};

const checkoutRelease = async () => {
    await checkout(releaseBranch);
    await git.pull();
};

const checkoutMaster = async () => {
    await checkout(stableBranch);
    process.exitCode = 0;
};

const syncAllContentsExceptPackages = async () => {
    const rootContents = await readDirPromise(__dirname);

    const itemToSync = rootContents.filter((element) => !ignored.some((igElement) => element.includes(igElement)));
    itemToSync.push('.gitignore');

    for (const item of itemToSync) {
        console.log(`checking out ${item}`);
        await git.raw(['checkout', stableBranch, item]);
    }
};

const syncPackagesToRelease = async () => {
    if (fullRelease) {
        console.log('Checking out all packages for full release');
        await git.raw(['checkout', stableBranch, 'packages/']);
        return;
    }

    for (const packageName of packagesDirNamesToRelease) {
        console.log(`checking out ${packageName}`);
        await git.raw(['checkout', stableBranch, `packages/${packageName}`]);
    }
};

const bootstrap = () => {
    return new Promise((resolve, reject) => {
        const npmCommand = process.platform === 'win32'
            ? 'npm.cmd'
            : 'npm';

        const child = spawn(npmCommand, ['run', 'bootstrap'], { stdio: 'inherit' });

        child.on('error', reject);
        child.on('exit', (code) => {
            if (code === 1) {
                reject();
            }
            resolve();
        });
    });
};

const versionSync = async () => {
    await sync(git, false);
};

const addCommit = async (message) => {
    await git.add('.');
    await git.commit(message, undefined, { '--no-verify': null });
};

const commitIsolatedPackages = async () => {
    await addCommit('Release package/s isolated');
};

const publish = async () => {
    const command = new PublishCommand({});
    await command.runner;
};

exports.release = series(
    validateReleasePackages,
    checkoutRelease,
    syncAllContentsExceptPackages,
    syncPackagesToRelease,
    bootstrap,
    versionSync,
    commitIsolatedPackages,
    publish,
    checkoutMaster
);
