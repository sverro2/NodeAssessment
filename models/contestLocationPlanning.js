function init(mongoose){
	console.log('Iniializing contestLocationPlanning schema');

	var Schema = mongoose.Schema;

	var contestLocationPlanning = new Schema({
		name: { type: String, required: true },
		description: { type: String, required: false },
		route: { type: [
		{
			_id: { type: String, required: true },
			name: { type: String, required: true },
			lat: { type: Number, required: true },
			long: { type: Number, required: true }
		}]}
	});

	contestLocationPlanning.statics.addLocation = function(planningId, locationObjectsArray, cb){
		this.update({_id: planningId}, { $addToSet: { route: { $each: locationObjectsArray } } }, cb);
  }

	mongoose.model('ContestLocationPlanning', contestLocationPlanning);
}

module.exports = init;
