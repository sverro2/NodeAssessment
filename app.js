var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var flash   = require('connect-flash');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var exphbs  = require('express-handlebars');
var request = require('request');
var session = require('express-session');
var passport = require('passport');
var ConnectRoles = require('connect-roles');

var GLOBAL_VARS = {
  google_places_api_key: "AIzaSyAdex7lYIUaHxMyYzVBcpYWieNaCJc_PRM"
}

// Data Access Layer
mongoose.connect('mongodb://admin:wachtwoord@ds015879.mlab.com:15879/node-assessment');

var user = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when
    // user fails authorisation
    var accept = req.headers.accept || '';
    res.status(403);
    if (~accept.indexOf('html')) {
      res.render('access-denied', {action: action});
    } else {
      res.send('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});

// Models
require('./models/contestLocationPlanning')(mongoose);
require('./models/contestLocationData')(mongoose);
require('./models/contest')(mongoose);
require('./models/user')(mongoose);

//passport config
require('./config/passport')(passport, mongoose); // pass passport for configuration

function handleError(req, res, statusCode, message){
    console.log();
    console.log('-------- Error handled --------');
    console.log('Request Params: ' + JSON.stringify(req.params));
    console.log('Request Body: ' + JSON.stringify(req.body));
    console.log('Response sent: Statuscode ' + statusCode + ', Message "' + message + '"');
    console.log('-------- /Error handled --------');
    res.status(statusCode);
    res.json(message);
};

var app = express();

// view engine setup
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash()); // use connect-flash for flash messages stored in session

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(user.middleware());

// Routes
var index = require('./routes/index')(user, mongoose);
var planner = require('./routes/trip')(request, GLOBAL_VARS, mongoose, user);
var auth = require('./routes/login')(passport);
var contest = require('./routes/contest')(passport, user, mongoose)

app.use('/', index);
app.use('/planner', planner);
app.use('/contest', contest);
app.use('/auth', auth);

//anonymous users can only access the home page
//returning false stops any more rules from being
//considered
user.use(function (req, action) {
  if (!req.isAuthenticated()) return action === 'access home page';
})

//moderator users can access private page, but
//they might not be the only ones so we don't return
//false if the user isn't a moderator
user.use('player', function (req) {
  if (req.user.role === 'player') {
    return true;
  }
})

//admin users can access all pages
user.use(function (req) {
  if (req.user.role === 'admin') {
    return true;
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            status: err.status,
            error: err.stack
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status: err.status,
        error: {}
    });
});

module.exports = app;
