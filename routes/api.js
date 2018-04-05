var express = require('express');
var router = express.Router();
var wslib = require('../websocket.js');
var db = require('../database-dummy.js');

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
			console.log("TODO: the following should be added to the queue. Speed: " + speed + ". Angle: " + angle);
			// TODO: replace this:
			if (global.lastGoodWebSocket !== "undefined") {
				global.lastGoodWebSocket.send(JSON.stringify({
					kind: "queue",
					data: {
						name: target.username,
						color: target.color
					}
				}));
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

module.exports = router;
