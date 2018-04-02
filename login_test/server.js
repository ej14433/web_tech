const express         = require('express');
const app             = express();
const sql             = require('sqlite3');
const sqljs           = require('./sql.js');
const path            = require('path');
const bcrypt          = require('bcrypt');
const nodemailer      = require('nodemailer');
const saltRounds      = 10;
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var session  = require("express-session"), bodyParser = require("body-parser");

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seamorwildlifetours@gmail.com',
    pass: 'C@ms32500'
  }
});

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

app.post('/login', function (req, res) {
  passport.authenticate('local', function(err, user, info) {
    if(err) throw err;
    if(!user) return res.send('Incorrect credentials');
    if(user) return res.send('Success');
  }) (req, res);
});

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

app.post('/book/try', function(req, res) {
  if(req.session.passport) {
    if(req.session.passport.user) {
      res.redirect('/book/confirm');
  }
  } else {
    res.redirect('/');
  }
});

app.post('/register', function(req, res) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    if(err) res.send(err);
    sqljs.storeUserHash(db, req.body.username, hash, req.body.email, function(err) {
      if(err) res.send(err);
      if(!err) res.send('success');
    });
  });
});

app.listen('8080', function() {
  console.log('Server started on port 8080');
});

app.post('/reset', function (req, res) {
  var mailOptions = {
    from: 'SeaMor <seamorwildlifetours@gmail.com>',
    to: req.body.email,
    subject: 'Reset your SeaMor Account Password',
    text: 'Reset your password'
  };
  transporter.sendMail(mailOptions, function(err, info){
    if (err) return res.send(error);
    if (!err) return res.send('Email sent');
  })
});
