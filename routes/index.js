var express = require('express');
var router = express.Router();
var request, places_key;
var async = require('async');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('home', { title: 'Express' });
});

/* Returns a package with some values to assert correct implementation of test frameworks */
router.get('/test', function (req, res) {
    var toReturn = {
        intje: 42,
        stringetje: "Haha cool, blijkbaar werkt het"
    };
    res.json(toReturn);
});

//how to use the places API
router.get('/placesTest', function (req, res) {
  var googlePlacesRequests = [];
  var cafes, restaurants;
  googlePlacesRequests.push(function(callback){
    request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=51.688074,5.284939&radius=500&type=cafe&key=' + places_key, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = body;
        // do more stuff
        cafes = info;
      }
      callback();
    });
  });

  googlePlacesRequests.push(function(callback){
    request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=51.688074,5.284939&radius=500&type=restaurant&key=' + places_key, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = body;
        // do more stuff
        restaurants = info;
      }
      callback();
    });
  });


  async.parallel(googlePlacesRequests, function(){
    //console.log('gelogt: ' + '{ "een": {'cafes + '}, "twee": {' + restaurants + '}');
    res.json(JSON.parse('{ "een": ' + cafes + ', "twee": ' + restaurants + '}'));
  });
});

// Export
module.exports = function (req, GLOBAL_VARS){
  request = req;
  places_key = GLOBAL_VARS.google_places_api_key;
	return router;
};
