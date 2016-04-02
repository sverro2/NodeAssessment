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

	contestLocationPlanning.statics.deleteLocation = function(planningId, locationId, cb){
		this.update({_id: planningId}, { $pull: { route: {_id: locationId} } }, cb);
  }

	contestLocationPlanning.statics.getLocations = function(planningId, cb){
		this.findOne({ '_id': planningId }, 'route', function(err, planning){
			if(err){
				console.log("An error occured" + err);
			}
			if(cb){
				cb(planning);
			}
		});
  }
  
  contestLocationPlanning.statics.getLocation = function(planningId, locationId, cb){
    this.findOne({ '_id': planningId }, {'route': {$elemMatch: {'_id': locationId}}}, function(err, planning){
			if(err){
				console.log("An error occured" + err);
			}
			if(cb){
				cb(planning);
			}
		});
  }

	mongoose.model('ContestLocationPlanning', contestLocationPlanning);
}

module.exports = init;
