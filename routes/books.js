var express = require('express');
var router = express();
var Book;
var _ = require('underscore');
var handleError;
var async = require('async');

function getBooks(req, res){
	var query = Book.find();

	query.exec(function (err, data) {
		res.json(data);
	});

	if(req.params.id){
		query._id = req.params.id.toLowerCase();
	}

	if(req.params.id){
		data = data[0];
	}
}

// Routing
router.route('/')
	.get(getBooks);

router.route('/:id')
	.get(getBooks);

// Export
module.exports = function (mongoose, errCallback){
	console.log('Initializing books routing module');
	Book = mongoose.model('Book');
	handleError = errCallback;
	return router;
};
