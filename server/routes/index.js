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
    models.Loan.findAll({
      limit: 10,
      order: [['ExpectedEndDate', 'ASC']],
      where: {
        Lender: req.session.loggedinuser.Username,
        $or: [{CompletionStatus: "in_progress"}, {CompletionStatus: "in_progress_late"}]}
    }).then(function(loans) {
      models.Loan.findAll({
        limit: 10,
        order: [['ExpectedEndDate', 'ASC']],
        where: {
          Receiver: req.session.loggedinuser.Username,
          $or: [{CompletionStatus: "in_progress"}, {CompletionStatus: "in_progress_late"}]}
      }).then(function(debts) {
          models.Loan.findAll({
            limit: 10,
            order: [['ExpectedEndDate', 'ASC']],
            where: {
              Lender: req.session.loggedinuser.Username,
              CompletionStatus: "pending_approval"
            }
          }).then(function(pending) {
            res.render('home', { user: req.session.loggedinuser, loans: loans, debts: debts, pending: pending });
          });
      });
    });
  } else {
    res.render('index');
  }
});

router.post('/login', function(req, res, next) {
  var username = req.body.Username;
  var hashedPW = md5(req.body.Password);
  models.Users.findOne({where: {Username: username, Password: hashedPW}}).then(function(user) {
    if (user === null) {
      res.render('index', { error: 'User/Password not found.' });
    } else {
      req.session.loggedinuser = user.dataValues; //this is what logs users in

      models.Loan.findAll({
        limit: 10,
        order: [['ExpectedEndDate', 'ASC']],
        where: {
          Lender: req.session.loggedinuser.Username,
          $or: [{CompletionStatus: "in_progress"}, {CompletionStatus: "in_progress_late"}]}
      }).then(function(loans) {
        models.Loan.findAll({
          limit: 10,
          order: [['ExpectedEndDate', 'ASC']],
          where: {
            Receiver: req.session.loggedinuser.Username,
            $or: [{CompletionStatus: "in_progress"}, {CompletionStatus: "in_progress_late"}]}
        }).then(function(debts) {
            models.Loan.findAll({
              limit: 10,
              order: [['ExpectedEndDate', 'ASC']],
              where: {
                Lender: req.session.loggedinuser.Username,
                CompletionStatus: "pending_approval"
              }
            }).then(function(pending) {
              res.render('home', { user: req.session.loggedinuser, loans: loans, debts: debts, pending: pending });
            });
        });
      });
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

router.get('/profilesetup', function (req, res, next) {
  if (checkLogin(req)) {
    models.Profile.find({
      where: {
        UserUsername: req.session.loggedinuser.Username
      }
    }).then(function(profile) {
      if (profile) {
        res.render('profilesetup', {profile: profile});
      } else {
        res.render('profilesetup');
      }
    });
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
        res.redirect('/profile');
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
        res.redirect('/profile');
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
    FinalAmount: finalAmount,
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
      req.session.prevLoanId = loan.id;
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

router.get('/search', function(req, res) {
  res.render('searchform');
});

router.post('/searchform', function(req, res) {
  res.redirect('/search/'+req.body.search);
})

// Search for users, etc.
router.get('/search/:term', function(req, res) {
  models.Users.findAll({
    include: [{
        model: models.Profile,
        where: {$or: [
          { First: { ilike: '%'+req.params.term+'%' } },
          { Last: { ilike: '%'+req.params.term+'%' } },
          { UserUsername: { ilike: '%'+req.params.term+'%' } }
        ]}
    }]
  }).then(function(user_list) {
      if (user_list.length > 0) {
          res.render('search', {users: user_list, isPop: true});
      } else {
          res.render('search', {users: user_list, isPop: false});
      }
  });
});

//-- PROFILE ENDPOINTS
router.get('/profile', function(req, res) {
  var user = req.session.loggedinuser.Username;
  showProfile(user, req, res, true);
});

router.get('/profile/:username', function(req, res) {
  var user = req.params.username;
  var user2 = req.session.loggedinuser.Username;

  if (user == user2) {
      showProfile(user, req, res, true);
  } else {
      showProfile(user, req, res, false);
  }
});

function showProfile(user, req, res, isSelf) {
  models.Profile.find({
    where: {
      UserUsername: user
    }
  }).then(function(profile) {
    if(profile){
        if (!checkURL(profile.PictureURL)) {
            profile.PictureURL = "/images/default-user.png";
        }
        res.render('profile', {profile: profile, isSelf: isSelf });
    } else {
      res.render('profilesetup');
    }
  });
}

function checkURL(url) {
    var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (res) {
        return true;
    } else {
        return false;
    }
}

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

router.get('/viewloan/:id', function(req, res) {
  models.Loan.findOne({
    where: {
      id: req.params.id
    }
  }).then(function(loan) {
      var userIsLender = loan.Lender == req.session.loggedinuser.Username && loan.CompletionStatus == 'pending_approval';
      var userIsReceiver = loan.Receiver ==
        req.session.loggedinuser.Username && loan.CompletionStatus != 'completed' && loan.CompletionStatus != 'completed_late';
      if (loan) {
        models.Fulfillment.findAll({
          where: {
            LoanID: loan.id
          }
        }).then(function(fulfillments) {
          if (fulfillments) {
            res.render('viewloan', {
              loan: loan,
              loanStatus: toTitleCase((loan.CompletionStatus).replace(/_/g, ' ')),
              userIsLender: userIsLender,
              userIsReceiver: userIsReceiver,
              fulfillments: fulfillments
            });
          }  else {
            res.render('viewloan', {
              loan: loan,
              loanStatus: toTitleCase((loan.CompletionStatus).replace(/_/g, ' ')),
              userIsLender: userIsLender,
              userIsReceiver: userIsReceiver,
            });
          }
        });
      } else {
        res.send('Loan not found.');
      }

  });
});

router.get('/acceptLoan/:loanid', function(req, res, next) {
  models.Loan.find({
    where: {
      id: req.params.loanid
    }
  }).then(function(loan) {
    if (loan) {
      var currDate = new Date();
      var newStatus = currDate < loan.ExpectedEndDate ? 'in_progress' : 'in_progress_late';
      loan.updateAttributes({
        CompletionStatus: newStatus
      }).then(function(new_loan){
        res.redirect('/viewloan/'+req.params.loanid);
      });
    } else {
      res.send('Loan not found :/');
    }
  });
});

router.get('/denyLoan/:loanid', function(req, res, next) {
  models.Loan.find({
    where: {
      id: req.params.loanid
    }
  }).then(function(loan) {
    if (loan) {
      loan.updateAttributes({
        CompletionStatus: 'denied'
      }).then(function(new_loan){
        res.redirect('/viewloan/'+req.params.loanid);
      });
    } else {
      res.send('Loan not found :/');
    }
  });
});

router.get('/payLoan', function(req, res, next) {
  res.render('payLoan');
});

router.get('/payLoan/:loanid', function(req, res, next) {
  models.Loan.find({
    where: {
      id: req.params.loanid
    }
  }).then(function(loan) {
    if (loan) {
      var lender = loan.Lender;
      var borrower = loan.Receiver;
      var amountRemaining = loan.AmountRemaining;
      res.render('payLoan', {lender:lender, borrower:borrower, amountRemaining:amountRemaining, id:req.params.loanid});
    } else {
      res.send('Loan not found :/');
    }
  });
});

//-- MESSAGE ENDPOITNS

router.get('/newMessage', function (req, res, next) {
  res.render('newMessage');
});

router.post('/newMessage', function(req, res) {
  var sender = req.session.loggedinuser.Username;
  var receiver = req.body.MessageReceiver;
  var message = req.body.Message;

  if (receiver == '' || sender == '') {
    res.render("newMessage", { error: 'Please fill in message receiver.'})
  } else {
      models.Users.findOne({
    where: {
      Username: receiver
    }
  }).then(function(user) {
    if (user === null || receiver == sender) {
      res.render("newMessage", { error: 'Please check that you put the correct username.'})
    } else {
      models.Conversation.findOne(
    {where:
      {
      $or: [
        {$and: {User1: sender, User2: receiver}},
        {$and: {User1: receiver, User2: sender}}
      ]}}
    ).then(function(conversation) {
      if (conversation === null) {

        models.Conversation.create({
          User1: sender,
          User2: receiver
        }).then(function(newConversation) {

          models.Message.create({
            Text: message,
            TimeSent: new Date(),
            SenderName: sender, //TODO: Update sender using cookies n shit
            ReceiverName: receiver,
            ConversationId: newConversation.id
          }).then(function(newMessage) {
            res.redirect('http://localhost:5000/conversations/'+receiver);
        });
        });
      } else {
        //res.render('newMessage', { error: 'You\'re already in a conversation with this person.' });

        models.Message.create({
          Text: message,
          TimeSent: new Date(),
          SenderName: sender, //TODO: Update sender using cookies n shit
          ReceiverName: receiver,
          ConversationId: conversation.id
        }).then(function(newMessage) {
          res.redirect('http://localhost:5000/conversations/'+receiver);
        });
      }
    });
    }
  });
}
});

router.get('/newMessage/:username', function(req, res) {
  var receiver = req.params.username;
  var sender = req.session.loggedinuser.Username;
  if (receiver == '' || sender == '')
    res.render("newMessage", { error: 'Please fill in reciever.'})
  models.Conversation.findOne(
    {where:
      {
      $or: [
        {$and: {User1: sender, User2: receiver}},
        {$and: {User1: receiver, User2: sender}}
      ]}}
    ).then(function(conversation) {
      if (conversation === null) {
        res.render('newMessage', {receiver: receiver});
      } else {
        res.redirect('http://localhost:5000/conversations/'+receiver);
      }
    });
});

router.post('/message', function (req, res) {
  var sender = req.session.loggedinuser.Username;
  var receiver = req.body.receiver;
  var message = req.body.message;

  models.Conversation.findOne(
    {where:
      {
      $or: [
        {$and: {User1: sender, User2: receiver}},
        {$and: {User1: receiver, User2: sender}}
      ]}}
    ).then(function(conversation) {
        models.Message.create({
          Text: message,
          TimeSent: new Date(),
          SenderName: sender,
          ReceiverName: receiver,
          ConversationId: conversation.id
    }).then(function(message) {
      res.redirect('http://localhost:5000/conversations/'+receiver);
    });
  });
});

router.get('/conversations', function (req, res, next) {
  models.Conversation.findAll(
  {
    attributes: [['User1','User']],
    where:
    {
      User2: req.session.loggedinuser.Username
    }
  }).then(function(conversations) {
      models.Conversation.findAll(
    {
      attributes: [['User2','User']],
      where:
      {
        User1: req.session.loggedinuser.Username
      }
    }).then(function(conversations2) {
        user_list = conversations.concat(conversations2);
        if (user_list.length > 0) {
            res.render('conversations', {
              users: user_list, isPop: true
            });
        } else {
            res.render('conversations', {
              users: user_list, isPop: false
            });
        }

    });
  });
});

router.get('/conversations/:username', function (req, res) {
  var user = req.session.loggedinuser.Username;
  var friend = req.params.username;
  models.Message.findAll(
  {
    order: '"createdAt" ASC',
    where:
    {
      $or: [
        {$and: {SenderName: user, ReceiverName: friend}},
        {$and: {SenderName: friend, ReceiverName: user}}
      ]
    }
  }).then(function(conversation) {
    console.log(conversation);
    res.render('convo', {
      user: friend,
      conversation: conversation
    });
  })
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
              if (err) console.log(err);
              if (txn) {
                console.log("transaction: " + txn.id);
                if (req.session.prevLoanId) {
                  models.Loan.find({
                    where: {
                      id: req.session.prevLoanId
                    }
                  }).then(function(loan) {
                    loan.updateAttributes({
                      Loan_CoinbaseTxnId: txn.id
                    });
                    req.session.prevLoanId = null;
                  })
                }
              }
            });
          }
        });
      });
      res.send('No code recieved from coinbase sorry lol'); // TODO FIX
    });
  }
});

