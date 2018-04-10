var express = require('express');
var router = express.Router();
var db = require('../database-dummy.js');

router.get('/signup', function (req, res, next) {
    res.render('signup', {
        path: '/signup'
    });
});

router.post('/signup', function (req, res, next) {
	if (req.body.username) {
		// TODO: strip HTML from all elements to reduce chances of XSS and to make Nils happy.
		db.createUser(req.body.username, req.body.email, req.body.password, req.body.color);
		var token = db.createAuthToken(req.body.username);
		res.cookie('auth', token, { maxAge: 31540000000 });
		res.cookie('user', req.body.username.toLowerCase(), { maxAge: 31540000000 });
	}
	
    res.redirect('/');
});


module.exports = router;
