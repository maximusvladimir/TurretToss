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
			if (typeof readyFunction === "function") {
				readyFunction(ws);
			}
		});
	}
}
