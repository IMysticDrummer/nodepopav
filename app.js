//express configuration
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const sesion = require('express-session');
const MongoStore = require('connect-mongo');

//security middlewares
const sessionAuth = require('./lib/sessionAuthMiddleware');
const jwtAuthMiddelware = require('./lib/jwtAuthMiddleware');
const loggedDataController = require('./lib/loggedDataController');

//internationalization middlewares
const i18n = require('./lib/i18nConfiguration');

//Routes configuration
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api/ads');
const LoginController = require('./routes/loginController');
const APIError = require('./routes/api/APIError');
const swaggerMiddleware = require('./lib/swaggerMiddleware');

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

// loginController intialitation
const loginController = new LoginController();

const apiError = new APIError();

/* API request */
app.use('/api/anuncios', jwtAuthMiddelware, apiRouter);
app.post('/api/login', loginController.postJWT);
app.use('/api-docs', swaggerMiddleware);
app.all('/api/*', apiError.all);

/* Web configuration */
app.use(i18n.init);

/* Web request */

//Session start
//DONE implementar el almacén de sesión
app.use(
  sesion({
    name: 'nodepop-session',
    secret: "Y3Jz.5J7gz#P'G", //con strong password
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 2,
    },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
  })
);

//All views can see this session
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

//International Title to be used for all views
app.use((req, res, next) => {
  app.locals.title = 'Nodepop';
  app.locals.title +=
    ' - ' +
    i18n.__({
      phrase: 'The Web for purchase-sale second-hand articles',
      locale: req.cookies['nodepop-locale'] || i18n.getLocale(req),
    });
  next();
});

//Web routes
app.use('/change-lang', require('./routes/change-lang'));
app.get('/login', loginController.index);
app.post('/login', loginController.post);
app.get('/logout', loginController.logout);
app.use('/', sessionAuth, loggedDataController, indexRouter);

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
