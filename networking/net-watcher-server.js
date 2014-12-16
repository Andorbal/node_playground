"use strict";

const serverHandler = function(connection) {
	let connections = new Array();
	let watcher = null;

	// Handle when the specified file changes
	function handleFileChange() {
  		for (let i = 0; i < connections.length; i++) {
  			connections[i].write(JSON.stringify({
	  			type: 'changed',
	  			file: filename,
	  			timestamp: Date.now()
	  		}) + '\n');	
  		}
  	}

	// Remove the specified connection from the connections array
	function removeConnection(conn) {
		let tempConnections = new Array();
		let item = null;

		while (item = connections.pop())
		{
			if (item !== conn)
			{
				tempConnections.push(item);
			}
		}

		return tempConnections;		
	}

	if (connections.length == 0) {
		console.log("Watching for changes...");
	  	watcher = fs.watch(filename, handleFileChange);
	}

	connections.push(connection);

	// reporting
	console.log('Subscriber connected.');
	connection.write(JSON.stringify({
		type: 'watching',
		file: filename
	}) + '\n');
	
	connection.on('close', function() {
		console.log('Subscriber disconnected.');

		connections = removeConnection(connection);

		if (connections.length == 0) {
			console.log("Closing watcher...");
			watcher.close();	
		}
	});
};

const fs = require('fs'),
	  net = require('net'),
	  filename = process.argv[2],
	  server = net.createServer(serverHandler);

if (!filename) {
	throw Error("No target filename was specified.");
}

server.listen(5432, function() {
	console.log('Listening for subscribers...');
});