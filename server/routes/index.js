var express = require('express');
var router = express.Router();
var models = require('../models/index');
var md5 = require('blueimp-md5');
var coinbase = require('coinbase');
var request = require('request');


// COINBASE CONFIG
var COINBASE_CLIENT_ID = '6325553eb82c9a8a1963abd89814e838aff157918b257ca45bce72b3c0621e7a';
var COINBASE_CLIENT_SECRET = '7c4a7a60e5bb33c534781dbbba8fe7b2f207d85317cfcb43eb96128dbd6eeac9';
var COINBASE_HOST = 'https://www.coinbase.com';
var COINBASE_TOKEN_PATH = '/oauth/token/';
var COINBASE_AUTHORIZE_PATH = '/oauth/authorize/';
var COINBASE_META = { 
    send_limit_amount : 1, 
    send_limit_currency : 'USD', 
    send_limit_period : 'day' 
};

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
      UserUsername: req.session.loggedinuser.Username
    }
  }).then(function(profile) {
    if (profile) {
      profile.updateAttributes({
        First: req.body.first,
        Last: req.body.last,
        PictureURL: req.body.picture,
        Location: req.body.location,
        PhoneNumber: req.body.phone,
        Email: req.body.email,
        Bio: req.body.bio,
        UserUsername: req.session.loggedinuser.Username
      }).then(function(new_profile) {
        res.json(new_profile);
      });
    } else {
      models.Profile.create({
        First: req.body.first,
        Last: req.body.last,
        PictureURL: req.body.picture,
        Location: req.body.location,
        PhoneNumber: req.body.phone,
        Email: req.body.email,
        Bio: req.body.bio,
        UserUsername: req.session.loggedinuser.Username
      }).then(function(new_profile) {
        res.json(new_profile);
      });
    }
  });
});

router.get('/newLoan', function (req, res, next) {
  res.render('newLoan');
});

router.post('/newLoan', function (req, res, next) {
  var lender = req.session.loggedinuser.Username;
  var receiver = req.body.LoanReceiver;
  var amount = req.body.LoanAmount;
  var endDate = req.body.LoanEndDate;
  var interestRate = req.body.LoanInterestRate;
  var finalAmount = amount*(1+interestRate);

  var scope = 'wallet:accounts:read, wallet:transactions:request, wallet:transactions:send, user';
  var redirect_uri = 'http://localhost:5000/requestTokenStep';

  models.Loan.create({
    Amount: amount,
    ExpectedEndDate: endDate,
    InterestRate: interestRate,
    AmountRemaining: amount,
    Lender: lender,
    Receiver: receiver
  }).then(function(loan) {
    models.Profile.findOne({
      where: {
        UserUsername: receiver
      }
    }).then(function(borrower) {
      var args = {
        "to": borrower.Email,
        "amount": finalAmount,
        "currency": "BTC",
        "description": "PalPay"
      };
      req.session.request_args = args;
      var authorization_uri = COINBASE_HOST + COINBASE_AUTHORIZE_PATH;
      authorization_uri += '?scope=' + scope;
      authorization_uri += '&redirect_uri=' + redirect_uri;
      authorization_uri += '&meta[send_limit_amount]=1' + '&meta[send_limit_currency]=USD' + '&meta[send_limit_period]=day';
      authorization_uri += '&client_id=' + COINBASE_CLIENT_ID;
      authorization_uri += '&response_type=code';
      res.redirect(authorization_uri);
    });
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

//-- COINBASE ENDPOINTS
router.get('/requestTokenStep', function(req, res, next) {
  var code = req.query.code;
  if (code) {
    var args = {
      code: code,
      grant_type: 'authorization_code',
      client_id: COINBASE_CLIENT_ID,
      client_secret: COINBASE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:5000/requestTokenStep'
    }
    request({
      url: COINBASE_HOST + COINBASE_TOKEN_PATH,
      qs: args,
      method: 'POST'
    }, function(err, resp, body) {
      var accessToken = JSON.parse(body).access_token;
      var refreshToken = JSON.parse(body).refresh_token;
      var Client = coinbase.Client;
      var client = new Client({'accessToken': accessToken, 'refreshToken': refreshToken});
      client.getAccounts({}, function(err, accounts) {
        accounts.forEach(function(acct) {
          if (acct.primary && acct.currency == 'BTC') {
            acct.requestMoney(req.session.request_args, function(err, txn) {
              console.log('my txn id is: ' + txn.id);
            });
          }
        });
      });
      res.send('Trolol');
    });
  }
});

router.get('/requestComplete', function(req, res, next) {
  res.json(req);
});

router.get('/newRequest', function(req, res, next) {
  res.render('newRequest');
});


module.exports = router;
