var express = require('express');
var router = express.Router();
var passport, user;

function init(){
  /* Returns a package with some values to assert correct implementation of test frameworks */
  router.get('/test', function (req, res) {
      var toReturn = {
          intje: 42,
          stringetje: "Haha cool, blijkbaar werkt het"
      };
      res.json(toReturn);
  });

  router.get('/', function(req, res) {
      res.render('login/index'); // load the index.ejs file
  });

  router.get('/auth/local/login', function(req, res) {

      // render the page and pass in any flash data if it exists
      res.render('login/login', { message: req.flash('loginMessage') });
  });

  router.post('/auth/local/login', passport.authenticate('local-login', {
      successRedirect : '/auth/profile', // redirect to the secure profile section
      failureRedirect : '/auth/local/login', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
  }));

  router.get('/auth/local/signup', function(req, res) {

      // render the page and pass in any flash data if it exists
      res.render('login/signup', { message: req.flash('signupMessage') });
  });

  router.post('/auth/local/signup', passport.authenticate('local-signup', {
      successRedirect : '/auth/profile', // redirect to the secure profile section
      failureRedirect : '/auth/local/signup', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
  }));

  router.get('/auth/profile', user.is('player'), function(req, res) {
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
          successRedirect : '/auth/profile',
          failureRedirect : '/'
      }));

  router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

  // the callback after google has authenticated the user
  router.get('/auth/google/callback',
     passport.authenticate('google', {
             successRedirect : '/auth/profile',
             failureRedirect : '/'
     }));

  // locally --------------------------------
  router.get('/auth/local/addition', function(req, res) {
      res.render('login/connect-local', { message: req.flash('loginMessage') });
  });

  // local -----------------------------------
  router.delete('/auth/local', function(req, res) {
      var user            = req.user;
      user.local.email    = undefined;
      user.local.password = undefined;
      user.save(function(err) {
          res.send();
      });
  });

  // facebook -------------------------------
  router.delete('/auth/facebook', function(req, res) {
      var user            = req.user;
      user.facebook.token = undefined;
      user.save(function(err) {
          res.send();
      });
  });

  // twitter --------------------------------
  router.delete('/auth/twitter', function(req, res) {
      var user           = req.user;
      user.twitter.token = undefined;
      user.save(function(err) {
         res.send();
      });
  });

  // google ---------------------------------
  router.delete('/auth/google', function(req, res) {
      var user          = req.user;
      user.google.token = undefined;
      user.save(function(err) {
         res.send();
      });
  });

  router.get('/auth/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });
}
// Export
module.exports = function (pass, usr){
  passport = pass;
  user = usr;
  init();
	return router;
};
