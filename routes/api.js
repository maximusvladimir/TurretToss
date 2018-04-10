var express = require('express');
var router = express.Router();
var wslib = require('../websocket.js');
var db = require('../database-dummy.js');

wslib.setupWebsocket(function (ws) {
	global.lastGoodWebSocket = ws;
	// todo: replace names with reading from PostgreSQL.
	/*var names = [{
			name: "Chad",
			color: "#ffc9a2"
		},
		{
			name: "user_6",
			color: "#b5d6a5"
		},
		{
			name: "xXHelloXx",
			color: "#efc73c"
		},
		{
			name: "Sally",
			color: "#d8abc1"
		},
		{
			name: "ttu-supersenior",
			color: "#e69b9b"
		},
		{
			name: "Dog",
			color: "#adcbd2"
		}];

	setInterval(function () {
		if (Math.random() < 0.4) {
			// 40% chance every 1 second we send a new name:
			var pick = names[parseInt(Math.random() * names.length)];
			try {
				ws.send(JSON.stringify({
					kind: "queue",
					data: pick
				}));
				// TODO: replace!:
				global.lastGoodWebSocket = ws;
			} catch (e) {}
		}
	}, 1000);*/
});

router.post('/api/enqueue', function (req, res, next) {
	var authed = false;
	var auth = req.cookies["auth"];
	if (auth !== null) {
		var target = db.getUserFromToken(auth);
		if (target != null) {
			authed = true;
			var speed = req.body.speed;
			var angle = req.body.angle;
			// TODO
			//console.log("TODO: the following should be added to the queue. Speed: " + speed + ". Angle: " + angle);
			db.addToQueue(target.username, speed, angle);
			// TODO: replace this:
			if (global.lastGoodWebSocket !== "undefined") {
				try {
					global.lastGoodWebSocket.send(JSON.stringify({
						kind: "queue",
						data: {
							name: target.username,
							color: target.color
						}
					}));
				} catch (e) {}
			}
			res.send({
				okay: true,
				message: 'Successfully added your Toss to the queue!'
			});
		}
	}

	if (!authed) {
		// if we aren't authenticated:
		res.send({
			okay: false,
			message: 'bad request: no auth.'
		});
	}
});

router.get('/api/poll', function (req, res, next) {
	var currentUp = db.pollQueueTable();
	res.send(currentUp);
	if (global.lastGoodWebSocket !== "undefined") {
		try {
			global.lastGoodWebSocket.send(JSON.stringify({
				kind: "progression",
				data: currentUp
			}));
		} catch (e) {}
	}
});

router.post('/api/complete', function (req, res, next) {
	var username = req.body.username.toString();
	var hit = req.body.hit;
	if (typeof hit !== "boolean") {
		res.send({
			status: 'bad request. not in required format.'
		});
	} else {
		// TODO: add the username and hit to the score manager.
		if (global.lastGoodWebSocket !== "undefined") {
			try {
				global.lastGoodWebSocket.send(JSON.stringify({
					kind: "progression",
					data: null
				}));
			} catch (e) {}
		}
		res.send({
			status: 'complete.'
		});
	}
});

router.get('/api/stream/:id', function (req, res, next) {
	global.currentStream = req.params.id;
	res.send({
		status: 'stream set!'
	});
});

module.exports = router;
