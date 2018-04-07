var express = require('express');
var router = express.Router();
var wslib = require('../websocket.js');
var db = require('../database-dummy.js');

router.get('/', function (req, res, next) {
	// todo: replace this JSON object with reading from PostgreSQL.
	var leaderboard = {
		daily: [
			{
				place: 1,
				name: 'turret_toss_pro',
				points: 1078
			},
			{
				place: 2,
				name: 'Sally',
				points: 645
			},
			{
				place: 3,
				name: 'Dog',
				points: 579
			},
			{
				place: 4,
				name: 'user_6',
				points: 398
			},
			{
				place: 5,
				name: 'xXhelloXx',
				points: 145
			},
		],
		monthly: [
			{
				place: 1,
				name: 'turret_toss_pro',
				points: 10780
			},
			{
				place: 2,
				name: 'Sally',
				points: 6450
			},
			{
				place: 3,
				name: 'Dog',
				points: 5790
			},
			{
				place: 4,
				name: 'user_6',
				points: 3980
			},
			{
				place: 5,
				name: 'xXhelloXx',
				points: 1450
			},
		],
		allTime: [
			{
				place: 1,
				name: 'turret_toss_pro',
				points: 107800
			},
			{
				place: 2,
				name: 'Sally',
				points: 64500
			},
			{
				place: 3,
				name: 'Dog',
				points: 57900
			},
			{
				place: 4,
				name: 'user_6',
				points: 39800
			},
			{
				place: 5,
				name: 'xXhelloXx',
				points: 14500
			},
		]
	};
	
	var defaultObject = {
		path: '/',
		wsinfo: global.websocketURL + ":" + global.websocketPort,
		currentStreamUrl: 'https://www.youtube.com/embed/V8l1TOfbyKg',//VFcSr5s2ovk
		leaderboard: leaderboard
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
				// TODO: replace!:
				global.lastGoodWebSocket = ws;
			} catch (e) {}
		}
	}, 1000);
});

module.exports = router;
