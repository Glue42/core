const {
    PATH_TO_TEST_DIR,
    PATH_TO_TEST_COLLECTION_DIR,
    WARN_TIMES_TO_RUN
} = require('../constants');
const fs = require('fs');
const config = require('../config');
const {
    deleteTestCollectionDir,
    copyDirAsync
} = require('../utils');

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

(async () => {
    await prepareTestCollectionPromise;
})();
