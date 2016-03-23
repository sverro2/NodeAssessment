function init(mongoose){
	console.log('Iniializing contestLocationData schema');

	var Schema = mongoose.Schema;

	var contestLocationData = new Schema({
			location: { type: String, required: true},
			user: { type: Schema.Types.ObjectId, ref: 'User'},
			time: {type: Date, required: true}
	});

	contestLocationData.statics.addVisit = function(locationVisitObject, cb){
		var data = new this(locationVisitObject);
    data.save(function(err){
      if (err){
        res.redirect('./new-trip');
      }else{
        res.redirect('/planner');
      }
    });
	}

	mongoose.model('ContestLocationData', contestLocationData);
}

module.exports = init;
