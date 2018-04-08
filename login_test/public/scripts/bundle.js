(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';
const validate = require('./validation.js');
const views    = require('./views.js');
const req      = require('./request.js');
const user     = require('./user.js');
const message  = require('./message.js');
const searchjs = require('./search.js');

window.addEventListener('load', function (e) {

  var signInForm = document.getElementById('signin-form');
  var bookingForm = document.getElementById('booking-form');
  var request = req.get('/issignedin');
  request.onreadystatechange = function() {
    if(request.readyState == XMLHttpRequest.DONE) {
      if(request.response == 'yes') {
        signInForm.style.display = 'none';
        bookingForm.style.display = 'grid';
      }
    }
  }

  var register        = document.getElementById('register');
  var search          = document.getElementById('search');
  var signin          = document.getElementById('signin');
  var registerButton  = document.getElementById('register-button');
  var loginButton     = document.getElementById('login-button');
  var lost            = document.getElementById('lost');
  var lostSignIn      = document.getElementById('lost-signin');
  var reset           = document.getElementById('reset-password');
  var finishReset     = document.getElementById('reset-account-password');
  var bookButton      = document.getElementById('book-trip')

  if(search) {
    register.addEventListener(      'click', views.register);
    loginButton.addEventListener(   'click', user.loginUser);
    signin.addEventListener(        'click', views.signin);
    registerButton.addEventListener('click', user.registerNewUser);
    lost.addEventListener(          'click', views.lost);
    lostSignIn.addEventListener(    'click', views.signin);
    search.addEventListener(        'click', searchjs.available);
    reset.addEventListener(         'click', user.resetPassword);
    bookButton.addEventListener(    'click', searchjs.create);
  }
  if(finishReset) {
    finishReset.addEventListener(   'click', user.newPassword);
  }
});

},{"./message.js":2,"./request.js":3,"./search.js":4,"./user.js":5,"./validation.js":6,"./views.js":7}],2:[function(require,module,exports){
'use strict';
const validate = require('./validation.js');
const views    = require('./views.js');
const req      = require('./request.js');
const user = require('./user.js');

function showMessage(message){
  document.getElementById('error-message').innerHTML = message;
  var error = document.getElementById('error');
  error.style.display = 'grid';
  error.style.opacity = 1;
  setTimeout(function(){ error.style.opacity = 0;}, 700);
  setTimeout(function(){ error.style.display = 'none'; }, 1200);
}

module.exports = {
  show : showMessage
};

},{"./request.js":3,"./user.js":5,"./validation.js":6,"./views.js":7}],3:[function(require,module,exports){
'use strict';

function prepGet(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();
  return request;
}

function prepPost(url) {
  var request = new XMLHttpRequest();
  request.open('POST', url, true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  return request;
}

module.exports = {
  get  : prepGet,
  post : prepPost
}

},{}],4:[function(require,module,exports){
'use strict';
const validate = require('./validation.js');
const req      = require('./request.js');
const message  = require('./message.js');

function searchAvail() {
  var tripList  = document.getElementById('tripList');
  var date  = document.getElementById('date-input').value;
  var seats = document.getElementById('seats-input').value;
  var url   = '/search/?date=' + date + '&seats=' +  seats;
  var request = req.get(url);
  var trips = [];

  var regexDate = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  var regexSeat = /[0-9]{1,2}/;
  validate.search(date, seats, function(err) {
    if (err) message.show(err);
    if(!err) {
      request.onreadystatechange = function () {
        if(request.readyState == XMLHttpRequest.DONE) {
          trips = JSON.parse(request.response);
          tripList.innerHTML = '<option value="empty"></option>';
          if(trips.length == 0) {
            message.show("There are no trips available within these values");
          } else {
            for(var i = 0; i < trips.length; i++) {
              tripList.innerHTML += "<option value='"+ trips[i].tripId+ " " + seats +"'>" + trips[i].time +"</option>";
            }
            tripList.value = trips[0].tripId + " " + seats;
          }
        }
      }
    }
  });
}

function makeBooking() {
  var trip = tripList.value.split(' ');
  var tripId = trip[0];
  var seats  = trip[1];
  var request = req.get("/book?tripId="+tripId+"&seats="+seats);
  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      message.show(request.response);
    }
  }
}



module.exports = {
  available : searchAvail,
  create    : makeBooking
}

},{"./message.js":2,"./request.js":3,"./validation.js":6}],5:[function(require,module,exports){
'use strict';
const validate = require('./validation.js');
const views    = require('./views.js');
const req      = require('./request.js');
const message = require('./message.js');

function resetPassword() {
  var email = document.getElementById('reset-email').value;
  var params = 'email='+email;
  var url   = '/reset';
  var request = req.post(url);
  request.send(params);

  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      if(request.response == 'Email sent') {
        views.signin();
      }
      message.show(request.response);
    }
  }
}

