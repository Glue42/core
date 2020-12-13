const express = require('express')
const path = require('path');

const waitFor = (invocations, callback) => {
    let left = invocations;
    return () => {
        left--;

        if (left === 0) {
            callback();
        }
    };
};

const start = () => {
    return new Promise((resolve) => {
        let server;
        const app = express();
        const port = 7654;
        
        const build = path.join(__dirname, '../packages/dev-workspaces-frame/build/');
        
        app.use('/', express.static(build));
        
        const ready = waitFor(2, () => {
            resolve(server);
        });

        server = app.listen(port, () => {
            console.log(`The workspaces frame server is listening at http://localhost:${port} from dir: ${build}`)
            ready();
        });

        ready();
    })
};

module.exports = start;