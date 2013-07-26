express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
    indexBuffer = new Buffer(fs.readFileSync('index.html'));
    stringMessage = indexBuffer.toString();
    response.send(stringMessage);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
