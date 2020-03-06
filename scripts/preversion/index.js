const sync = require('./validator.js').sync;

sync({ gitAdd: true })
    .then(() => console.log('Pre-version validation completed'))
    .catch(console.error);
