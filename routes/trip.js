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
      if(err){
        res.redirect('/planner');
      }else{
        res.render('./trip/routeplanner', { title: 'Bewerk Trip', id: tripData._id, name: tripData.name, description: tripData.description, rout: tripData.route});
      }
    });
});

router.delete('/:id', function (req, res) {
    Trip.remove({_id: req.params.id}, function(err){
      res.status(304)
    });

    res.send();
});

router.post('/:id/addLocations', function(req, res){
  console.log("Adding locations");
  console.log(req.params.id + " gets some new locations");
  console.log(req.body);
  var locationsInput = req.body;
  var newLocations = [];
  for(var key in locationsInput){
      var location = locationsInput[key];
      console.log("Trying to add location: " + location);
      newLocations.push(JSON.parse(location));
   }
  console.log("Going to add the following locations to the database: " + newLocations);
  Trip.addLocation(req.params.id, newLocations, function(err){
    if(err){
      console.log("An error occured while adding locations to the database: " + err);
    }
  });
  res.json({success: true});
});

router.post('/searchLocations/:key', function(req, res){
  console.log("The key: " + req.params.key)
  //get location from adress
  request('https://maps.googleapis.com/maps/api/geocode/json?address=' + req.params.key + '&key=' + places_key, function (error, response, body) {
    var locationData = JSON.parse(body)
    if(locationData.results[0]){
      console.log('Searching cafes and bars in the neighbourhood of:')
      console.log(locationData.results[0].formatted_address)
      var location = locationData.results[0].geometry.location;

      //async search all POI's
      var googlePlacesRequests = [];
      var cafes, bars;
      googlePlacesRequests.push(function(callback){
        request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+ location.lat + ','+ location.lng +'&radius=500&type=cafe&key=' + places_key, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            cafes = JSON.parse(body);
          }
          callback();
        });
      });

      googlePlacesRequests.push(function(callback){
        request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+ location.lat + ','+ location.lng +'&radius=500&type=bar&key=' + places_key, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            bars = JSON.parse(body);
          }
          callback();
        });
      });

      async.parallel(googlePlacesRequests, function(){
        var returnObject = { items: []};

        //add item to array if it is not already added
        function addItemToReturnObject(item){
          var exists = false;
          for(var x = 0; x < returnObject.items.length; x++){
            exists = returnObject.items[x]._id == item.id;
            if(exists){
              break;
            }
          }
          if(!exists){
            returnObject.items.push({_id: item.id, name: item.name.replace(/['"]+/g, ""), lat: item.geometry.location.lat, long: item.geometry.location.lng});
          }

        }

        if(bars.results[0]){
          bars.results.forEach(function(item){
            addItemToReturnObject(item);
          });
        }

        if(cafes.results[0]){
          cafes.results.forEach(function(item){
            addItemToReturnObject(item);
          });
        }
        res.json(returnObject);
      });
    }
  });
});

// Export
module.exports = function (req, GLOBAL_VARS, mongoose){
  request = req;
  places_key = GLOBAL_VARS.google_places_api_key;
  Trip = mongoose.model('ContestLocationPlanning');
	return router;
};
