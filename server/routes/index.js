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
    models.Profile.create({
      UserUsername: req.query.Username
    });
    res.json(user);
  });
});

router.get('/users', function(req, res) {
  models.Users.findAll({}).then(function(users) {
    res.json(users);
  });
});

//-- PROFILE ENDPOINTS
router.put('/profile/:username', function(req, res) {
  console.log(req.params);
  console.log(req.query);
  models.Profile.find({
    where: {
      UserUsername: req.params.username
    }
  }).then(function(profile) {
    if(profile){
      profile.updateAttributes({
        PictureURL: req.query.PictureURL,
        Description: req.query.Description
      }).then(function(new_profile) {
        res.send(new_profile);
      });
    }
  });
});

module.exports = router;
