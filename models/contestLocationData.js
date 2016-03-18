function init(mongoose){
	console.log('Iniializing contestLocationData schema');

	var Schema = mongoose.Schema;

	var contestLocationData = new Schema({
		contest: { type: Schema.Types.ObjectId, ref: 'Contest' },
		locationVisits: { type: [{location: { type: String, required: true}, user: { type: Schema.Types.ObjectId, ref: 'User'}, time: {type: Date, required: true}}] }
	});

	//contestLocationPlanning.set('toJSON', { virtuals: true });

	//TODO: Er moet nog een static gemaakt worden die aantal
	contestLocationData.methods.hasRole = function(roleToSearch){
    return this.roles.indexOf(roleToSearch) > -1
  }

	mongoose.model('ContestLocationData', contestLocationData);
}

module.exports = init;
