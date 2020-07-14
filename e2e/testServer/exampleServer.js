const http = require('http');

let port = 7777;

// get arguments from process.argv[2], process.argv[3], etc., if needed
const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        res.statusCode = 200;
        res.end();
    }
});

const startListening = () => {
    server.listen(port)
        .on('error', () => {
            if (!server.listening) {
                ++port;
                startListening();
            }
        })
}

startListening();
