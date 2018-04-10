var conn = [];

module.exports = {
	setupWebsocket: function(readyFunction) {
		var WebSocket = require('ws'),
			wss = new WebSocket.Server({
				port: parseInt(global.websocketPort)
			});

		wss.on('connection', function (ws) {
			ws.on('message', function (message) {
				console.log('received: %s', message)
			});
			conn.push(ws);
			if (typeof readyFunction === "function") {
				readyFunction(ws);
			}
		});
	},
	send: function(data) {
		for (var i = 0; i < conn.length; i++) {
			try {
				conn[i].send(data);
			} catch (e) {
				console.error(e);
			}
		}
	}
}
