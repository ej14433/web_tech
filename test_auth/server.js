const express         = require('express');
const session         = require('express-session')
const app             = express();
const passport        = require('passport');
const GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;
const path            = require('path');

app.use(session({
  secret: 'anything' ,
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
    // sqljs.findOrCreate(profile.id, function(err, user) {
      return done(null, profile.name.givenName + ' ' + profile.name.familyName);
  }
));

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

app.get('/book', function(req, res) {
  console.log(req);
  if(req.user) {
    res.send('Booked');
  } else {
    res.send('Not logged in');
  }
})

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'))
});

app.listen('8080', function() {
  console.log('Server started on port 8080');
});
