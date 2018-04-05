global.userStore = [];
global.authTokens = [];

// This is a dummy holder module for where the database connection will go.

module.exports = {
	createUser: function(username, email, password, color) {
		// TODO: password salting & hashing.
		// TODO: validity checking.
		// TODO: make sure account doesn't already exist.
		username = username.toLowerCase();
		userStore.push({
			username: username,
			email: email,
			password: password,
			color: color
		});
	},
	passwordCheck: function(username, password) {
		// TODO: password salting & hashing.
		username = username.toLowerCase();
		for (var i = 0; i < userStore.length; i++) {
			var row = userStore[i];
			if (row.username == username && row.password == password) {
				return true;
			}
		}
		return false;
	},
	createAuthToken: function(username) {
		username = username.toLowerCase();
		var expires = new Date();
		expires.setHours(expires.getHours() + 8760);
		var token = "";
		var abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		for (var i = 0; i < 128; i++) {
			// TODO: Math.random() is not cryptographically secure. Please replace.
			token += abc.charAt(parseInt(Math.random() * abc.length));
		}
		authTokens.push({
			expires: expires,
			user: username,
			token: token
		});
		return token;
	},
	getUserFromToken: function(token) {
		var username = "";
		for (var i = 0; i < authTokens.length; i++) {
			var row = authTokens[i];
			if (row.token == token && row.expires > new Date()) {
				username = row.user;
				break;
			}
		}
		
		if (username !== "") {
			for (var j = 0; j < userStore.length; j++) {
				var row2 = userStore[j];
				if (row2.username == username) {
					return row2;
				}
			}
		}
		
		return null;
	}
};