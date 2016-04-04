var express = require('express');
var router = express.Router();
var Contest, Trip, Visit, User;

function init(){
  router.get('/', User.is('player'), function (req, res) {
    res.redirect('/player/' + req.user._id);
  });

  router.get('/test', function (req, res) {
    //Contest.findOne({ _id: contest }).populate('locationVisits').select('locationVisits').exec(function(err, visits) { ... });
    /*Contest.find({'_id': "56fd8d419c877dbc30000bf2"}).populate('contestLocationPlanning').exec(function (err, contestData) {
        res.json(contestData);
    });*/
  });

  /* GET home page. */
  router.get('/:playerId', function (req, res) {
    Contest.find({'players': req.params.playerId}).select('name description startDate endDate winner').exec(function (err, contestData) {
        if (err) {
            res.render('player/overview', {
                title: 'Mijn Kroegentochten'
            });
        } else {
            contestOverview(contestData, req.params.playerId);
            res.render('player/overview', {
                title: 'Mijn Kroegentochten',
                playerId: req.params.playerId,
                contests: contestData
            });
        }
    });
  });

  function contestOverview(contestData, playerId){
    for(var x = 0; x < contestData.length; x++){
      var status;
      var currentDate = new Date();
      if(contestData[x].winner == playerId){
        status = "You Won!";
      }else if(contestData[x].startDate > currentDate){
        status = "Due";
      }else if(contestData[x].endDate < currentDate){
        status = "You Lost";
      }else{
        status = "Running";
      }

      contestData[x].status = status;
    }
  }

  /* GET home page. */
  router.get('/:playerId/contests', function (req, res) {
    Contest.find().and(
      [{'startDate': {'$gt': new Date()}},
      {'$or':
        [
          {'players': null},
          {'players': {'$ne': req.params.playerId}}
        ]
      }]
    ).select('name description startDate endDate').exec(function (err, contestData) {
        if (err) {
            res.render('player/contests-available', {
                title: 'Add Contest'
            });
        } else {
            res.render('player/contests-available', {
                title: 'Add Contest',
                contests: contestData
            });
        }
    });
  });

  /* Add a new contest to player */
  router.put('/:playerId/contests/:contestId', function (req, res) {

    Contest.findOne({'_id': req.params.contestId}).exec(function(err,contest){
      if(err){
        res.redirect('/player/' + req.params.playerId);
      }
      contest.players.push(req.params.playerId);
      contest.save(function(err, contest){
        if(err){
          console.log("Could not save the updated contest " + JSON.stringify(err));
        }
        res.json({url: '/player/' + req.params.playerId })
      });
    });
  });

  router.delete('/:playerId/contests/:contestId', function (req, res) {
    Contest.findOneAndUpdate(
      { _id: req.params.contestId },
      { $pull: { 'players': req.params.playerId } },
      function(err, results){
        if(err){
          console.log("Error while deleting player from contest");
        }
        console.log(JSON.stringify(results))
        res.send();
      }
    );
  });
  
  
  // Locaties per player per contest
  router.get('/:playerId/contests/:contestId/' ,function(req,res){
      var player = req.params.playerId;
      var contest = req.params.contestId;
      
      Contest.findOne({_id: contest}).populate('locationVisits contestLocationPlanning').exec(function(err, contestData){
            var locationsVisited = [];
            var locationsToGo = [];
            
            for(var i = 0; i < contestData.locationVisits.length; i++){
                if(contestData.locationVisits[i].user.toString() === player.toString()){
                    locationsVisited.push(contestData.locationVisits[i].location);
                }
            }
            
            for(var i = 0; i < contestData.contestLocationPlanning.route.length; i++){
                if(locationsVisited.indexOf(contestData.contestLocationPlanning.route[i].name) < 0){
                    locationsToGo.push(contestData.contestLocationPlanning.route[i]);
                }
            }
            
            if (err) {
                console.log("an error occurred: " + err);
            } else {
                // TODO: compare locations visited and yet to visit for user
                res.render('player/contests-per-player', {
                    contest: contestData,
                    locationsVisited: locationsVisited,
                    locationsToGo : locationsToGo,
                });
            }
      });
  });
  // /Locaties per player per contest

}


// Export
module.exports = function (user, mongoose){
    Contest = mongoose.model('Contest');
    Trip = mongoose.model('ContestLocationPlanning');
    Visit = mongoose.model('ContestLocationData');
    User = user;
    init();
    return router;
};
