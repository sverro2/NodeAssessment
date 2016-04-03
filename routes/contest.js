var express = require('express');
var router = express.Router();
var passport, user, Contest, Trip, Visit;
var socket = require('../socket').init();

// Contest CRUD
router.get('/', function(req, res, next) {
    Contest.find().select('name description startDate endDate contestLocationPlanning').exec(function(err, contestData) {
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

router.post('/', function(req, res) {
    var contest = new Contest({
        name: req.body.contestName,
        description: req.body.contestDescription,
        startDate: new Date(req.body.contestStartDate).toISOString(),
        endDate: new Date(req.body.contestEndDate).toISOString()
    });
    contest.save(function(err) {
        if (err) {
            console.log(err);
            res.redirect('./new-contest');
        } else {
            res.redirect('./');
        }
    });
});

router.get('/new-contest', function(req, res) {
    res.render('trip/contestmaker', { title: 'Nieuwe tocht' });
});

router.get('/:id', function(req, res) {
    var contest = req.params.id;
    Contest.findOne({ _id: contest }).exec(function(err, contestData) {
        if (err) {
            res.redirect('/planner');
        } else {
            res.render('./trip/contestmaker', {
                title: 'Bewerk Tocht',
                id: contestData._id,
                name: contestData.name,
                description: contestData.description,
                planning: contestData.contestLocationPlanning
            });
        }
    });
});

router.put('/:id/planning/', function(req, res) {
    Contest.addPlanning(req.params.id, req.body.planning, function(err) {
        if (err) {
            res.redirect('');
        }
    })
});

router.delete('/:id', function(req, res) {
    Contest.remove({ _id: req.params.id }, function(err) {
        if (err) {
            res.status(300)
        }
    });
});
// / Contest CRUD

// Location check-in
router.post('/:contestId/planner/:planningId/locations/:locationId/visits', socket.checkIn(), function(req, res) {
    Trip.getLocation(req.params.planningId, req.params.locationId, function(location) {
        var visitObject = {
            location: location.route[0].name,
            user: user._id,
            time: new Date()
        };
        Visit.addVisit(visitObject, function(visit, err) {
            if (err) {
                console.log("An error occured while submitting a visit to the database: " + err);
            } else {
                Contest.addVisit(req.params.contestId, visit._id, function(err) {
                    if (err) {
                        console.log("An error occured while submitting a visit to a contest: " + err);
                    }
                });
            }
        });
        res.redirect('/planner');
    });
});

router.get('/:contestId/planner/:planningId/locations/:locationId/visits', function(req, res) {
    var trip = req.params.planningId;
    var location = req.params.locationId;

    // TODO: Locatie ophalen (Plus visits)

});
// / Location check-in

// Export
module.exports = function(usr, mongoose) {
    user = usr;
    Contest = mongoose.model("Contest");
    Trip = mongoose.model("ContestLocationPlanning");
    Visit = mongoose.model("ContestLocationData");
    return router;
};
