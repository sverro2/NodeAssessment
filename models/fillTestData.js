var Book;

function saveCallback(err){
	if(err){
		console.log('Fill testdata failed, reason: %s', err)
	}
};


function fillTestBooks(callback){
	var date1 = new Date();
	date1.setDate(date1.getDate()-1);
	var testData = [
		// Vul hier je testdata voor boeken in
		// {}, {}, {}
		{
			name: 'Het grote mooie onbewoonde eiland',
			publishDate: date1,
			category: 'Fantasy',
			chapters: [{title: 'Het begin', numberOfPages: 5},{title: 'Het einde', numberOfPages: 3}]
		},
		{
			name: 'Naar morgen',
			publishDate: date1,
			category: 'Realitijd',
			chapters: [{title: 'Het opstaan', numberOfPages: 4},{title: 'Naar bed', numberOfPages: 16}]
		}
	];

	Book.find({}, function(err, data){
		// Als er nog geen boeken zijn vullen we de testdata
		if(data.length == 0){
			console.log('Creating books testdata');

			testData.forEach(function(book){
				new Book(book).save(saveCallback);
			});
		} else{
			console.log('Skipping create courses testdata, allready present');
		}

		if(callback){ callback(); }
	});
};

module.exports = function(mongoose){
	Book = mongoose.model('Book');

	fillTestBooks();
}
