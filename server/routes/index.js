var express = require('express');
var router = express.Router();
var models = require('../models/index');
var md5 = require('blueimp-md5');

//Redirect to index or home, depending on loggedinuser
function checkLogin(req) {
  return req.session.loggedinuser;
}

router.get('/', function(req, res, next) {
  if (checkLogin(req)) {
    res.render('home', { user: JSON.stringify(req.session.loggedinuser) });
  } else {
    res.render('index');
  }
});

router.get('/profilesetup', function (req, res, next) {
  if (checkLogin(req)) {
    res.render('profilesetup');
  } else {
    res.redirect('/');
  }
});

router.post('/profileupdate', function(req, res, next) {
  models.Profile.find({
    where: {
      UserUsername: req.session.loggedinuser.username
    }
  }).then(function(profile) {
    if(profile){
      profile.updateAttributes({
        First: req.body.first,
        Last: req.body.last,
        PictureURL: req.body.picture,
        Location: req.body.location,
        PhoneNumber: req.body.phone,
        Email: req.body.email,
        Bio: req.body.bio
      }).then(function(new_profile) {
        res.json(new_profile);
      });
    } else {
      res.send("Profile not found");
    }
  });
});

router.get('/newLoan', function (req, res, next) {
  res.render('newLoan');
});

router.post('/newLoan', function (req, res, next) {
  var lender = req.body.LoanLender;
  var receiver = req.body.LoanReceiver;
  var amount = req.body.LoanAmount;
  var endDate = req.body.LoanEndDate;
  var interestRate = req.body.LoanInterestRate;

  models.Loan.create({
    Amount: amount,
    ExpectedEndDate: endDate,
    InterestRate: interestRate,
    AmountRemaining: amount,
    Lender: lender,
    Receiver: receiver
  }).then(function(loan) {
    res.json(loan);
  });
});

router.post('/login', function(req, res, next) {
  var username = req.body.Username;
  var hashedPW = md5(req.body.Password);
  models.Users.findOne({where: {Username: username, Password: hashedPW}}).then(function(user) {
    if (user === null) {
      res.render('index', { error: 'User/Password not found.' });
    } else {
      req.session.loggedinuser = user.dataValues; //this is what logs users in
      res.render('home', { user: JSON.stringify(req.session.loggedinuser) });
    }
  });
});

router.all('/logout', function(req, res, next) {
  req.session = null;
  res.render('index', { error: 'Logged out.' });
});

router.post('/register', function(req, res, next) {
  var username = req.body.UsernameRegistration;
  var hashedPW = md5(req.body.PasswordRegistration);
  var hashedPWConfirm = md5(req.body.ConfirmPasswordRegistration);
  if (hashedPW == hashedPWConfirm) {
    models.Users.findOne({where: {Username: username, Password: hashedPW}}).then(function(user) {
      if (user === null) {
        models.Users.create({Username: username, Password: hashedPW}).then(function(user) {
          req.session.loggedinuser = user.dataValues; //this is what logs users in
          res.render('profilesetup');
        });
      } else {
        res.render('index', { error: 'User already exists. Did you forgot your password?' });
      }
    });
  } else {
    res.render('index', { error: 'Passwords didn\'t match.' });
  }
});

//-- USER ENDPOINTS
router.post('/users', function(req, res) {
  var hashedPW = md5(req.query.Password);
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

//-- VENMODATA ENDPOINTS
router.post('/venmodata', function(req, res) {
  models.VenmoData.create({
    AccessToken: req.query.AccessToken,
    PhoneNumber: req.query.PhoneNumber,
    UserID: req.query.UserID,
    Email: req.query.Email
  }).then(function(vdata) {
    res.json(vdata);
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
