'use strict'
var sql = require('sqlite3');
var ret = [];

function getTripsByDate(db, date, seats, callback) {
  db.serialize(function() {
    var query = "select * from trips where date = " + date + " and seatsAvail >= " + seats;
    db.all(query, function(err, rows) {
      if (err) throw err;
      callback(rows);
    });
  });
  db.close();
}

function bookTrip(db, tripId, seats, callback) {
  db.serialize(function() {
    var query = 'update trips set seatsAvail = seatsAvail-' + seats + ' where tripId = ' + tripId;
    db.all(query, function(err) {
      if (err) throw err;
    });
  });
  db.close();
}

module.exports = {
  getTripsByDate  : getTripsByDate,
  bookTrip : bookTrip
}
