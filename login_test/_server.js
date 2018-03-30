const express         = require('express');
const app             = express();
const sql             = require('sqlite3');
const sqljs           = require('./sql.js');
const path            = require('path');
const bodyParser      = require('body-parser')
const bcrypt          = require('bcrypt');
const passport        = require('passport');
const session         = require('express-session');
const saltRounds           = 10;

var LocalStrategy = require('passport-local').Strategy;

app.use(session({
  secret: 'verygoodsecret' ,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(user, done) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  sqljs.findUserById(db, user.id, function(err, user) {
    if(err) throw err;
    done(null, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  console.log('strat');
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  sqljs.findUser(db, username, function(err, user) {
    // This is how you handle error
    if (err) return done(err);
    // When user is not found
    if (user.length == 0) return done(null, false);

    bcrypt.compare(password, user.password, function(err, res) {
      if(err) throw err;
      if(!res) return done(null, false);
      if(res)  return done(null, true);
    });

   });
}));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
});

app.listen('8080', function() {
  console.log('Server started on port 8080');
});

app.post('/re', function(req, res) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  bcrypt.hash(req.body.pass, saltRounds, function(err, hash) {
    sqljs.storeUserHash(db, req.body.user, hash, function() {});
  });
  res.send('registered');
});

app.post('/attempt', function (req, res) {
  passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/');
    }
});
