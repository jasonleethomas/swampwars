import * as express from 'express';

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

export var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Send Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/jspm_packages', express.static(__dirname + '/jspm_packages'));
app.use('/config.js',function (req, res) {
  res.sendFile(__dirname + '/config.js');
});
app.use('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err: any = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace

var devHandler: express.ErrorRequestHandler;
devHandler = function(err: any,
                      req: express.Request,
                      res: express.Response,
                      next: Function) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
}

if (app.get('env') === 'development') {
  app.use(devHandler);
}

// production error handler
// no stacktraces leaked to user

var errorHandler: express.ErrorRequestHandler;
errorHandler = function(err: any,
                        req: express.Request,
                        res: express.Response,
                        next: Function) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
}

app.use(errorHandler);
