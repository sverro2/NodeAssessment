var express = require('express');
var router = express.Router();

var user, Contest, Trip, Visit;
var socket = require('../socket').init();

function init() {

    router.get('/', function(req, res) {
        res.render('login/index'); // load the index.ejs file
    });

    router.get('/profile', user.is('player'), function(req, res) {
        res.render('login/profile', {
            user : req.user // get the user out of session and pass to template
        });
    });

    router.get('/searchPlanning', function (req, res) {
        Trip.find().select('name').exec(function (err, tripData) {
            if (err) {
                console.log('an error occurred while fetching the planninglist: ' + err);
            }
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
}
// Export
module.exports = function (usr, mongoose) {
    user = usr;
    Contest = mongoose.model("Contest");
    Trip = mongoose.model("ContestLocationPlanning");
    Visit = mongoose.model("ContestLocationData");
    init();
    return router;
};
