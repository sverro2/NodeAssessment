var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('home', { title: 'Express' });
<<<<<<< HEAD
=======
});

/* Returns a package with some values to assert correct implementation of test frameworks */
router.get('/test', function (req, res) {
    var toReturn = {
        intje: 42,
        stringetje: "Haha cool, blijkbaar werkt het"
    };
    res.json(toReturn);
>>>>>>> refs/remotes/origin/master
});

module.exports = router;
