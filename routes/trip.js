var express = require('express');
var router = express.Router();
var request, places_key, Trip, Visit, User;
var async = require('async');
var socket = require('../socket').init();

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
        res.render('./trip/routeplanner', {
          title: 'Bewerk Trip',
          id: tripData._id,
          name: tripData.name,
          description: tripData.description,
          route: tripData.route});
      }
    });
});

router.delete('/:id', function (req, res) {
    Trip.remove({_id: req.params.id}, function(err){
      if(err){
        res.status(300)
      }
    });

    res.send();
});

router.post('/:id/locations', function(req, res){
  var locationsInput = req.body;
  var newLocations = [];
  for(var key in locationsInput){
      var location = locationsInput[key];
      newLocations.push(JSON.parse(location));
   }
  Trip.addLocation(req.params.id, newLocations, function(err){
    if(err){
      console.log("An error occured while adding locations to the database: " + err);
    }
  });
  res.redirect('/planner');
});

router.delete('/:id/locations/:location', function(req, res){
  console.log("Nu wordt " + req.params.id + " verwijderd" + req.params.location);
  Trip.deleteLocation(req.params.id, req.params.location, function(err){
    if(err){
      res.status(300)
    }
  });
  res.send();
});

router.post('/:id/searchLocations/:key', function(req, res){
  //get location from adress
  request('https://maps.googleapis.com/maps/api/geocode/json?address=' +
  req.params.key + '&key=' + places_key, function (error, response, body) {
    var locationData = JSON.parse(body)
    if(locationData.results[0]){
      var location = locationData.results[0].geometry.location;

      //async search all POI's
      var googlePlacesRequests = [];
      var cafes, bars;
      googlePlacesRequests.push(function(callback){
        request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+
        location.lat + ','+ location.lng +'&radius=500&type=cafe&key=' +
        places_key, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            cafes = JSON.parse(body);
          }
          callback();
        });
      });

      googlePlacesRequests.push(function(callback){
        request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+
        location.lat + ','+ location.lng +'&radius=500&type=bar&key=' +
        places_key, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            bars = JSON.parse(body);
          }
          callback();
        });
      });

      async.parallel(googlePlacesRequests, function(){
        var returnObject = { items: [] };
        Trip.getLocations(req.params.id, function(locations){
          addToReturn(locations);
        });

        function addToReturn(locations){
          if(bars.results[0]){
            bars.results.forEach(function(item){
              addItemToReturnObject(item, returnObject, locations);
            });
          }

          if(cafes.results[0]){
            cafes.results.forEach(function(item){
              addItemToReturnObject(item,returnObject, locations);
            });
          }
          res.json(returnObject);
        }
      });
    }
  });
});

// Location check-in
router.post('/:id/locations/:locationId/visits', socket.checkIn(), function(req,res) {
    Trip.getLocation(req.params.id, req.params.locationId, function(location){
        var visitObject = {
            location: location.route[0].name,
            user: User._id,
            time: new Date()
        };
        Visit.addVisit(visitObject, function(err){
            if(err){
                console.log("An error occured while submitting a visit to the database: " + err);
            }
        });
        res.redirect('/planner');
    });
});

router.get('/:id/locations/:locationId/visits', function (req,res){
    var trip = req.params.id;
    var location = req.params.locationId;
    
    // TODO: Locatie ophalen (Plus visits)
    
});

router.get('/:id/visits', function (req, res) {
    var trip = req.params.id;
    Trip.findOne({_id: trip}).exec(function(err, tripData){
      if(err){
        res.redirect('/planner');
      }else{
        res.render('./trip/checkin', {
          title: 'Bewerk Trip: check-in',
          id: tripData._id,
          name: tripData.name,
          description: tripData.description,
          route: tripData.route});
      }
    });
});
// / Location check-in

//only adds item to the list when not already added to planning or the list itself
function addItemToReturnObject(item, returnObject, addedLocations){
  var exists;
  //check whether or not item does not already exist in returnObject or is already added to the planning
  for(var x = 0; x < addedLocations.route.length; x++){
    exists = addedLocations.route[x]._id == item.id;
    if(exists){
      return;
    }
  }
  for(var x = 0; x < returnObject.items.length; x++){
    exists = returnObject.items[x]._id == item.id;
    if(exists){
      return;
    }
  }
  returnObject.items.push(
    {
      _id: item.id, name: item.name.replace(/['"]+/g, ""),
      lat: item.geometry.location.lat,
      long: item.geometry.location.lng
    }
  );

}

// Export
module.exports = function (req, GLOBAL_VARS, mongoose, user){
    request = req;
    places_key = GLOBAL_VARS.google_places_api_key;
    Trip = mongoose.model('ContestLocationPlanning');
    Visit = mongoose.model('ContestLocationData');
    User = user;
    return router;
};
