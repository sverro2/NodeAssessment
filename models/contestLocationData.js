function init(mongoose){
	console.log('Iniializing contestLocationData schema');

	var Schema = mongoose.Schema;

	var contestLocationData = new Schema({
		contest: { type: Schema.Types.ObjectId, ref: 'Contest' },
		locationVisits: { type:
			[
				{
					location: { type: String, required: true},
					user: { type: Schema.Types.ObjectId, ref: 'User'},
					time: {type: Date, required: true}
				}
			]
		}
	});

	//contestLocationPlanning.set('toJSON', { virtuals: true });

	//TODO: Er moet nog een static gemaakt worden die aantal
	contestLocationData.methods.hasRole = function(roleToSearch){
    return this.roles.indexOf(roleToSearch) > -1
  }

	contestLocationData.methods.addData = function(contestId, location, user, time){
    //check if contestLocationData already exists for this particular contest
		//if no create new contestLocationData for contest
		//if yes check if user with particular location has already been added
		//if yes return
		//if no add new data to LocationData
  }

	mongoose.model('ContestLocationData', contestLocationData);
}

module.exports = init;
