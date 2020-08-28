const path = require('path');

module.exports = function override(config) {
    config.resolve.alias = {
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
    };

    return config;
};
