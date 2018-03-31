'use strict'
var sql = require('sqlite3');

function storeUserHash(db, user, hash, email, callback) {
  db.serialize(function() {
    var query = "insert into users (username, password, email) values ('" + user +  "', '" + hash + "', '"+email+"')";
    db.run(query, function(err) {
      if (err) throw err;
    });
  });
  db.close();
  callback();
}

function getTripsByDate(db, date, seats, callback) {
  db.serialize(function() {
    var query = "select * from trips where date = " + date + " and seatsAvail >= " + seats;
    db.all(query, function(err, rows) {
      if (err) throw err;
      callback(rows);
      db.close();
    });
  });
}

function findUser(db, user, callback) {
  db.serialize(function() {
    var query = "select * from users where username = '" + user + "'";
    db.all(query, function(err, rows) {
      callback(err, rows[0]);
    });
  });
  db.close();
}

function findUserById(db, id, callback) {
  db.serialize(function () {
    var query = "select * from users where userId = " + id;
    db.each(query, function(err, rows) {
      callback(rows);
    });
  });
}

module.exports = {
  storeUserHash : storeUserHash,
  findUser      : findUser,
  findUserById  : findUserById,
  getTripsByDate: getTripsByDate
}
