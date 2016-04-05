var express = require('express');
var router = express.Router();
var Contest, Trip, Visit, User;

function init(){
  router.get('/', User.is('player'), function (req, res) {
    res.redirect('/player/' + req.user._id);
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

  /* GET home page. */
  router.get('/:playerId/contests', function (req, res) {
    Contest.find().and(
      [
        {'startDate': {'$gt': new Date()}},
        {'$or':
          [
            {'players': null},
            {'players': {'$ne': req.params.playerId}}
          ]
        },
        {'contestLocationPlanning': {'$ne': null}}
      ]
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
  router.get('/:playerId/contests/:contestId/', User.is('player') ,function(req,res){
      var player = req.params.playerId;
      var contest = req.params.contestId;

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

      Contest.playerStatusForContest(player, contest, function(data){
        res.render('player/contests-per-player', {
            userName: username,
            contest: data.contest,
            locationsVisited: data.locationsVisited,
            locationsToGo : data.locationsToGo,
        });
      });
  });
}
  // /Locaties per player per contest

function contestOverview(contestData, playerId){
  for(var x = 0; x < contestData.length; x++){
    var status;
    var currentDate = new Date();
    if(contestData[x].winner == playerId){
      status = "You Won!";
    }else if(contestData[x].startDate > currentDate){
      status = "Due";
    }else if(contestData[x].endDate < currentDate || contestData[x].winner){
      status = "You Lost";
    }else{
      status = "Running";
    }
    contestData[x].status = status;
  }
}


// Export
module.exports = function (user, mongoose){
    Contest = mongoose.model('Contest');
    Trip = mongoose.model('ContestLocationPlanning');
    Visit = mongoose.model('ContestLocationData');
    User = user;
    router.contestOverviewFunc = contestOverview;
    init();
    return router;
};
