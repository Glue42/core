const rimraf = require('rimraf');
const {
    PATH_TO_TEST_COLLECTION_DIR
} = require('./constants');
const fs = require('fs');
const path = require('path');

const copyFileAsync = (src, dest) => {
    return new Promise((resolve) => {
        fs.copyFile(src, dest, () => resolve());
    });
};

const deleteTestCollectionDir = () => {
    rimraf.sync(PATH_TO_TEST_COLLECTION_DIR);
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

const platformMode = process.env.RUNNER === 'Platform';

module.exports = {
    platformMode,
    deleteTestCollectionDir,
    copyDirAsync
};
