var express = require('express');
var router = express.Router();
var wslib = require('../websocket.js');
var db = require('../database-dummy.js');

router.get('/', function (req, res, next) {
	var defaultObject = {
		path: '/',
		wsinfo: global.websocketURL + ":" + global.websocketPort,
		currentStreamUrl: 'https://www.youtube.com/embed/wZZ7oFKsKzY'
	};

	var authed = false;
	var auth = req.cookies["auth"];
	if (auth !== null) {
		var target = db.getUserFromToken(auth);
		if (target != null) {
			authed = true;
			defaultObject["user"] = target.username;
			res.render('index-auth', defaultObject);
		}
	}

	if (!authed) {
		// if we aren't authenticated:
		res.render('index', defaultObject);
	}
});

wslib.setupWebsocket(function (ws) {
	// todo: replace names with reading from PostgreSQL.
	var names = [{
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
			} catch (e) {}
		}
	}, 1000);
});

module.exports = router;