router.get('/fulfillTokenStep', function(req, res, next) {
  var code = req.query.code;
  if (code) {
    var args = {
      code: code,
      grant_type: 'authorization_code',
      client_id: COINBASE_CLIENT_ID,
      client_secret: COINBASE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:5000/fulfillTokenStep'
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
            acct.sendMoney(req.session.request_args, function(err, txn) {
              if (err) console.log(err);
              if (txn) {
                console.log("transaction: " + txn.id);
                if (req.session.prevFulfillmentID) {
                  models.Fulfillment.find({
                    where: {
                      id: req.session.prevFulFillmentID
                    }
                  }).then(function(fulfillment) {
                    fulfillment.updateAttributes({
                      CoinbaseTxnId: txn.id
                    });
                    req.session.prevFulFillmentID = null;
                  })
                }
              }
            });
          }
        });
      });
      res.redirect('No code recieved from coinbase sorry lol'); // TODO FIX
    });
  }
});

router.get('/rankingTokenStep', function(req, res, next) {
  var code = req.query.code;
  if (code) {
    var args = {
      code: code,
      grant_type: 'authorization_code',
      client_id: COINBASE_CLIENT_ID,
      client_secret: COINBASE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:5000/rankingTokenStep'
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
            acct.getTransactions({}, function(err, txns) {
              console.log(txns);
            });
          }
        });
      });
      res.send('Trolol'); // TODO FIX
    });
  }
});

