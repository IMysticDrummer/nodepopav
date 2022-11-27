var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const sesion = require('express-session');

const sessionAuth = require('./lib/sessionAuthMiddleware');
const jwtAuthMiddelware = require('./lib/jwtAuthMiddleware');
const i18n = require('./lib/i18nConfiguration');

//Routes
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api/ads');
const LoginController = require('./routes/loginController');

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

const loginController = new LoginController();

/* API request */
app.use('/api', jwtAuthMiddelware, apiRouter);
app.use('/api/login', loginController.postJWT);

/* Web configuration */
app.use(i18n.init);

const titleMiddleware = (req, res, next) => {
  req.title = 'Nodepop';
  req.title +=
    ' - ' +
    i18n.__({
      phrase: 'The Web for purchase-sale second-hand articles',
      locale: req.cookies['nodepop-locale'],
    });
  next();
};

/* Web request */

//Inicio de sesión
//TODO implementar el almacén de sesión
app.use(
  sesion({
    name: 'nodepop-session',
    secret: "Y3Jz.5J7gz#P'G", //con strong password
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 2,
    },
  })
);

//Sesión visible por todas las vistas
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use('/', titleMiddleware, indexRouter);
app.use('/change-lang', require('./routes/change-lang'));
app.get('/login', titleMiddleware, loginController.index);
app.post('/login', titleMiddleware, loginController.post);
app.use('/prueba', sessionAuth, titleMiddleware, indexRouter);
app.get('/logout', loginController.logout);

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
