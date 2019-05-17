let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let sassMiddleware = require('node-sass-middleware');
let mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

let userRouter = require('./routes/user');
let messageRouter = require('./routes/message');

let app = express();
app.use(cors());

mongoose.connect('mongodb://localhost:27017/creativitychat', {useNewUrlParser: true})
.then( () => {
  console.log("connection success 😁");
})
.catch ((err) => {
  console.log(`error: ${err} 😢`);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/', userRouter);
app.use('/api/v1/', messageRouter);

app.use(express.static('dist'));
app.get('/', function(req, res) {
    res.sendfile('./dist/index.html');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//app.listen(3000);

module.exports = app;
