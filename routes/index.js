var express = require('express');
var router = express.Router();

var userQueries = require('../queries/users-queries');
var groupQueries = require('../queries/groups-queries');

router.get('/', function(req, res, next) {
	res.send('Hello World.');
});

// -- Users Queries
router.get('/api/users', userQueries.getAllUsers);
router.get('/api/users/:username', userQueries.getSingleUser);
router.post('/api/users', userQueries.createUser);
router.post('/api/users/updatePassword/', userQueries.updateUser);

//-- Groups Queries
router.get('/api/groups', groupQueries.getAllGroups);
router.post('/api/groups/new', groupQueries.createNewGroup);


module.exports = router;