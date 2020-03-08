const sync = require('./sync.js');

sync()
    .then(() => console.log('Pre-version validation completed'))
    .catch(console.error);
