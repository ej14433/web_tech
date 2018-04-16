const express         = require('express');
const app             = express();
const sql             = require('sqlite3');
const sqljs           = require('./sql.js');
const path            = require('path');
const bcrypt          = require('bcrypt');
const crypto          = require('crypto');
const nodemailer      = require('nodemailer');
const qr              = require("qr-image");
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
var png_string = qr.imageSync('SEAMOR130820', { type: 'png' });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'verygoodsecret',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 60*60*1000 },
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
    if(user) {
      req.login(user, function (err) {
        if(err) throw err;
      });
      return res.send('Success');
    }
  }) (req, res);
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/',
  function (req, res) {

  }
}));

app.get('/', function(req, res) {
  res.sendFile(__dirname + './public/index.html')
});

app.get('/issignedin', function(req,res) {
  if(req.session.passport) {
    res.send('yes');
  } else {
    res.send('no');
  }
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
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  sqljs.findUserByEmail(db, req.body.email, function(user) {
    if (user.length == 0) res.send('There is no account registered with this email');
    if (user.length > 0) {
      const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
      crypto.randomBytes(48, function(err, buffer) {
        var token = buffer.toString('hex');
        var now = new Date();
        var nextDay   = now.getDate() + 2;
        var tomorrow = new Date('2018-04-' + nextDay );
        var expiry   = tomorrow.toJSON();
        sqljs.setReset(db, req.body.email, token, "date('" + expiry + "')", function () {
          var url = 'http://localhost:8080/newpassword?token=' + token + '&email=' + req.body.email;
          var mailOptions = {
            from: 'SeaMor <seamorwildlifetours@gmail.com>',
            to: req.body.email,
            subject: 'Reset your SeaMor Account Password',
            text: 'Reset your password by following this link ' + url
          };
          transporter.sendMail(mailOptions, function(err, info){
            if (err) res.send(err);
            if (!err) res.send('Email sent');
          });
        });
      });
    }
  });
});

app.post('/verify', function(req, res) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  sqljs.findUserByEmail(db, req.body.email, function(user) {
    if (user.length == 0) res.send('There is no account registered with this email');
    if (user.length > 0) {
      const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
      crypto.randomBytes(48, function(err, buffer) {
        var token = buffer.toString('hex');
        sqljs.setVerificationToken(db, req.body.email, token, function () {
          var url = 'http://localhost:8080/verify?token=' + token + '&email=' + req.body.email;
          var mailOptions = {
            from: 'SeaMor <seamorwildlifetours@gmail.com>',
            to: req.body.email,
            subject: 'Verify your SeaMor Account',
            text: 'Verify your account by following this link ' + url
          };
          transporter.sendMail(mailOptions, function(err, info){
            if (err) throw err;
            if (!err) res.send('Success');
          });
        });
      });
    }
  });
});

app.get('/verify', function(req,res) {

  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  console.log(req.query);
  sqljs.checkVerfication(db, req.query.email, req.query.token, function(err) {
    if(err) throw err;
    if(!err) {

    }
  });
  var html = `
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta name="author" content="Elis Jones and Sonny Peng "></meta>
      <title> Form </title>
      <script type="text/javascript" src="scripts/bundle.js"></script>
      <link rel="stylesheet" href="./css/style.css" />
      <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.9/css/all.css" integrity="sha384-5SOiIsAziJl6AWe0HWRKTXlfcSHKmYV4RBF18PPJ173Kzn7jzMyFuTtk8JA7QQG1" crossorigin="anonymous">
    </head>

    <body>
      <form class="login-form" id="reset-form">
        <a class="login-a wide" id="reset-to-signin" href="#">Success</a>
      </form>
    </body>
  </html>
  `;
  res.status(200);
  res.type('.html');
  res.send(html);
});

app.get('/newpassword', function(req, res) {
  var token = req.query.token;
  var email = req.query.email;
  var html = `
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta name="author" content="Elis Jones and Sonny Peng "></meta>
      <title> Form </title>
      <script type="text/javascript" src="scripts/bundle.js"></script>
      <link rel="stylesheet" href="./css/style.css" />
      <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.9/css/all.css" integrity="sha384-5SOiIsAziJl6AWe0HWRKTXlfcSHKmYV4RBF18PPJ173Kzn7jzMyFuTtk8JA7QQG1" crossorigin="anonymous">
    </head>

    <body>
      <form class="login-form" id="reset-form">
        <input class="login-input invisible" id="hidden-email" type="text" name="username" value="${email}">
        <input class="login-input invisible" id="hidden-token" type="text" name="token" value="${token}">
        <input class="login-input" id="new-password" type="password" name="new-password" placeholder="New Password" autocomplete="new-password" required=true />
        <input class="login-input" id="confirm-new-password" type="password" name="confirm-new-password" placeholder="Confirm Password" autocomplete="new-password" required=true />
        <input class="login-button" id="reset-account-password" type="button" value="Reset" />
        <a class="login-a wide" id="reset-to-signin" href="#">Sign In</a>
      </form>
      <section class="error-overlay" id="error">
        <section class="error-message" id="error-message">
        </section>
      </section>
    </body>
  </html>
  `;
  res.status(200);
  res.type('.html');
  res.send(html);
});

app.post('/newpassword', function(req,res) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  var token = req.body.token;
  var email = req.body.email;
  var password = req.body.password;
  sqljs.checkToken(db, email, token, function(err, user) {
    if(user) {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if(err) throw err;
        sqljs.updatePassword(db, hash, email, function(err) {
          if(err) res.send(err);
          if(!err) res.send('Success');
        });
      });
    } else {
      res.send(err);
    }
  });
});

app.get('/book', function(req,res) {
  if(req.session.passport) {
    const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
    sqljs.makeBooking(db, req.session.passport.user ,req.query.tripId, req.query.seats, function(err) {
      if(err) throw err;
      res.send('Booking successful');
    });
  } else {
    res.send('You must sign in');
  }
});

app.get('/bookings', function(req,res) {
  if(req.session.passport) {
    const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
    sqljs.getBookingsByUserId(db, req.session.passport.user, function(err, rows) {
      if (err) throw err;
      res.send(rows);
    });
  }
});
