const express = require('express');
const app     = express();
const sql     = require('sqlite3');
const sqljs   = require('./sql.js');
const path    = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
});

app.get('/trips?*', function(req, res) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  var regexDate = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  var regexSeat = /[0-9]{1,2}/;

  if (req.query.date.match(regexDate) && req.query.seats.match(regexSeat)) {
    sqljs.getTripsByDate(db, "date('"+ req.query.date +"')", req.query.seats, function (rows) {
      res.send(rows)
    });
  }
});

app.get('/book?*', function(req, res) {
  const db      = new sql.Database('./data.db', function (err) { if(err) throw err; });
  var regex = /[0-9]{1,2}/;

  if (req.query.tripId.match(regex)) {
    sqljs.bookTrip(db, req.query.tripId, req.query.seats, function (booking) {
      res.send(booking);
    });
  }
});

app.listen('8080', function() {
  console.log('Server started on port 8080');
});
