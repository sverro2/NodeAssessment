function init(mongoose) {
    console.log('Iniializing contest schema');
    var ValidationError = mongoose.Error.ValidationError;
    var ValidatorError  = mongoose.Error.ValidatorError;

    var Schema = mongoose.Schema;
    var DateAfterTodayChecker = {
        validator: function (v) {
            return v >= new Date();
        }, message: '{VALUE} is not a date before today'
    }

    var contest = new Schema({
        name: { type: String, required: true },
        description: { type: String, required: false },
        startDate: {
            type: Date,
            required: true,
            validate: DateAfterTodayChecker
        },
        endDate: {
            type: Date,
            required: true,
            validate: DateAfterTodayChecker
        },
        contestLocationPlanning: { type: Schema.Types.ObjectId, ref: 'ContestLocationPlanning', required: false},
        locationVisits: { type: [{ type: Schema.Types.ObjectId, ref: 'ContestLocationData' }], required: false },
        winner: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        players: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], required: false }
    });

    contest.pre('validate', function (next) {
        if (this.startDate > this.endDate) {
            next(Error('End Date must be greater than Start Date'));
        } else {
            next();
        }
    });
    //contest.set('toJSON', { virtuals: true });

    contest.statics.addContest = function (contestObject, cb) {
        var data = new this(contestObject);
        data.save(function (err, contest) {
            if (err) {
                console.log("An error occured" + err);
            }
            if (cb) {
                cb(contest);
            }
        });
    }

    contest.statics.addPlanning = function (contestId, planning, cb) {
        this.update({ _id: contestId }, { $set: { contestLocationPlanning: planning } }, cb);
    }

    contest.statics.addVisit = function (contestId, visit, cb) {
        this.update({ _id: contestId }, { $push: { locationVisits: visit } }, cb);
    }

    contest.statics.playerStatusForContest = function(playerId, contestId, cb, cached){
      if(cached && cacheObject.locationVisitsInContest){
          cb(compileVisitedPlaceOverview(cacheObject.locationVisitsInContest, playerId));
      }else{
        this.findOne({_id: contestId}).populate('locationVisits contestLocationPlanning').exec(function(err, contestData){
          cb(compileVisitedPlaceOverview(contestData, playerId));
        });
      }
    }

    contest.statics.resetCache = function(cacheObjectName){
      cacheObject[cacheObjectName] = null;
    }

    var compileVisitedPlaceOverview = function compileVisitedPlaceOverview(contestData, playerId){
      cacheObject.locationVisitsInContest = contestData;
      var locationsVisited = [];
      var locationsToGo = [];

      for(var i = 0; i < contestData.locationVisits.length; i++){
          if(contestData.locationVisits[i].user.toString() === playerId.toString()){
              locationsVisited.push(contestData.locationVisits[i].location);
          }
      }

      for(var i = 0; i < contestData.contestLocationPlanning.route.length; i++){
          if(locationsVisited.indexOf(contestData.contestLocationPlanning.route[i].name) < 0){
              locationsToGo.push(contestData.contestLocationPlanning.route[i]);
          }
      }

      returnObject = {
        locationsVisited: locationsVisited,
        locationsToGo : locationsToGo,
        contest: contestData,
        playerId: playerId
      }

      return returnObject;
    }

    var cacheObject = {
      locationVisitsInContest: null
    }

    mongoose.model('Contest', contest);
}

module.exports = init;