function newPassword() {
  var password = document.getElementById('new-password').value;
  var email    = document.getElementById('hidden-email').value;
  var token    = document.getElementById('hidden-token').value;
  var params   = "password="+password+"&email="+email+"&token="+token;
  var url      = "/newpassword";
  var request  = req.post(url);
  request.send(params);

  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      message.show(request.response);
    }
  }
}

function loginUser() {
  var username  = document.getElementById('username').value;
  var password  = document.getElementById('password').value;

  validate.login(username, password, function(err) {
    if(err) message.show(err);
    if(!err) {
      var params    = "username="+username+"&password="+password;
      var url       = "/login";
      var request   = req.post(url);
      request.send(params);
      request.onreadystatechange = function () {
        if(request.readyState == XMLHttpRequest.DONE) {
          message.show(request.response);
          if(request.response == 'Success') {
            console.log(request);
            views.booking();
          }
        }
      }
    }
  });
}

function registerNewUser() {
  var username  = document.getElementById('register-username').value;
  var password  = document.getElementById('register-password').value;
  var password2 = document.getElementById('register-password2').value;
  var email     = document.getElementById('register-email').value;

  validate.register(username, password, password2, email, function(err) {
    if(err) message.show(err);
    if(!err) {
      var params    = "username="+username+"&password="+password+"&email="+email;
      var url       = "/register";
      var request   = req.post(url);
      request.send(params);
      request.onreadystatechange = function () {
        if(request.readyState == XMLHttpRequest.DONE) {
          if(request.response == 'success') {
            message.show('Registered');
            sendVerification(email);
            views.signin();
          } else {
            message.show(request.response);
          }
        }
      }
    }
  });
}

function sendVerification(email) {
  console.log('Verifying');
  var params    = "email="+email;
  var url       = "/verify";
  var request   = req.post(url);
  request.send(params);
  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      if(request.response == 'Success') {
        message.show('Verification email sent');
      } else {
        message.show(request.response);
      }
    }
  }
}

module.exports = {
  sendVerification : sendVerification,
  registerNewUser  : registerNewUser,
  loginUser        : loginUser,
  newPassword      : newPassword,
  resetPassword    : resetPassword
}

},{"./message.js":2,"./request.js":3,"./validation.js":6,"./views.js":7}],6:[function(require,module,exports){
'use strict';

function validLogin(username, password, callback) {
  if(!password || !username) {
    callback('All field must be filled');
  }
  if(password.length<8) {
    callback('All passwords are atleast 8 characters')
  }
  else {
    callback();
  }
}

function validRegister(username, password, password2, email, callback) {
  var regex = /^[\w]*$/;
  if(!password || !username || !password2 || !email) {
    callback('All fields must be filled');
  }
  else if (password.length < 8) {
    callback('Password must be atleast 8 characters');
  }
  else if(!(password === password2)) {
    callback('Passwords do not match');
  }
  else if(!(username.match(regex)) || !(password.match(regex))) {
    callback('Username and password must be consist of only letters and numbers');
  }
  else {
    callback();
  }
}

function validSearch(date, seats, callback) {
  if(!date || ! seats) {
    callback('All field must be filled');
  }
  callback();
}

module.exports = {
  login : validLogin,
  register : validRegister,
  search : validSearch
}

},{}],7:[function(require,module,exports){
'use strict';

function signInView() {
  var forms = document.getElementsByClassName('login-form');
  var signInForm = document.getElementById('signin-form');
  for(var i = 0; i < forms.length; i++) {
    forms[i].style.display = 'none';
  }
  signInForm.style.display = 'grid';
}

function registerView() {
  var signInForm = document.getElementById('signin-form');
  var registerForm = document.getElementById('register-form');
  signInForm.style.display = 'none';
  registerForm.style.display = 'grid';
}

function bookingView() {
  var bookingForm = document.getElementById('booking-form');
  var signInForm = document.getElementById('signin-form');
  signInForm.style.display = 'none';
  bookingForm.style.display = 'grid';
}

function lostView() {
  var lostForm = document.getElementById('lost-form');
  var signInForm = document.getElementById('signin-form');
  signInForm.style.display = 'none';
  lostForm.style.display = 'grid';
}

module.exports = {
  lost : lostView,
  booking : bookingView,
  signin : signInView,
  register : registerView
}

},{}]},{},[1]);