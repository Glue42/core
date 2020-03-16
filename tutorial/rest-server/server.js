const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const clients = require('./data/clients');
const portfolio = require('./data/portfolio');

const API_JSON_PATH = './data/';
const API_URL_PREFIX = 'api';
// const IS_DEV = process.env.NODE_ENV === 'development';
const TARGET_DIR = process.argv0 || './'
console.log(process.argv0)

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get(`${API_URL_PREFIX}/clients`, (req, res) => {
    res.sendFile(path.resolve(path.join(API_JSON_PATH, 'clients.json')));
});

app.get(`${API_URL_PREFIX}/portfolio`, (req, res) => {
    res.sendFile(path.resolve(path.join(API_JSON_PATH, 'portfolios.json')));
});

app.get(`${API_URL_PREFIX}/portfolio/:userId`, (req, res) => {
    const client = clients.Clients.find(({eId, pId, id, gId}) => [eId, pId, id, gId].includes(req.params.userId));
    if (client) {
        const portfolioIds = client.portfolio.split(', ');
        const clientPortfolio = portfolio.filter(({BPOD}) => portfolioIds.includes(BPOD));
        res.json(clientPortfolio);
    }
    res.json([]);
});

app.use(function(req, res, next) {
    if (path.basename(req.path).length > 0 && fs.existsSync(path.join(TARGET_DIR, req.path))) {
        res.sendFile(path.resolve(path.join(TARGET_DIR, req.path)));
    } else if (path.extname(req.path).length > 0) {
        next();
    } else {
        res.sendFile(path.resolve(TARGET_DIR, 'index.html'));
    }
});

const port = process.env.PORT || 8080;

app.listen(port, function(error) {
    if (error) {
        throw error;
    }
    console.log('Express server listening on port', port); // tslint:disable-line no-console
});
