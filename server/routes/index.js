var express = require('express');
var router = express.Router();
var models = require('../models/index');
var md5 = require('blueimp-md5');
var coinbase = require('coinbase');
var passport = require('passport');
var CoinbaseStrategy = require('passport-coinbase').Strategy;


// COINBASE PASSPORT
var COINBASE_CLIENT_ID = '6325553eb82c9a8a1963abd89814e838aff157918b257ca45bce72b3c0621e7a';
var COINBASE_CLIENT_SECRET = '7c4a7a60e5bb33c534781dbbba8fe7b2f207d85317cfcb43eb96128dbd6eeac9';
var COINBASE_META = {
    send_limit_amount : 1,
    send_limit_currency : 'USD',
    send_limit_period : 'day'
};
passport.use(new CoinbaseStrategy({
  clientID: COINBASE_CLIENT_ID,
  clientSecret: COINBASE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/coinbase/callback",
  scope: ['wallet:accounts:read', 'wallet:transactions:request', 'wallet:transactions:send', 'user']
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    return done(null, profile);
  });
}));
passport._strategies.coinbase.authorizationParams = function(options) {
    var meta = {};
    for(o in COINBASE_META){
        meta['meta['+o+']'] = COINBASE_META[o];
    };
    return meta;
};
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

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
        console.log(new_profile);
        res.redirect('/');
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
        console.log(new_profile);
        res.redirect('/');
      });
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

// Search for users, etc.
router.get('/search/:term', function(req, res) {
  models.Users.findAll({
    include: [{
        model: models.Profile,
        where: {$or: [
          { First: { ilike: '%'+req.params.term+'%' } },
          { Last: { ilike: '%'+req.params.term+'%' } }
        ]}
    }]
  }).then(function(users) {
    res.json(users);
  });
});

//-- PROFILE ENDPOINTS
router.get('/profile', function(req, res) {
  var user = req.session.loggedinuser.Username;
  showProfile(user, req, res);
});

router.get('/profile/:username', function(req, res) {
  var user = req.params.username;
  showProfile(user, req, res);
});

function showProfile(user, req, res) {
  models.Profile.find({
    where: {
      UserUsername: user
    }
  }).then(function(profile) {
    if(profile){
      res.json(profile);
    } else {
      res.send("Profile not found.");
    }
  });
}


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

//-- BITCOIN TESTING
// router.get('/bitcoin-test', function(req, res, next) {
  // var Client = require('coinbase').Client;
  // var client = new Client({'apiKey': 'PiYmM2Lf1U6BVXyV', 'apiSecret': 'jGk1HVFlxue1CLbIYhXLsu1kNFQcHaf4'});
  // client.getAccounts({}, function(err, accounts) {
  //   accounts.forEach(function(acct) {
  //     if (acct.primary && acct.currency == 'BTC') {
  //       var args = {
  //         "to": "lolatme4@gmail.com",
  //         "amount": "1",
  //         "currency": "USD",
  //         "description": "Sample transaction for you"
  //       };
  //       acct.requestMoney(args, function(err, txn) {
  //         res.render('my txn id is: ' + txn.id);
  //       });
  //     }
  //   });
  // });
// });

router.get('/auth/coinbase',
           passport.authenticate('coinbase'),
           function(req, res) {
            // The request will be redirected to Coinbase for authentication, so this
            // function will not be called.
           });

router.get('/auth/coinbase/callback',
           passport.authenticate('coinbase', { failureRedirect: '/register' }),
           function(req, res) {
            res.redirect('/');
           });

//-- COINBASE ENDPOINTS
router.post('/auth/coinbase/request/', function(req, res, next) {
  var borrowerEmail = req.body.borrowerEmail;
  var amount = req.body.amount;
  var interest = req.body.interest;
  var finalAmount= amount*(1+interest);
  var args = {
    "to": borrowerEmail,
    "amount": finalAmount,
    "currency": "BTC",
    "description": "/auth/coinbase/request"
  };
  passport.use(new CoinbaseStrategy({
    clientID: COINBASE_CLIENT_ID,
    clientSecret: COINBASE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/requestComplete",
    scope: ['wallet:transactions:request', 'user']
  }, function(accessToken, refreshToken, profile, done) {
    var Client = require('coinbase').Client;
    var client = new Client({'accessToken': accessToken, 'refreshToken': refreshToken});
    client.getAccounts({}, function(err, accounts) {
      accounts.forEach(function(acct) {
        if (acct.primary && acct.currency == 'BTC') {
          acct.requestMoney(args, function(err, txn) {
            console.log('my txn id is: ' + txn.id);
          });
        }
      });
    });
    process.nextTick(function() {
      return done(null, profile);
    });
  }));
  res.redirect('/auth/coinbase');
});

router.get('/requestComplete', function(req, res, next) {
  res.redirect('/');
});

router.get('/newRequest', function(req, res, next) {
  res.render('newRequest');
});


module.exports = router;
