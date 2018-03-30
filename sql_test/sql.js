'use strict'
var sql = require('sqlite3');

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

function bookTrip(db, tripId, seats, userId, callback) {
  db.serialize(function() {
    var query = 'select * from trips where tripId = ' + tripId + ' and seatsAvail >= ' + seats;
    db.all(query, function (err, rows) {
      if(err) throw err;
      if(rows) {
        updateTripAvailability(db, tripId, seats);
        findOrCreateUser(db, userId);
        makeBooking(db, tripId, userId, seats);
      }
      callback();
      db.close();
    });
  });
}

function findOrCreateUser(db, userId) {
  var query = 'select * from users where userId = ' + userId;
  db.all(query, function (err, rows) {
    if(err) throw err;
    if(rows.length == 0) {
      query = "insert into users (userId, firstname, surname, email) values (" + userId + ", 'Elis', 'Jones', 'ej14433')";
      db.run(query, function(err) {
        if (err) throw err;
      });
    }
  });
}

function makeBooking(db, tripId, userId, seats) {
  var query = "insert into bookings (tripId, userId, passengers) values (" + tripId + ", " + userId + ", " + seats + ")";
  db.run(query, function (err) {
    if (err) throw err;
  });
}

function updateTripAvailability(db, tripId, seats) {
  var query = 'update trips set seatsAvail = seatsAvail-' + seats + ' where tripId = ' + tripId;
  db.run(query, function(err) {
    if (err) throw err;
  });
}

module.exports = {
  getTripsByDate  : getTripsByDate,
  bookTrip : bookTrip
}
