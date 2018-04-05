var express = require('express');
var router = express.Router();
var db = require('../database-dummy.js');

router.get('/signin', function (req, res, next) {
    res.render('signin', {
        path: '/signin'
    });
});

router.post('/signin', function (req, res, next) {
	if (req.body.username) {
		// TODO: strip HTML from all elements to reduce chances of XSS and to make Nils happy.
		if (db.passwordCheck(req.body.username, req.body.password)) {
			var token = db.createAuthToken(req.body.username);
			res.cookie('auth', token, { maxAge: 31540000000 });
		}
	}
	
    res.redirect('/');
});


module.exports = router;
