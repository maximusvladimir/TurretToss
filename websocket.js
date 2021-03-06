var db = require('./database-dummy');
var moment = require('moment');

var conn = [];

var count = 0;
var called = false;

function snd(data) {
	for (var i = 0; i < conn.length; i++) {
		try {
			//console.log("sending...");
			conn[i].send(data);
			//console.log("Sent:");
			//console.log(data);
		} catch (e) {
			//console.error(e);
		}
	}
}

module.exports = {
	setupWebsocket: function (readyFunction) {
		if (!called) {
			called = true;
			var WebSocket = require('ws'),
				wss = new WebSocket.Server({
					port: parseInt(global.websocketPort)
				});

			wss.on('connection', function (ws) {
				setTimeout(function () {
					count++;
					snd(JSON.stringify({
						kind: 'pc',
						data: count
					}));
				}, 200);
				ws.on('message', function (message) {
					var res = JSON.parse(message);
					if (res.kind == "chat") {
						var user = db.getUserFromToken(res.cookie);
						if (user != null) {
							snd(JSON.stringify({
								kind: 'chat',
								color: user.color,
								data: '[' + moment().format('hh:mm:ss') + '] ' + user.username + ": " + res.msg
							}));
						}
					}
				});
				ws.on('close', function (reasonCode, description) {
					count--;
					snd(JSON.stringify({
						kind: 'pc',
						data: count
					}));
				});
				conn.push(ws);
				if (typeof readyFunction === "function") {
					readyFunction(ws);
				}
			});
		}
	},
	send: snd
}
