function init(mongoose) {
    console.log('Iniializing contest schema');

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
        contestLocationPlanning: { type: Schema.Types.ObjectId, ref: 'ContestLocationPlanning' },
        locationVisits: { type: [{ type: Schema.Types.ObjectId, ref: 'ContestLocationData' }] },
        winner: { type: Schema.Types.ObjectId, ref: 'User', required: false }
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
        this.update({ _id: contestId }, { $addToSet: { contestLocationPlanning: planning } }, cb); 
    }

    contest.statics.addVisit = function (contestId, visit, cb) {
        this.update({ _id: contestId }, { $push: { locationVisits: visit } }, cb); 
    }

    mongoose.model('Contest', contest);
}

module.exports = init;
