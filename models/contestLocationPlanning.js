function init(mongoose){
	console.log('Iniializing contestLocationPlanning schema');

	var Schema = mongoose.Schema;

	var contestLocationPlanning = new Schema({
		name: { type: String, required: true },
		description: { type: String, required: false },
		route: { type: [
		{
			googleId: { type: String, required: true },
			name: { type: String, required: true },
			lat: { type: String, required: true },
			long: { type: String, required: true }
		}]}
	});

	//contestLocationPlanning.set('toJSON', { virtuals: true });

	mongoose.model('ContestLocationPlanning', contestLocationPlanning);
}

module.exports = init;
