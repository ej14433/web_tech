const express         = require('express');
const app             = express();
const sql             = require('sqlite3');
const sqljs           = require('./sql.js');
const path            = require('path');
const session         = require('express-session');
const passport        = require('passport');
const GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;

app.use(session({
  secret: 'verygoodsecret' ,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: "319208830711-6i7o313qovpnr3hjun10jffle1hp0gah.apps.googleusercontent.com",
    clientSecret: "11cvHyj5Gr-82pZen6yrg8oJ",
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      var user = {
        id: profile.id,
        name: profile.givenName + " " + profile.familyName
      }
      return done(null, user);
  }
));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
});

app.get('/search/', function(req, res) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  var regexDate = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  var regexSeat = /[0-9]{1,2}/;
  if (req.query.date.match(regexDate) && req.query.seats.match(regexSeat)) {
    sqljs.getTripsByDate(db, "date('"+ req.query.date +"')", req.query.seats, function (rows) {
      res.send(rows)
    });
  }
});

app.get('/book/', function(req, res) {
  if(req.user) {
    const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
    var regex = /[0-9]{1,2}/;
    if (req.query.tripId.match(regex)) {
      sqljs.bookTrip(db, req.query.tripId, req.query.seats, req.user.id, function () {
        res.send('Booked!');
      });
    }
  } else {
    res.send('You need to Sign In')
  }
});

app.listen('8080', function() {
  console.log('Server started on port 8080');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);
