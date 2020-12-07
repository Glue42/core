const http = require('http');

const PORT = 7777;

// Get arguments like this: process.argv[2].
http.createServer((req, res) => {
    if (req.method === 'GET') {
        res.statusCode = 200;
        res.end();
    }
}).listen(PORT);
