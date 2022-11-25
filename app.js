var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const i18n = require('./lib/i18nConfiguration');

//Routes
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api/ads');

var app = express();

// view engine setup
// Comment to evite no-undef error in eslint
/* global __dirname */

app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.set('view engine', 'html'); // usa un motor de vista custom, llamado 'html'
app.engine('html', require('ejs').__express); // ese motor usa ejs

//connectMongoose import
require('./lib/connectMongoose');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//icon request is ignored
app.use('/favicon.ico', (req, res, next) => {
  res.status(204);
  res.send();
});

/* API request */
app.use('/api', apiRouter);
/* Web configuration */
app.use(i18n.init);

let title = 'Nodepop - ';
title += i18n.__('The Web for purchase-sale second-hand articles');

/* Web request */
app.use(
  '/',
  (req, res, next) => {
    req.title = title;
    next();
  },
  indexRouter
);
app.use('/change-lang', require('./routes/change-lang'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, "Sorry, this page doesn't exist"));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.url = req.url;

  //422 message error handler
  if (err.status === 422) {
    if (err.errors.length === 1) {
      res.locals.message = err.errors[0].msg;
    } else {
      res.locals.message = 'Several errors in request:';
      err.errors.forEach((error) => {
        res.locals.message += ' ' + error.msg + '; ';
      });
    }
  } else {
    res.locals.message = err.message;
  }
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  err.status = err.status || 500;
  res.status(err.status);
  res.render('error');
});

module.exports = app;
