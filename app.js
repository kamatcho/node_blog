var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressVaidator = require('express-validator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');
var flash = require('connect-flash');
var index = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var caregories = require('./routes/categories');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));
app.use(express.static('public/images'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.locals.moment = require('moment');

app.locals.truncateText = function (text, length) {
    var truncatedText = text.substring(0, length);
    return truncatedText;
};
// validator
app.use(expressVaidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root
        while(namespace.length){
            formParam += '['+namespace.shift()+']';
        }
        return {
            param : formParam ,
            msg : msg ,
            value : value
        }
    }
}));
// Sessions
 app.use(session({
     secret : 'secret',
     saveUninitialized : true ,
     resave : true
 }));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(process.cwd() + '/uploads'));

 // Connect - flash

app.use(flash());
app.use(function (req , res , next) {
    res.locals.messages = require('express-messages')(req , res);
    next()
});
// make our Db accessible to our route

app.use(function (req , res , next) {
    req.db = db
    next()
});

// Multer Config
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage });

// Using Routes
app.use('/', index);
app.use('/users', users);
app.use('/posts', posts);
app.use('/categories' , caregories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

module.exports = app;
