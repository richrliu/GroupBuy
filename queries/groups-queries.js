var promise = require('bluebird');
var bcrypt = require('bcrypt-node');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/groupbuydb';
var db = pgp(connectionString);

function getAllGroups(req, res, next) {
  db.any('SELECT * FROM Groups;')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL Groups'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function createNewGroup(req, res, next) {
  var name = req.query.groupName;
  var desc = req.query.groupDesc;
  var adminID = req.query.adminID;

  db.any('INSERT INTO Groups VALUES(DEFAULT, ${groupname}, ${groupdesc}, ${adminID});', {groupname: name, groupdesc: desc, adminID: adminID})
    .then(function(data) {
      db.any('INSERT INTO Membership VALUES(${userID}, (SELECT ID from Groups WHERE name = ${groupname}));', {userID: adminID, groupname: name})
        .then(function(idData) {
        	res.status(200)
		        .json({
		          status: 'success',
		          data: idData,
		          message: 'Created ONE Group'
		        });
        })
        .catch(function(error) {
        	return next(error)
        })
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getAllGroups: getAllGroups,
  createNewGroup: createNewGroup
};