var express = require('express');
var router = express.Router();
var passport, user, Contest, Trip, Visit;
var socket = require('../socket').init();

/*
    TODO: autheniticatie + juiste response codes
 */

function init() {
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

    router.get('/:id', user.is('player'), function(req, res) {
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
    router.get('/:contestId/planner/:planningId/visits', user.is('player'), function(req, res) {
        var username = "An user";
        
        if(req.user.local.email){
            username = req.user.local.email;
        }
        if(req.user.google.name){
            username = req.user.google.name;
        }
        if(req.user.facebook.name){
            username = req.user.facebook.name;
        }
        
        Contest.findOne({ _id: req.params.contestId }).exec(function(err, contestData) {
            Trip.findOne({ _id: contestData.contestLocationPlanning }).exec(function(err, tripData) {
                if (err) {
                    res.redirect('/planner');
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
            res.redirect('/planner');
        });
    });

    router.get('/:contestId/planner/:planningId/locations/:locationId/visits', function(req, res) {
        var trip = req.params.planningId;
        var location = req.params.locationId;

        // TODO: Locatie ophalen (Plus visits)

    });
    // / Location check-in
}

// Export
module.exports = function(pass, usr, mongoose) {
    passport = pass;
    user = usr;
    console.log(user);
    Contest = mongoose.model("Contest");
    Trip = mongoose.model("ContestLocationPlanning");
    Visit = mongoose.model("ContestLocationData");
    init();
    return router;
};
