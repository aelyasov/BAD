var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/../flexstore_A.html');
    sys = require('sys');
    exec = require('child_process').exec;

function execute(command, callback){
    exec(command, function(error, stdout, stderr){
	callback(stdout);  
    });
};    

// function puts(error, stdout, stderr) { sys.puts(stdout) };

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    socket.on('sendlog', function(log) {
        console.log("<< log is transferred to server: " + log.clientLog);
	console.log("<< rewrite rules file is transferred to server: " + log.clientRRules);
	var logWithPath = "../logs/" + log.clientLog;
	var rewrulesWithPath = "../logs/" + log.clientRRules;
	execute("haslog --toraw " + logWithPath, function(haslog_out) {
	    var logRawConverted = logWithPath.split(".xml")[0] + ".log";
	    console.log("<< xml log has been converted to .log: " + logRawConverted);
	    execute("lopi -r --rew-rules=" + rewrulesWithPath + " --in-logs=" + logRawConverted,
			function(out_lopi) {
			    console.log("lopi output: " + out_lopi); 
			    socket.emit('reducedLog', {indices : out_lopi});
			});
	});
    });	
});

app.listen(3000);
