global.userStore = [];
global.authTokens = [];
global.queueTable = [];
global.shotTable = [];

var fs = require('fs');
var moment = require('moment');

// This is a dummy holder module for where the database connection will go.


// everything between here...
var path = require('path');

var dbFile = path.join(__dirname, '.', 'db.tmp');

function loadDatabase() {
	if (fs.existsSync(dbFile)) {
		var file = fs.readFileSync(dbFile, 'utf8');
		var container = JSON.parse(file);
		global.userStore = container.userStore;
		global.authTokens = container.authTokens;
		global.queueTable = container.queueTable;
		global.shotTable = container.shotTable;
	}
}

function flushDatabase() {
	if (fs.existsSync(dbFile)) {
		fs.unlinkSync(dbFile);
	}

	fs.writeFileSync(dbFile, JSON.stringify({
		userStore: global.userStore,
		authTokens: global.authTokens,
		queueTable: global.queueTable,
		shotTable: global.shotTable
	}));
}
loadDatabase();
// ...and here need to be deleted in production.



module.exports = {
	createUser: function (username, email, password, color) {
		// TODO: password salting & hashing.
		// TODO: validity checking.
		// TODO: make sure account doesn't already exist.
		username = username.toLowerCase();
		global.userStore.push({
			username: username,
			email: email,
			password: password,
			color: color
		});
		flushDatabase();
	},
	addToQueue: function(username, speed, angle) {
		username = username.toLowerCase();
		global.queueTable.push({
			username: username,
			speed: speed,
			angle: angle,
			sent: false
		});
		flushDatabase();
	},
	pollQueueTable: function() {
		var item = null;
		for (var i = 0; i < global.queueTable.length; i++) {
			var row = global.queueTable[i];
			if (!row.sent) {
				item = row;
				row.sent = true;
				break;
			}
		}
		flushDatabase();
		return item;
	},
	addShot: function(username, wasHit) {
		global.shotTable.push({
			dt: new Date().getTime(),
			username: username,
			hit: wasHit
		});
		
		flushDatabase();
	},
	getLeaderboard: function() {
		var result = {daily: [], monthly: [], allTime: []};
		function applyUpdate(prop, username) {
			var found = false;
			for (var i = 0; i < prop.length; i++) {
				if (prop[i].username === username) {
					prop[i].shot++;
					return;
				}
			}
			prop.push({
				username: username,
				shot: 1
			});
		}
		var dayStart = moment().startOf('day');
		var yearStart = moment().startOf('year');
		var monthStart = moment().add(-30, 'day');
		var now = moment();
		for (var i = 0; i < global.shotTable.length; i++) {
			var shot = global.shotTable[i];
			if (shot.hit) {
				if (shot.dt > dayStart) {
					applyUpdate(result.daily, shot.username);
				}
				if (shot.dt > monthStart) {
					applyUpdate(result.monthly, shot.username);
				}
				applyUpdate(result.allTime, shot.username);
			}
		}
		
		var swap = {daily: [], monthly: [], allTime: []};
		result.daily.sort(function(a, b) {
			return b.shot - a.shot;
		});
		result.monthly.sort(function(a, b) {
			return b.shot - a.shot;
		});
		result.allTime.sort(function(a, b) {
			return b.shot - a.shot;
		});
		
		for (var i = 0; i < 5; i++) {
			if (i < result.daily.length) {
				swap.daily.push(result.daily[i]);
			}
			if (i < result.daily.length) {
				swap.monthly.push(result.monthly[i]);
			}
			if (i < result.daily.length) {
				swap.allTime.push(result.allTime[i]);
			}
		}
		
		return swap;
	},
	passwordCheck: function (username, password) {
		// TODO: password salting & hashing.
		username = username.toLowerCase();
		for (var i = 0; i < global.userStore.length; i++) {
			var row = global.userStore[i];
			if (row.username == username && row.password == password) {
				flushDatabase();
				return true;
			}
		}
		flushDatabase();
		return false;
	},
	createAuthToken: function (username) {
		username = username.toLowerCase();
		var expires = new Date();
		expires.setHours(expires.getHours() + 8760);
		var token = "";
		var abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		for (var i = 0; i < 128; i++) {
			// TODO: Math.random() is not cryptographically secure. Please replace.
			token += abc.charAt(parseInt(Math.random() * abc.length));
		}
		global.authTokens.push({
			expires: expires,
			user: username,
			token: token
		});
		flushDatabase();
		return token;
	},
	getUserFromToken: function (token) {
		var username = "";
		for (var i = 0; i < global.authTokens.length; i++) {
			var row = global.authTokens[i];
			if (row.token == token && Date.parse(row.expires) > new Date().getTime()) {
				username = row.user;
				break;
			}
		}

		if (username !== "") {
			for (var j = 0; j < global.userStore.length; j++) {
				var row2 = global.userStore[j];
				if (row2.username == username) {
					return row2;
				}
			}
		}
		flushDatabase();

		return null;
	},
	getUser: function (username) {
		for (var j = 0; j < global.userStore.length; j++) {
			var row2 = global.userStore[j];
			if (row2.username == username) {
				return row2;
			}
		}
		return null;
	},
	deleteToken: function (token) {
		var i;
		for (i = 0; i < global.authTokens.length; i++) {
			var row = global.authTokens[i];
			if (row.token == token) {
				break;
			}
		}
		global.authTokens.splice(i, 1);
		flushDatabase();
	}
};
