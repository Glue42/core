const unlink = require('fs').unlink;
const join = require('path').join;

const remove = (location) => {
    console.log(`Removing from dist: ${location}`);
    return new Promise((resolve, reject) => {
        unlink(location, (err) => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
};

const start = async () => {
    const pJson = join(__dirname, '../dist/package.json');
    const readMe = join(__dirname, '../dist/README.md');
    await Promise.all([
        remove(pJson),
        remove(readMe)
    ]);
};

start();