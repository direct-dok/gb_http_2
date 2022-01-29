const { read } = require("fs");
const http = require("http");
const fs = require('fs');

const pathToFiles = './files';

const userAuth = {
    id: 123, 
    username: 'testuser',
    password: 'qwerty'
};

const userAuthPost = {
    userId: 243,
    authorized: 1,
};

const available_file_permissions = ['txt', 'doc'];


function parseCookie(stringCookie) {
    const cookieArray = stringCookie.split(';').map(el => el.trim());
    return cookieArray;
};

function cookieArrToObject(cookieArray) {
    const cookieObj = {};
    cookieArray.forEach(el => {
        const cookieArr = el.split("=");
        cookieObj[cookieArr[0]] = cookieArr[1];
    });

    return cookieObj;
}

const requestListener = (req, res) => {

    const cookieArray = parseCookie(req.headers.cookie);

    if(req.url === '/auth' && req.method == 'POST') {

        

        req.on('data', (chunk) => {
            let authData = JSON.parse(chunk);
            if(authData.username == userAuth.username
                && authData.password == userAuth.password) {
                    console.log('success');
                    res.writeHead(200, {
                        "Set-Cookie": [`userId=${userAuth.id}; path=/; MAX_AGE=172800; `, 'authorized=true; path=/; MAX_AGE=172800;'],
                        'Content-Type': 'text/plain'
                    });
                    res.end("Успешная авторизация");
                } else {
                    res.writeHead(400);
                    res.end("Неверный логин или пароль");
                }
        });

    }
    
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

        const authObj = cookieArrToObject(cookieArray);
        if(authObj.authorized == userAuthPost.authorized && authObj.userId == userAuthPost.userId) {
            let fileData = {};

            req.on('data', (chunk) => {
                fileData = JSON.parse(chunk);
                let arrFile = fileData.filename.split('.');
                
                if(
                    available_file_permissions.includes(arrFile[arrFile.length - 1])
                    && fileData.filename
                    && fileData.content
                ) {

                    fs.writeFile(`files/${fileData.filename}`, fileData.content, function (err) {
                        if (err) {
                            res.writeHead(415);
                            res.end('The file was not created, an error occurred');
                        };
                        console.log('File is created successfully.');
                        res.writeHead(200);
                        res.end('File is created successfully.');
                    });

                } else {
                    res.writeHead(415);
                    res.end('The file has not been created, check the correctness of the transmitted data');
                }
            });

            
        } else {
            res.writeHead(401);
            res.end('The user is not logged in');
        }
        
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