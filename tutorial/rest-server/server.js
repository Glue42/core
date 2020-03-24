const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const clients = require('./data/clients');
const portfolio = require('./data/portfolio');

const API_URL_PREFIX = '/api';
const TARGET_DIR = process.argv[2] || './';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    if (
        path.basename(req.path).length > 0 &&
    fs.existsSync(path.join(TARGET_DIR, req.path))
    ) {
        res.sendFile(path.resolve(path.join(TARGET_DIR, req.path)));
    } else if (req.path.startsWith(API_URL_PREFIX)) {
        next();
    } else {
        res.sendFile(path.resolve(TARGET_DIR, 'index.html'));
    }
});

app.get(`${API_URL_PREFIX}/clients`, (req, res) => {
    res.json(clients);
});

app.get(`${API_URL_PREFIX}/portfolio`, (req, res) => {
    res.json(portfolio);
});

app.get(`${API_URL_PREFIX}/portfolio/:userId`, (req, res) => {
    const client = clients.find(({ eId, pId, id, gId }) =>
        [eId, pId, id, gId].includes(req.params.userId)
    );
    if (client) {
        const portfolioIds = client.portfolio.split(', ');
        const clientPortfolio = portfolio.filter(({ RIC }) =>
            portfolioIds.includes(RIC)
        );
        res.json(clientPortfolio);
    } else {
        res.json([]);
    }
});

const port = process.env.PORT || 8080;

app.listen(port, function(error) {
    if (error) {
        throw error;
    }
    console.log(`Serving directory ${path.resolve(TARGET_DIR)} on port ${port}`);
});
