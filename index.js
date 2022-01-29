const { read } = require("fs");
const http = require("http");
const fs = require('fs');

const pathToFiles = './files';

const requestListener = (req, res) => {

    if(req.url === '/get' && req.method == 'GET') {

        fs.readdir(pathToFiles, (err, files) => {
            if(err) {
                res.writeHead(500);
                res.end("Internal server error");
            } else {
                res.writeHead(200);
                res.end(files.join(', '));
            }
            
        });

    } else if (req.url === '/get' && req.method != 'GET') {
        res.writeHead(405);
        res.end("HTTP method not allowed");
    }


    if(req.url === '/post' && req.method == 'POST') {
        res.writeHead(200);
        res.end('success');
    } else if(req.url === '/post' && req.method != 'POST') {
        res.writeHead(405);
        res.end('HTTP method not allowed');
    }


    if(req.url === '/delete' && req.method == 'DELETE') {
        res.writeHead(200);
        res.end('success');
    } else if(req.url === '/delete' && req.method != 'DELETE') {
        res.writeHead(405);
        res.end('HTTP method not allowed');
    }


    if(req.url === '/redirected' && req.method == 'GET') {
        res.writeHead(301);
        res.end('At the moment, the resource is available at /redirected');
    }
    
}

const host = 'localhost';
const port = 8000;

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});