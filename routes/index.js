var express = require('express');
var router = express.Router();
var passport, user, Contest, Trip;

function init(){
// Contest CRUD
router.get('/contest', function (req, res, next) {
    Contest.find().select('name description startDate endDate').exec(function (err, contestData) {
        if (err) {
            res.render('home', {
                title: 'Kroegentochten'
            });
        } else {
            res.render('home', {
                title: 'Kroegentochten',
                contests: contestData
            });
        }
    });
});

router.post('/contest', function (req, res) {
    var contest = new Contest({
        name: req.body.contestName,
        description: req.body.contestDescription,
        startDate: new Date(),
        endDate: new Date()
    });
    contest.save(function (err) {
        if (err) {
            res.redirect('./new-contest');
        } else {
            res.redirect('/');
        }
    });
});

router.get('/new-contest', function (req, res) {
    res.render('trip/contestmaker', { title: 'Nieuwe tocht' });
});

router.get('/contest/:id', function (req, res) {
    var contest = req.params.id;
    Contest.findOne({_id: contest}).exec(function(err, contestData){
      if(err){
        res.redirect('/planner');
      }else{
        res.render('./trip/contestmaker', {
          title: 'Bewerk Tocht',
          id: contestData._id,
          name: contestData.name,
          description: contestData.description,
          planning: contestData.contestLocationPlanning});
      }
    });
});

router.put('/contest/:id/planning/', function (req, res) {
    Contest.addLocation(req.params.id, req.body.planning, function(err){
        if(err){
            console.log("An error occured while adding locations to the database: " + err);
        }
    })
});

router.delete('/contest/:id', function (req, res) {
    Contest.remove({ _id: req.params.id }, function (err) {
        if (err) {
            res.status(300)
        }
    });
});

router.get('/searchPlanning', function(req,res){
    Trip.find().select('name').exec(function(err, tripData){
        if(err){
            console.log('An error occured while fetching the planninglist: ' + err)
        };
        res.json(tripData);
    });
})
// / Contest CRUD

//loginroutes
// =====================================
// HOME PAGE (with login links) ========
// =====================================
router.get('/', function(req, res) {
    res.render('login/index'); // load the index.ejs file
});

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login/login', { message: req.flash('loginMessage') });
});

// process the login form
// app.post('/login', do all our passport stuff here);
// process the login form
router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));
// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login/signup', { message: req.flash('signupMessage') });
});

// process the signup form
// app.post('/signup', do all our passport stuff here);
// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));
// =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile', user.is('player'), function(req, res) {
    res.render('login/profile', {
        user : req.user // get the user out of session and pass to template
    });
});

router.get('/admin', user.is('admin'), function(req, res) {
    res.render('login/profile', {
        user : req.user // get the user out of session and pass to template
    });
});

// =====================================
// FACEBOOK ROUTES =====================
// =====================================
// route for facebook authentication and login
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
   passport.authenticate('google', {
           successRedirect : '/profile',
           failureRedirect : '/'
   }));

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

// locally --------------------------------
router.get('/connect/local', function(req, res) {
    res.render('login/connect-local', { message: req.flash('loginMessage') });
});
router.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// facebook -------------------------------

// send to facebook to do the authentication
router.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

// handle the callback after facebook has authorized the user
router.get('/connect/facebook/callback',
    passport.authorize('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));


// google ---------------------------------
// send to google to do the authentication
router.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

// the callback after google has authorized the user
router.get('/connect/google/callback',
    passport.authorize('google', {
        successRedirect : '/profile',
        failureRedirect : '/'
    }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

// local -----------------------------------
router.get('/unlink/local', function(req, res) {
    var user            = req.user;
    user.local.email    = undefined;
    user.local.password = undefined;
    user.save(function(err) {
        res.redirect('/profile');
    });
});

// facebook -------------------------------
router.get('/unlink/facebook', function(req, res) {
    var user            = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
        res.redirect('/profile');
    });
});

// twitter --------------------------------
router.get('/unlink/twitter', function(req, res) {
    var user           = req.user;
    user.twitter.token = undefined;
    user.save(function(err) {
       res.redirect('/profile');
    });
});

// google ---------------------------------
router.get('/unlink/google', function(req, res) {
    var user          = req.user;
    user.google.token = undefined;
    user.save(function(err) {
       res.redirect('/profile');
    });
});
}
// Export
module.exports = function (pass, usr, mongoose){
    passport = pass;
    user = usr;
    Contest = mongoose.model("Contest");
    Trip = mongoose.model("ContestLocationPlanning");
    init();
    return router;
};
