'use strict'
var sql = require('sqlite3');
var ret = [];

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

function bookTrip(db, tripId, seats, callback) {
  db.serialize(function() {
    var query = 'select * from trips where tripId = ' + tripId + ' and seatsAvail >= ' + seats;
    db.all(query, function (err, rows) {
      if(err) throw err;
      if(rows) {
        query = 'update trips set seatsAvail = seatsAvail-' + seats + ' where tripId = ' + tripId;
        db.run(query, function(err) {
          if (err) throw err;
        });
        query = "insert into bookings (tripId, userId, passengers) values (" + tripId + ", 'ej'," + seats + ")";
        db.run(query, function (err) {
          if (err) throw err;
          callback();
          db.close();
        });
        query = "select * from trips where userId "
      } else {
        callback();
      }
    });
  });
}

module.exports = {
  getTripsByDate  : getTripsByDate,
  bookTrip : bookTrip
}
