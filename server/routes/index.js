var express = require('express');
var router = express.Router();
var models = require('../models/index');
var bcrypt = require('bcrypt-node');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//-- USER ENDPOINTS
router.post('/users', function(req, res) {
  var hashedPW = bcrypt.hashSync(req.query.Password);
  models.Users.create({
    Username: req.query.Username,
    Password: hashedPW,
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
