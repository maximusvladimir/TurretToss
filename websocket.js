var conn = [];

var count = 0;

function snd(data) {
	for (var i = 0; i < conn.length; i++) {
		try {
			console.log("sending...");
			conn[i].send(data);
			console.log("Sent:");
			console.log(data);
		} catch (e) {
			//console.error(e);
		}
	}
}

module.exports = {
	setupWebsocket: function (readyFunction) {
		var WebSocket = require('ws'),
			wss = new WebSocket.Server({
				port: parseInt(global.websocketPort)
			});

		wss.on('connection', function (ws) {
			ws.on('message', function (message) {
				console.log('received: %s', message);
				count++;
				snd(JSON.stringify({kind: 'pc', data: count}));
			});
			ws.on('close', function (reasonCode, description) {
				count--;
				snd(JSON.stringify({kind: 'pc', data: count}));
			});
			conn.push(ws);
			if (typeof readyFunction === "function") {
				readyFunction(ws);
			}
		});
	},
	send: snd
}
