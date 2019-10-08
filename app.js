import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';

import { authRouter } from './routes/auth';
import { listenRouter } from './routes/listen';
import globalLog from 'global-request-logger'

export const app = express();

const env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = (env === 'development');


globalLog.initialize();

globalLog.on('success', function (request, response) {
  console.log('SUCCESS');
  console.log('Request', request);
  console.log('Response', response);
});

globalLog.on('error', function (request, response) {
  console.log('ERROR');
  console.log('Request', request);
  console.log('Response', response);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRouter);
app.use('/listen', listenRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
} else {
  // production error handler
  // no stack traces leaked to user
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: { },
      title: 'error'
    });
  });
}
