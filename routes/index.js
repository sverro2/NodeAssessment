var express = require('express');
var router = express.Router();
var request, places_key, User, Contest, Trip;
var async = require('async');

// Contest CRUD
router.get('/', function (req, res, next) {
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
// / Contest CRUD

router.get('/searchPlanning', function(req,res){
    Trip.find().select('name').exec(function(err, tripData){
        console.log(err);
        console.log(tripData);
      res.json(tripData);
    });
})


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
    googlePlacesRequests.push(function (callback) {
        request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=51.688074,5.284939&radius=500&type=cafe&key=' + places_key, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = body;
                // do more stuff
                cafes = info;
            }
            callback();
        });
    });

    googlePlacesRequests.push(function (callback) {
        request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=51.688074,5.284939&radius=500&type=restaurant&key=' + places_key, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = body;
                // do more stuff
                restaurants = info;
            }
            callback();
        });
    });

    async.parallel(googlePlacesRequests, function () {
        //console.log('gelogt: ' + '{ "een": {'cafes + '}, "twee": {' + restaurants + '}');
        res.json(JSON.parse('{ "een": ' + cafes + ', "twee": ' + restaurants + '}'));
    });
});

// Export
module.exports = function (req, GLOBAL_VARS, mongoose) {
    request = req;
    places_key = GLOBAL_VARS.google_places_api_key;
    Contest = mongoose.model("Contest");
    User = mongoose.Types.ObjectId("56fc51aea7311b187626b4c1"); // Testdoeleinden
    Trip = mongoose.model("ContestLocationPlanning");
    return router;
};