router.get('/calculateRanking', function(req, res, next) {
  var redirect_uri = 'http://localhost:5000/rankingTokenStep';
  var scope = 'wallet:accounts:read';
  var authorization_uri = COINBASE_HOST + COINBASE_AUTHORIZE_PATH;
  authorization_uri += '?scope=' + scope;
  authorization_uri += '&redirect_uri=' + redirect_uri;
  authorization_uri += '&client_id=' + COINBASE_CLIENT_ID;
  authorization_uri += '&response_type=code';
  res.redirect(authorization_uri);
});

router.get('/newRequest', function(req, res, next) {
  res.render('newRequest');
});

router.get('/newRequest/:username', function(req, res, next) {
  res.render('newRequest', {username: req.params.username});
});

router.post('/newRequest', function(req, res, next) {
  var lender = req.body.lenderUsername;
  var receiver = req.session.loggedinuser.Username;
  var amount = req.body.amount;
  var endDate = req.body.LoanEndDate;
  var interestRate = req.body.interest;
  var finalAmount = amount*(1+interestRate);

  var scope = 'wallet:accounts:read, wallet:transactions:request, wallet:transactions:send, user';
  var redirect_uri = 'http://localhost:5000/requestTokenStep';

  models.Loan.create({
    Amount: amount,
    FinalAmount: finalAmount,
    ExpectedEndDate: endDate,
    InterestRate: interestRate,
    AmountRemaining: finalAmount,
    Lender: lender,
    Receiver: receiver
  }).then(function(loan) {
    models.Profile.findOne({
      where: {
        UserUsername: lender
      }
    }).then(function(lender) {
      req.session.prevLoanId = loan.id;
      var args = {
        "to": lender.Email,
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

router.post('/newFulfillment', function(req, res, next) {
  var lender = req.body.lenderUsername;
  var receiver = req.session.loggedinuser.Username;
  var amount = req.body.amount;
  var loanid = req.body.loanID;

  var scope = 'wallet:accounts:read, wallet:transactions:send, user';
  var redirect_uri = 'http://localhost:5000/fulfillTokenStep';

  models.Fulfillment.create({
    Amount: amount,
    Lender: lender,
    Borrower: receiver,
    LoanID: loanid
  }).then(function(fulfillment) {
    models.Loan.findOne({
      where: {
        id: loanid
      }
    }).then(function(loan) {
      var newRemaining = loan.AmountRemaining - amount;
      var isLate = new Date() < loan.endDate;
      var newCompletionStatus = newRemaining <= 0 ? (isLate ? 'completed_late' : 'completed') : (isLate ? 'in_progress_late' : 'in_progress');
      loan.updateAttributes({
        AmountRemaining: newRemaining,
        CompletionStatus: newCompletionStatus
      }).then(function(new_loan){
        models.Profile.findOne({
          where: {
            UserUsername: new_loan.Lender
          }
        }).then(function(lenderProfile){
          req.session.prevFulfillmentID = fulfillment.id;
          var args = {
            "to": lenderProfile.Email,
            "amount": amount,
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
  });
});

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

module.exports = router;
