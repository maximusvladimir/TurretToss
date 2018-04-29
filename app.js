// to run: "set DEBUG=WCYK:* & set PORT=4000 & supervisor ./bin/www"

//
// Some initialization stuff. MUST come before requires:
//
global.websocketURL = "ws://34.215.198.119";
global.websocketPort = 3000;
if (process.env.DEBUG == "WCYK:* ") {
	global.websocketURL = "ws://localhost";
	global.websocketPort = 40010;
}


var express = require('express');
var path = require('path');
var app = express();
var index = require('./routes/index');
var cookie = require('cookie-parser');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(cookie());

// view engine setup
app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/signin'));
app.use('/', require('./routes/signup'));
app.use('/', require('./routes/api'));
app.use('/', require('./routes/signout'));
app.use('/', index);

/*
db.addShot('max', true);
db.addShot('max', false);
db.addShot('max', true);
db.addShot('will', true);
db.addShot('bart', true);*/

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
