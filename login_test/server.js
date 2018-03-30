const express         = require('express');
const app             = express();
const sql             = require('sqlite3');
const sqljs           = require('./sql.js');
const path            = require('path');
const bcrypt          = require('bcrypt');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var session  = require("express-session"), bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'verygoodsecret' ,
  resave: false,
  saveUninitialized: false
}));

passport.use(new LocalStrategy(
  function(username, password, done) {
    const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
    sqljs.findUser(db, username, function (err, user) {
      if (err) throw err;
      if (!user) return done(null, false);
      bcrypt.compare(password, user.password, function(err, res) {
        if(err)  throw err;
        if(!res) return done(null, false);
        if(res)  return done(null, user);
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.userId);
});

passport.deserializeUser(function(id, done) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  sqljs.findUserById(db, id, function (user) {
    done(null, user);
  });
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/right',
                                   failureRedirect: '/wrong'})
);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
});

app.get('/right', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/right.html'))
});

app.get('/wrong', function(req, res) {
  res.redirect('/');
});

app.post('/book', function(req, res) {
  if(req.session.passport.user) {
    console.log('book');
  } else {
    console.log('log in');
  }
  res.redirect('/right')
});

app.listen('8080', function() {
  console.log('Server started on port 8080');
});
