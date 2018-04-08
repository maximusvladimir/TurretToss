global.userStore = [];
global.authTokens = [];
global.queueTable = [];

var fs = require('fs');

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
	}
}

function flushDatabase() {
	if (fs.existsSync(dbFile)) {
		fs.unlinkSync(dbFile);
	}

	fs.writeFileSync(dbFile, JSON.stringify({
		userStore: global.userStore,
		authTokens: global.authTokens,
		queueTable: global.queueTable
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
