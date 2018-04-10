var express = require('express');
var router = express.Router();
var wslib = require('../websocket.js');
wslib.setupWebsocket(function() {
	
});
var db = require('../database-dummy.js');

var currentUser = null;

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
			wslib.send(JSON.stringify({
				kind: "queue",
				data: {
					name: target.username,
					color: target.color
				}
			}));
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
	if (currentUp == null) {
		currentUser = null;
		res.send(null);
	} else {
		currentUser = currentUp.username;
		res.send(currentUp);
		wslib.send(JSON.stringify({
			kind: "progression",
			data: currentUp
		}));
	}
});

router.post('/api/complete', function (req, res, next) {
	var hit = req.body.hit;
	if (typeof hit !== "boolean") {
		res.send({
			status: 'bad request. not in required format.'
		});
	} else {
		// TODO: add the username and hit to the score manager.
		if (global.lastGoodWebSocket !== "undefined") {
			if (currentUser != null) {
			wslib.send(JSON.stringify({
				kind: "progression",
				data: null
			}));
			wslib.send(JSON.stringify({
				kind: "shot",
				data: {
					user: currentUser,
					made: hit
				}
			}));
			}
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
