function init(mongoose){
	console.log('Iniializing contest schema');

	var Schema = mongoose.Schema;
	var DateAfterTodayChecker = {
		validator: function(v){
			return v < new Date();
		}, message:'{VALUE} is not a date before today'
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
		contestLocationPlanning: { type: Schema.Types.ObjectId, ref: 'ContestLocationPlanning'},
		winner: { type: Schema.Types.ObjectId, ref: 'User', required: false}
	});

	contest.pre('validate', function(next) {
    if (this.startDate > this.endDate) {
        next(Error('End Date must be greater than Start Date'));
    } else {
        next();
    }
});
	//contest.set('toJSON', { virtuals: true });

	mongoose.model('Contest', contest);
}

module.exports = init;
