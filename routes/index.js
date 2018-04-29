var express = require('express');
var router = express.Router();
var db = require('../database-dummy.js');

global.currentStream = 'z7FCy3fqU7E';

router.get('/', function (req, res, next) {
	// todo: replace this JSON object with reading from PostgreSQL.
	var leaderboard = db.getLeaderboard();
	
	var defaultObject = {
		path: '/',
		wsinfo: global.websocketURL + ":" + global.websocketPort,
		currentStreamUrl: 'https://www.youtube.com/embed/' + global.currentStream,//z7FCy3fqU7E',//VFcSr5s2ovk
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


module.exports = router;
