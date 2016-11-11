var express = require('express');
var router = express.Router();
var models = require('../models/index');
var bcrypt = require('bcrypt-node');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'PalPay' });
});

router.post('/login', function(req, res, next) {
  var username = req.query.Username;
  var hashedPW = bcrypt.hashSync(req.query.Password);
  models.Users.findOne({username: username, password: hashedPW}).then(function(user) {
    if (user == null) {
      console.log("user not found");
      res.render('index', { title: 'PalPay', error: 'User Not Found' });
    } else {
      var cookie = req.cookies.cookieName;
      console.log(user);
      if (cookie === undefined)
      {
        res.cookie('userLogin', user);
        console.log('cookie created successfully');
      }
      else
      {
        // yes, cookie was already present 
        console.log('cookie exists', cookie);
      }
      res.render('home', { u: user });
    }
    
  });
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

//-- LOAN ENDPOINTS
router.post('/loan', function(req, res) {
  models.Loan.create({
    Amount: req.query.amount,
    ExpectedEndDate: req.query.expectedEndDate,
    InterestRate: req.query.interestRate,
    AmountRemaining: req.query.amountRemaining,
    Lender: req.query.lender,
    Receiver: req.query.receiver
  }).then(function(loan) {
    res.json(loan);
  });
});


//-- MESSAGE ENDPOITNS
router.post('/message', function(req, res) {
  models.Message.create({
    Text: req.query.text,
    TimeSent: new Date(),
    SenderName: req.query.senderName, //TODO: Update sender using cookies n shit
    ReceiverName: req.query.receiverName 
  }).then(function(loan) {
    res.json(loan);
  });
});

module.exports = router;
