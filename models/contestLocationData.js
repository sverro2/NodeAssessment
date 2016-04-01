function init(mongoose) {
    console.log('Iniializing contestLocationData schema');

    var Schema = mongoose.Schema;

    var contestLocationData = new Schema({
        location: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        time: { type: Date, required: true }
    });
    
    // RIK
    contestLocationData.statics.addVisit = function (locationVisitObject, cb) {
        var data = new this(locationVisitObject);
        data.save(function (err, visit) {
            if (err) {
                console.log("An error occured" + err);
            }
            if (cb) {
                cb(err);
            }
        });
    }

    contestLocationData.statics.getVisits = function (locationVisitId, cb) {
        this.findOne({ '_id': locationVisitId }, 'route', function (err, visit) {
            if (err) {
                console.log("An error occured" + err);
            }
            if (cb) {
                cb(err);
            }
        });
    }
    // /RIK

    mongoose.model('ContestLocationData', contestLocationData);
}

module.exports = init;
