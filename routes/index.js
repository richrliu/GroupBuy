var express = require('express');
var router = express.Router();

var userQueries = require('../queries/users-queries');

router.get('/', function(req, res, next) {
	// res.send('Hello World.');
	res.render('index', {title: 'PalPay'});
});

// -- Users Queries
router.get('/api/users', userQueries.getAllUsers);
router.get('/api/users/:username', userQueries.getSingleUser);
router.post('/api/users', userQueries.createUser);
router.post('/api/users/updatePassword/', userQueries.updateUser);

module.exports = router;