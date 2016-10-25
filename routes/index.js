var express = require('express');
var router = express.Router();

var db = require('../users-queries');

router.get('/', function(req, res, next) {
	res.send('Hello World.');
});

router.get('/api/users', db.getAllUsers);
router.get('/api/users/:username', db.getSingleUser);
router.post('/api/users', db.createUser);
router.post('/api/users/updatePassword/', db.updateUser);


module.exports = router;