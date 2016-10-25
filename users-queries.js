var promise = require('bluebird');
var bcrypt = require('bcrypt-node');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/groupbuydb';
var db = pgp(connectionString);

// Test by going to http://localhost:3000/api/users/
function getAllUsers(req, res, next) {
  db.any('SELECT * FROM users;')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL users'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

// Test by going to http://localhost:3000/api/users/?username=richard
function getSingleUser(req, res, next) {
  var username = req.params.username;
  db.many('SELECT * FROM users WHERE username = ${username};', {username: username})
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE user'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function createUser(req, res, next) {
  var username = req.query.username;
  var password = req.query.password;
  var hashed = bcrypt.hashSync(password);

  db.any('INSERT INTO Users VALUES(DEFAULT, ${username}, ${password});', {username: username, password: hashed})
    .then(function(data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Created ONE user'
        });
    })
    .catch(function (err) {
      console.log("error");
      return next(err);
    });
}

function updateUser(req, res, next) {

}


module.exports = {
  getAllUsers: getAllUsers,
  getSingleUser: getSingleUser,
  createUser: createUser,
  updateUser: updateUser
};
