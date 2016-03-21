var express = require('express');
var router = express.Router();
var request, places_key, Trip;
var async = require('async');

/* GET home page. */
router.get('/', function (req, res) {
    Trip.find().select('name description').exec(function(err, tripData){
      res.render('./trip/overview', { title: 'Overzicht Trips', data: tripData});
    });
});

router.get('/new-trip', function (req, res) {
    res.render('./trip/routeplanner', { title: 'Nieuwe Trip' });
});

router.post('/', function (req, res) {
    var trip = new Trip({name: req.body.tripName, description: req.body.tripDescription});
    trip.save(function(err){
      if (err){
        res.redirect('./new-trip');
      }else{
        res.redirect('/planner');
      }
    });
});

router.post('/:id', function (req, res) {
    var trip = new Trip({_id: req.body.tripId, name: req.body.tripName, description: req.body.tripDescription});
    trip.isNew = false;

    trip.save(function(err){
      if (err){
        console.log(err);
        res.redirect('./new-trip');
      }else{
        res.redirect('/planner');
      }
    });
});

router.get('/:id', function (req, res) {
    var trip = req.params.id;
    Trip.findOne({_id: trip}).exec(function(err, tripData){
      res.render('./trip/routeplanner', { title: 'Bewerk Trip', id: tripData._id, name: tripData.name, description: tripData.description, rout: tripData.route});
    });
});

router.delete('/:id', function (req, res) {
    Trip.remove({_id: req.params.id}, function(err){
      res.status(304)
    });

    res.send();
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
module.exports = function (req, GLOBAL_VARS, mongoose){
  request = req;
  places_key = GLOBAL_VARS.google_places_api_key;
  Trip = mongoose.model('ContestLocationPlanning');
	return router;
};
