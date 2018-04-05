var express = require('express');
var router = express.Router();
var db = require('../database-dummy.js');

router.get('/signout', function (req, res, next) {
	res.clearCookie('auth');
    res.redirect('/');
});

module.exports = router;
