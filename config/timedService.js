var Contest;

var serviceData = {
  test: 0
}

function startTimer(){
  setInterval(function(){
    testFunction();
    checkWinners();
  }, 5000);
}

function testFunction(){
  //print serviceData values you want to test to the console
  console.log("\nTest timer: " + serviceData.test++);
}

function checkWinners(){
  var currentDate = new Date();
  Contest.find().and([
    {'startDate': {'$lte': currentDate}},
    {'endDate': {'$gte': currentDate}},
    {'winner': null},
    {'players': {'$ne': null}},
  ]).select('players name').exec(function(err, contestData){
    for(var x = 0; x < contestData.length; x++){
      var amountOfPlayersInContest = contestData[x].players.length;
      var contestId = contestData[x]._id;
      //console.log("id: " + contestId + " (" + contestData[x].name + ") heeft " + amountOfPlayersInContest + " spelers");

      for(var y = 0; y < amountOfPlayersInContest; y++){

        Contest.playerStatusForContest(contestData[x].players[y], contestId, function(data){
          if(data.locationsToGo.length == 0){
            console.log("player " + data.playerId + " heeft gewonnen in " + data.contest.name + " met id " + data.contest._id);
            Contest.update({ _id: data.contest._id }, {$set: {winner: data.playerId }}, function(err,callback){
              if(err){
                console.log("was not able to save winner");
              }else{
                //Ricks geweldige socket magic.
              }
            });
            return; //heel belangrijk... er mogen niet meer winnaars komen in de zelfde check.
          }
        });
      }
    }
  });
}

// expose this function to our app using module.exports
module.exports = function(mongoose) {
  Contest = mongoose.model('Contest');
  startTimer();
  return serviceData;
};
