var http = require('http');
 
http.createServer(function (request, response) {  
    response.writeHead(200, {'Content-Type' : 'text/plain'});
    response.write('Hello Nodejs');
    // end() 호출하지 않으면 브라우저가 계속 돈다.
    response.end();
}).listen(3000);