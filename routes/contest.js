var express = require('express');
var router = express.Router();
var user, Contest, Trip, Visit;
var socket = require('../socket').init();

/*
    TODO: autheniticatie + juiste response codes
 */

function init() {
    // Contest CRUD
    router.get('/', user.is('admin'), function(req, res, next) {
        Contest.find().select('name description startDate endDate contestLocationPlanning winner').populate('winner').exec(function(err, contestData) {
            if (err) {
                res.render('home', {
                    title: 'Kroegentochten'
                });
            } else {

                //add winner name to contest information\
                for(var x = 0; x < contestData.length; x++){
                  if(contestData[x].winner){
                    var winner = contestData[x].winner;
                    if (winner.local.email) {
                      winner = winner.local.email;
                    }else if (winner.google.name) {
                      winner = winner.google.name;
                    }else if (winner.facebook.name) {
                      winner = winner.facebook.name;
                    }

                    contestData[x].winner = null;
                    contestData[x].winnerName = winner;
                  }
                }

                res.render('home', {
                    title: 'Kroegentochten',
                    contests: contestData
                });
            }
        });
    });

    router.post('/', user.is('admin'), function(req, res) {
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

    router.get('/new-contest', user.is('admin'), function(req, res) {
        res.render('trip/contestmaker', { title: 'Nieuwe tocht' });
    });

    router.get('/:id', user.is('admin'), function(req, res) {
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

    router.put('/:id/planning/', user.is('admin'), function(req, res) {
        Contest.addPlanning(req.params.id, req.body.planning, function(err) {
            if (err) {
                res.redirect('');
            }
        })
    });

    router.delete('/:id', user.is('admin'), function(req, res) {
        Contest.remove({ _id: req.params.id }, function(err) {
            if (err) {
                res.status(300)
            }
        });
    });
    // / Contest CRUD

    // Location check-in
    router.get('/:contestId/planner/:planningId/visits', user.is('player'), function(req, res) {
        var username = "An user";

        if (req.user.local.email) {
            username = req.user.local.email;
        }
        if (req.user.google.name) {
            username = req.user.google.name;
        }
        if (req.user.facebook.name) {
            username = req.user.facebook.name;
        }

        Contest.findOne({ _id: req.params.contestId }).exec(function(err, contestData) {
            Trip.findOne({ _id: contestData.contestLocationPlanning }).exec(function(err, tripData) {
                if (err) {
                    res.redirect('/home');
                } else {
                    res.render('./trip/checkin', {
                        id: contestData._id,
                        userName: username,
                        name: contestData.name,
                        trip: tripData,
                    });
                }
            });
        });
    });

    router.post('/:contestId/planner/:planningId/locations/:locationId/visits', socket.checkIn(), user.is('player'), function(req, res) {
        Trip.getLocation(req.params.planningId, req.params.locationId, function(location) {
            var visitObject = {
                location: location.route[0].name,
                user: req.user._id,
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
            res.send();
        });
    });

    router.get('/:contestId/planner/:planningId/locations/', user.is('admin'), function(req, res) {
        var contest = req.params.contestId;
        var planning = req.params.planningId;

        Contest.findOne({ _id: contest }).exec(function(err, contestData) {
            Trip.findOne({ _id: planning }).exec(function(err, tripData) {
                if (err) {
                    res.redirect('/home');
                } else {
                    res.render('./trip/contestlocations', {
                        id: contestData._id,
                        name: contestData.name,
                        trip: tripData,
                    });
                }
            });
        });
    });

    router.get('/:contestId/planner/:planningId/locations/:locationId/', user.is('admin'), function(req, res) {
        var contest = req.params.contestId;
        var trip = req.params.planningId;
        var location = req.params.locationId;

        Trip.findOne({ _id: trip }, { 'route': { $elemMatch: { _id: location } } }, function(err, location) {
            Contest.findOne({ _id: contest }).populate('locationVisits contestLocationPlanning').exec(function(err, contestData) {
                var locationVisitsPerLocation = [];
                for (var i = 0; i < contestData.locationVisits.length; i++) {
                    if (contestData.locationVisits[i].location === location.route[0].name) {
                        locationVisitsPerLocation.push(contestData.locationVisits[i]);
                    }
                }
                if (err) {
                    res.redirect('/home');
                } else {
                    res.render('./trip/location', {
                        contest: contestData.name,
                        planning: contestData.contestLocationPlanning.name,
                        location: location.route[0].name,
                        visits: locationVisitsPerLocation
                    });
                }
            });
        });
    });
    // / Location check-in
}
// Export
module.exports = function(usr, mongoose) {
    user = usr;
    Contest = mongoose.model("Contest");
    Trip = mongoose.model("ContestLocationPlanning");
    Visit = mongoose.model("ContestLocationData");
    init();
    return router;
};
