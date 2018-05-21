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
const isPortAvailable = require('is-port-available');
const https           = require('https');
const http            = require('http');
const fs              = require('fs');
const helmet          = require('helmet')
const expressSanitizer= require('express-sanitizer');


var port = 80;
var backup_port = 8080;

const passport        = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const session         = require("express-session");
const bodyParser      = require("body-parser");
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seamorwildlifetours@gmail.com',
    pass: 'C@ms32500'
  }
});
var png_string = qr.imageSync('SEAMOR130820', { type: 'png' });




//default:
//frameguard, -> prevent clickjacking
// dnsprefetch, -> prefetching is not allowed
// hidepoweredby -> remove x powred by header, add obscurity, increase performance slightly
//https-strict-transport-security, HSTS -> "force" https than http
//ienoopen, -> prevent old IE browser from opening HTML file in context of the site, so that they
//can not act as the site

// nosniff, -> prevent browser to execute unknown/Incorrect MIME content type.
// xssfilter -> pre
app.use(helmet())

app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(expressSanitizer());

// helmet settings

//clickjacking attack prevention.
//deny if completely ignore, but samorigin to allow admin to add their own frame
app.use(helmet({
  frameguard: {
    action: 'sameorigin'
  }
}))

// turn on increase loading speed, but expose user privacy
// off = default speed, but more privacy control for user as they can turn this
// on if they want to
// here, privacy priority
app.use(helmet.dnsPrefetchControl({ allow: false }))

//HSTS
var halfYear = 15770000
app.use(helmet.hsts({
  maxAge: halfYear
}))

var checkURL = function(req, res, next){
  if (req.url.includes("//")){
    return res.send('URL should not contain string //', 400)
  }
  next();
}

app.use(checkURL, express.static(path.join(__dirname, '/public')));


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

app.get('/logout', function(req, res){
  req.session.destroy(function (err) {
    res.redirect('/');
  });
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



app.post('/reset', function (req, res) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  sqljs.findUserByEmail(db, req.body.email, function(user) {
    if (user.length == 0) res.send('There is no account registered with this email');
    if (user.length > 0) {
      const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
      crypto.randomBytes(48, function(err, buffer) {
        var token = buffer.toString('hex');
        var now = new Date();
        now.setDate(now.getDate() + 1);
        var year = now.getFullYear();
        var month = (('0' + (now.getMonth()+1)).slice(-2));
        console.log(month);
        var day = now.getDate();
        var date = `${year}-${month}-${day}`;

        var tomorrow = new Date(date);
        var expiry   = tomorrow.toJSON();
        sqljs.setReset(db, req.body.email, token, "date('" + expiry + "')", function () {
          var url = 'https://localhost:8080/newpassword?token=' + token + '&email=' + req.body.email;
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
          var url = 'https://localhost:8080/verify?token=' + token + '&email=' + req.body.email;
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

app.post('/updatedetails', function(req,res) {
  if(req.session.passport) {
    const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
    sqljs.getAccountDetails(db, req.session.passport.user, function(err, rows) {
      if(err) throw err;
      var current = JSON.parse(rows);
      if(current.username == req.body.username && current.email == req.body.email) {
        res.send('No changes to be made');
      } else {
        const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
        sqljs.updateAccountDetails(db, req.body.username, req.body.email,  req.session.passport.user, function() {
          res.send('Sweet')
        });
      }
    });
  }
});

app.get('/verify', function(req,res) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  sqljs.checkVerfication(db, req.query.email, req.query.token, function(err) {
    if(err) throw err;
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
        <section class="main-box">
          <h2>Successully verified!</h2>
        </section>
      </body>
    </html>
    `;
    res.status(200);
    res.type('.html');
    res.send(html);
  });
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

    <body class="width-1">
      <form class="login-form" id="reset-form">
        <input class="login-input invisible" id="hidden-email" type="text" name="username" value="${email}">
        <input class="login-input invisible" id="hidden-token" type="text" name="token" value="${token}">
        <input class="login-input" id="new-password" type="password" name="new-password" placeholder="New Password" autocomplete="new-password" required=true />
        <input class="login-input" id="confirm-new-password" type="password" name="confirm-new-password" placeholder="Confirm Password" autocomplete="new-password" required=true />
        <input class="login-button" id="reset-account-password" type="button" value="Reset" />
        <a class="login-a wide" id="reset-to-signin" href="/">Sign In</a>
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

app.post('/review', function(req,res) {
  const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
  var email = req.body.email;
  var name  = `${req.body.firstname} ${req.body.lastname}`;
  var review = req.body.review;

  sqljs.addReview(db,email,name,review, function(err){
    if(err) res.send('This email has already submitted a review');
    if(!err) res.send('Success');
  });
});

app.get('/book', function(req,res) {
  if(req.session.passport) {
    if(!(req.query.tripid)) {
      res.send("You must select a trip");
    } else {
      const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
      sqljs.makeBooking(db, req.session.passport.user ,req.query.tripid, req.query.seats, function(err) {
        if(err) throw err;
        res.send('Booking successful');
      });
    }
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

app.get('/accountdetails', function(req,res) {
  if(req.session.passport) {
    const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
    sqljs.getAccountDetails(db, req.session.passport.user, function(err, rows) {
      if(err) throw err;
      res.send(rows);
    })
  }
});

app.get('/latestreviews', function(req, res) {
    const db = new sql.Database('./data.db', function (err) { if(err) throw err; });
    sqljs.getLatestReviews(db, function(err, rows) {
      if (err) throw err;
      res.send(rows)
    });
});


app.get("/:id", function(req, res, next) {
  var url = "./public" + req.url;
  //TODO: LOWER CASE URL
  // URL can not contain //
    if(!url.endsWith("/")){     //make sure url ends with / or send redirect signal
      if(fs.existsSync(url + "/")){  // make sure such folder exist
        console.log("redirect")
        return res.redirect(req.url, 302);
      }else if(fs.existsSync(url + ".html")){ //if no folder, try .html
        res.setHeader('content-type', 'text/html; charset=utf-8');
        console.log("rendering")
        return res.render(req.params.id);
      }else{
        next();
      }
    }else if (fs.existsSync(url + "/index.html")){
      return res.render(req.params.id);
    }
  next();
});

app.post('/', function(req, res, next) {
  // replace an HTTP posted body property with the sanitized string
  req.body.sanitized = req.sanitize(req.body.propertyToSanitize);
  // send the response
  res.send('Your value was sanitized to: ' + req.body.sanitized);
});

app.get("*", function(req, res, next) {
  return res.send('Page not found', 404)
});

const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
  key:  fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
}

isPortAvailable(port).then( status =>{
    if(status){
      https.createServer(httpsOptions, app).listen(port, function(){
        console.log("Listening to port: https://localhost:"+ port);
      });
    }else{
      https.createServer(httpsOptions, app).listen(backup_port, function(){
        console.log("Port 80 is occupied, Listening to port: https://localhost:"+ backup_port);
      });
    }
});

//
// https.createServer(httpsOptions, app).listen(https_port, function(){
//   console.log("Listening to port: "+ https_port);
// });
