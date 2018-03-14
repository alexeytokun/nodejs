var http = require('http');
var port = 8080;

var requestCB = function (request, response) {
    console.log(request.url);
    response.end('End of response\n');
}

var server = http.createServer(requestCB);

server.listen(8080, (err) => {
    if (err) {
        return console.log('Error: ' + err.name + '\n');
    }
    console.log('Listening port ' + port + '\n');
});
