var host = '104.131.177.66';
var port = 8080;

var ws = require('nodejs-websocket');

var exec = require('child_process').exec;

function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

// Scream server example: "hi" -> "HI!!!"
var server = ws.createServer(function (conn) {
    console.log("New connection")

    conn.on("text", function (str) {
        console.log("Received " + str)
	        if (str) {
		        execute('echo "' + str.toLowerCase() + '" | nc ' + host + ' ' + port, function(data){
		        	console.log('send data - ', data);
		        	conn.sendText(data);
		        });
        }
    });

    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    });

}).listen(8001);