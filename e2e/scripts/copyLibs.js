const { libPaths } = require('../config');
const fs = require('fs');
const rimraf = require('rimraf');
const { PATH_TO_LIBS_DIR } = require('../constants');

const libsWithPathAndName = libPaths.map((libPath) => ({
    fullPath: libPath,
    fileName: libPath.replace(/^.*[\\\/]/, '')
}));

// Make sure that the lib source paths exist.
for (const { fullPath } of libsWithPathAndName) {
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Lib path "${fullPath}" does not exist. Make sure to provide valid lib paths and to run \`npm run build\` before running any tests.`);
    }
}

// Make sure that there are no libs with the same name.
const libFileNames = libsWithPathAndName.map((libFileWithFileName) => libFileWithFileName.fileName);
if (libsWithPathAndName.length > new Set(libFileNames).size) {
    throw new Error('Multiple libs have the same file name. Make sure to provide libs with unique names.');
}

// Delete the old libs folder. We use rimraf as the fs' `rmdirSync()` recursive: true option is only available in Node 12 and the CI/CD also runs the tests on older versions of Node.
if (fs.existsSync(PATH_TO_LIBS_DIR)) {
    rimraf.sync(PATH_TO_LIBS_DIR);
}

// Create the new libs folder.
fs.mkdirSync(PATH_TO_LIBS_DIR);

// Copy the lib files to the lib folder.
for (const { fullPath, fileName } of libsWithPathAndName) {
    fs.copyFileSync(fullPath, `${PATH_TO_LIBS_DIR}${fileName}`);
}
