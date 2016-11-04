var express = require('express');
var router = express.Router();
var models = require('../models/index');


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//-- USER ENDPOINTS
router.post('/users', function(req, res) {
  console.log(req);
  models.Users.create({
    Username: req.query.Username,
    Password: req.query.Password,
    Ranking: req.query.Ranking
  }).then(function(user) {
    res.json(user);
  });
});

router.get('/users', function(req, res) {
  models.Users.findAll({}).then(function(users) {
    res.json(users);
  });
});

module.exports = router;
