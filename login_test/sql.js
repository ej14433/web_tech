'use strict'
var sql = require('sqlite3');

function storeUserHash(db, user, hash, email, callback) {
  db.serialize(function() {
    var query = "insert into users (username, password, email, active) values ('" + user +  "', '" + hash + "', '"+email+"', 'false')";
    db.run(query, function(err) {
      if (err) throw err;
      if (!err) callback();
    });
  });
  db.close();
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
    var query = "select * from users where username = '" + user + "' and active = 'true'";
    db.all(query, function(err, rows) {
      if (err) throw err;
      callback(err, rows[0]);
    });
  });
  db.close();
}

function findUserById(db, id, callback) {
  db.serialize(function () {
    var query = "select * from users where userId = " + id;
    db.each(query, function(err, rows) {
      if (err) throw err;
      callback(rows);
    });
  });
  db.close();
}

function findUserByEmail(db, email, callback) {
  db.serialize(function () {
    var query = "select * from users where email = '" + email + "'";
    db.all(query, function(err, rows) {
      if(err) throw err;
      callback(rows);
    });
  });
  db.close();
}

function setReset(db, email, token, expiry, callback) {
  db.serialize(function () {
    var query = "update users set token = '" + token + "' , expiry = " + expiry + " where email = '" + email + "'";
    db.run(query, function(err) {
      if(err) throw err;
      callback();
    });
  });
  db.close();
}

function checkToken(db, email, token, callback) {
  db.serialize(function() {
    var query = "select * from users where email = '"+email+"'";
    db.all(query, function(err, users) {
      if(err) throw err;
      if(users.length > 0) {
        var date = new Date();
        var now = ((date.toJSON()).split("T"))[0];
        if(users[0].token = token && users[0].token !== null ) {
          if(now <= users[0].expiry) {
            query = "update users set token = null, expiry = null where email = '"+email+"'";
            db.run(query, function(err) {
              if(err) throw err;
              callback('Success', users[0]);
            });
          } else {
            callback('Expired token');
          }
        } else {
          callback('Token does not match this account');
        }
      }
    });
  });
}

function checkVerfication(db, email, token, callback) {
  db.serialize(function() {
    var query = "select * from users where email = '"+email+"'";
    db.all(query, function(err, users) {
      if(err) throw err;
      console.log(email);
      if(users.length > 0) {
        if(users[0].verification = token) {
          query = "update users set verification = null, active = 'true' where email = '"+email+"'";
          db.run(query, function(err) {
            if(err) throw err;
            callback();
          });
        } else {
          callback('Token does not match this account');
        }
      }
    });
  });
}

function updatePassword(db, hash, email, callback) {
  db.serialize(function(){
    var query = "update users set password = '"+hash+"' where email = '"+ email + "'";
    db.run(query, function(err) {
      if (err) throw err;
      callback();
    });
  });
  db.close();
}

function setVerificationToken(db, email, token, callback) {
  db.serialize(function(){
    var query = "update users set verification = '"+token+"' where email = '"+email+"'";
    db.run(query, function(err) {
      if(err) throw err;
      callback();
    });
  });
}

module.exports = {
  storeUserHash   : storeUserHash,
  findUser        : findUser,
  findUserById    : findUserById,
  findUserByEmail : findUserByEmail,
  getTripsByDate  : getTripsByDate,
  setReset        : setReset,
  checkToken      : checkToken,
  updatePassword  : updatePassword,
  setVerificationToken : setVerificationToken,
  checkVerfication: checkVerfication
}
