var express = require('express');
var router = express.Router();
var passport;

function init(){

  router.get('/local/login', function(req, res) {
      // render the page and pass in any flash data if it exists
      res.render('login/login', { message: req.flash('loginMessage') });
  });

  router.post('/local/login', passport.authenticate('local-login', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/auth/local/login', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
  }));

  router.get('/local/signup', function(req, res) {
      // render the page and pass in any flash data if it exists
      res.render('login/signup', { message: req.flash('signupMessage') });
  });

  router.post('/local/signup', passport.authenticate('local-signup', {
      successRedirect : '/profile', // redirect to the secure profile section
      failureRedirect : '/auth/local/signup', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
  }));

  // =====================================
  // FACEBOOK ROUTES =====================
  // =====================================
  // route for facebook authentication and login
  router.get('/facebook', passport.authenticate('facebook', { scope : 'email' }));

  // handle the callback after facebook has authenticated the user
  router.get('/facebook/callback',
      passport.authenticate('facebook', {
          successRedirect : '/profile',
          failureRedirect : '/'
      }));

  router.get('/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

  // the callback after google has authenticated the user
  router.get('/google/callback',
     passport.authenticate('google', {
             successRedirect : '/profile',
             failureRedirect : '/'
     }));

  // locally --------------------------------
  router.get('/local/addition', function(req, res) {
      res.render('login/connect-local', { message: req.flash('loginMessage') });
  });

  // local -----------------------------------
  router.delete('/local', function(req, res) {
      var user            = req.user;
      user.local.email    = undefined;
      user.local.password = undefined;
      user.save(function(err) {
          res.send();
      });
  });

  // facebook -------------------------------
  router.delete('/facebook', function(req, res) {
      var user            = req.user;
      user.facebook.token = undefined;
      user.save(function(err) {
          res.send();
      });
  });

  // twitter --------------------------------
  router.delete('/twitter', function(req, res) {
      var user           = req.user;
      user.twitter.token = undefined;
      user.save(function(err) {
         res.send();
      });
  });

  // google ---------------------------------
  router.delete('/google', function(req, res) {
      var user          = req.user;
      user.google.token = undefined;
      user.save(function(err) {
         res.send();
      });
  });

  router.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });
}
// Export
module.exports = function (pass){
  passport = pass;
  init();
	return router;
};
