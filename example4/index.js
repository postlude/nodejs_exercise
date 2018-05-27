// var Myvar = require('./myvar');
// var setVar = new Myvar();
// console.log(setVar.name);


var http = require('http');
http.createServer(function (request, response){
    response.writeHead(200, {'Content-Type' : 'text/plain'});
    response.write('hello nodejs');
    response.end();
}).listen(3000);