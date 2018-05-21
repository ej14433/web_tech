'use strict'
var sql = require('sqlite3');

function storeUserHash(db, user, hash, email, callback) {
  db.serialize(function() {
    var query = "insert into users (username, password, email, active) values ('" + user +  "', '" + hash + "', '"+email+"', 'false')";
    db.run(query, function(err) {
      if (err) callback(err);
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
          console.log(now, users[0].expiry);
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

function makeBooking(db, userId, tripId, seats, callback) {
  db.serialize(function() {
    var query = "insert into bookings (userId, tripId, seats) values ( '" + userId+"', '"+tripId+"', '" +seats+"')"
    db.run(query, function(err) {
      if(err) throw err;
      var query = "update trips set seatsAvail = seatsAvail-"+seats+" where tripId = '"+tripId+"'";
      db.run(query, function(err) {
        if(err) throw err;
        callback();
        db.close();
      });
    });
  });
}

function getBookingsByUserId(db, userId, callback) {
  var allInfo = [];
  db.serialize(function() {
    var query = "select * from bookings where userId = "+userId;
    db.all(query, function(err, bookings) {
      if (err) throw err;
      var i = 0;
      bookings.forEach(function(booking){
        var bookingId = booking.bookingId;
        var seats = booking.seats;
        query = "select * from trips where tripId = "+booking.tripId;
        db.all(query, function(err, trips) {
          if(err) throw err;
          var boatId = trips[0].boatId;
          var date = trips[0].date;
          var time = trips[0].time;
          var template =
          `{ "bookingId" : "${bookingId}", "boatId" : "${boatId}", "date" : "${date}", "time" : "${time}", "seats" : "${seats}" }`;
          allInfo.push(template);
          if(allInfo.length == bookings.length) {
            callback(null, allInfo);
          }
        });
      });
      db.close();
    });
  });
}
function getAccountDetails(db, user, callback) {
  db.serialize(function() {
    var query = `select * from users where userId = ${user}`;
    db.all(query, function(err, account) {
      if(err) throw err;
      var template = `{ "username" : "${account[0].username}", "email" : "${account[0].email}"}`
      callback(0, template);
      db.close();
    });
  });
}

function addReview(db, email, name, review, callback) {
  db.serialize(function() {
    var query = `insert into reviews (email, name, review) values ('${email}', '${name}', '${review}')`;
    db.run(query, function(err) {
      if(err) throw err;
    });
  });
}

function getLatestReviews(db, callback) {
  var allReviews = [];
  db.serialize(function() {
    var query = "select * from reviews order by reviewId desc limit 3";
    db.all(query, function(err, reviews) {
      if (err) throw err;
      callback(0, reviews);
      db.close();
    });
  });
}

function updateAccountDetails(db, username, email, user, callback) {
  console.log(username);
  db.serialize(function() {
    var query = "update users set username = '"+username+"', email = '"+email+"' where userId = '"+user+"'";
    db.run(query, function(err) {
      if (err) throw err;
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
  checkVerfication: checkVerfication,
  makeBooking     : makeBooking,
  getBookingsByUserId : getBookingsByUserId,
  getAccountDetails : getAccountDetails,
  addReview : addReview,
  getLatestReviews : getLatestReviews,
  updateAccountDetails : updateAccountDetails
}
