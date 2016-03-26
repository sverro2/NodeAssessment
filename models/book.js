function init(mongoose){
	console.log('Iniializing books schema');

	var Schema = mongoose.Schema;
	/*
	TODO: Validation
	- Title: Verplicht, String
	- PublishDate: Verplicht, Date, voor vandaag
	- Category: Verplicht, String
	- Chapters: Array van JSNON { title, numberOfPages }
	*/
	var book = new Schema({
		name: { type: String, required: true },
		publishDate: {
			type: Date,
			required: true,
			validate:
			{
				validator: function(v){
					return v < new Date();
				}, message:'{VALUE} is not a date before today'
			}
		},
		category: {type: String, required: true},
		chapters: {type: [{title: {type: String}, numberOfPages: {type: Number}}]}
	});

	book.virtual('totalNumberOfPages').get(function () {
		var total = 0;
		this.chapters.forEach(function(chapter){
			total += chapter.numberOfPages;
		});
  return total;
	});

	book.set('toJSON', { virtuals: true });

	mongoose.model('Book', book);

	/*
	TODO:
	- De benodigde virtuals (Onder andere totalNumberOfPages, opgebouwd uit numberOfPages van chapters)
	- De benodigde extra validation
	- De benodigde static methods
	- De benodigde instance methods
	*/
}

module.exports = init;
