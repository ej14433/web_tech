(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
const validate = require('./validation.js');
const views    = require('./views.js'     );
const req      = require('./request.js'   );
const user     = require('./user.js'      );
const message  = require('./message.js'   );
const searchjs = require('./search.js'    );

window.addEventListener('load', function (e) {

  var request = req.get('/issignedin');
  request.onreadystatechange = function() {
    if(request.readyState == XMLHttpRequest.DONE) {
      if(request.response == 'yes') {
        views.signedIn();
      }
      if(request.response == 'no') {
        views.signOut();
      }
    }
  }

  var bookings        = document.getElementById('bookings'              );
  var register        = document.getElementById('register'              );
  var search          = document.getElementById('search'                );
  var signin          = document.getElementById('signin'                );
  var registerButton  = document.getElementById('register-button'       );
  var loginButton     = document.getElementById('login-button'          );
  var lost            = document.getElementById('lost'                  );
  var lostSignIn      = document.getElementById('lost-signin'           );
  var reset           = document.getElementById('reset-password'        );
  var finishReset     = document.getElementById('reset-account-password');
  var bookButton      = document.getElementById('book-trip'             );
  var myBookings      = document.getElementById('my-bookings'           );
  var readMores       = document.querySelectorAll('.read-more-button'   );
  var logOut          = document.getElementById('log-out'               );

  if(bookings) {
    views.populateBookings();
  }

  logOut.addEventListener(          'click', user.logOut         );

  if(search) {
    register.addEventListener(      'click', views.register      );
    loginButton.addEventListener(   'click', user.loginUser      );
    signin.addEventListener(        'click', views.signin        );
    registerButton.addEventListener('click', user.registerNewUser);
    lost.addEventListener(          'click', views.lost          );
    lostSignIn.addEventListener(    'click', views.signin        );
    search.addEventListener(        'click', searchjs.available  );
    reset.addEventListener(         'click', user.resetPassword  );
    bookButton.addEventListener(    'click', searchjs.create     );
    readMores.forEach(readMore => readMore.addEventListener('click', views.readMore));
  }
  if(finishReset) {
    finishReset.addEventListener(   'click', user.newPassword);
  }
});

},{"./message.js":2,"./request.js":3,"./search.js":4,"./user.js":5,"./validation.js":6,"./views.js":7}],2:[function(require,module,exports){
'use strict';
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

},{}],3:[function(require,module,exports){
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
  var request = req.get("/book?tripid="+tripId+"&seats="+seats);
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
            views.signedIn();
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

function logOut() {
  var url = "/logout";
  var request = req.get(url);
  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      window.location.reload();
    }
  }
}

module.exports = {
  sendVerification : sendVerification,
  registerNewUser  : registerNewUser,
  loginUser        : loginUser,
  newPassword      : newPassword,
  resetPassword    : resetPassword,
  logOut           : logOut
}

},{"./message.js":2,"./request.js":3,"./validation.js":6,"./views.js":7}],6:[function(require,module,exports){
'use strict';

function validLogin(username, password, callback) {
  if(!password || !username) {
    callback('All field must be filled');
  }
  // if(password.length<8) {
    // callback('All passwords are atleast 8 characters')
  // }
  else {
    callback();
  }
}

function validRegister(username, password, password2, email, callback) {
  var regex = /^[\w]*$/;
  if(!password || !username || !password2 || !email) {
    callback('All fields must be filled');
  }
  // else if (password.length < 8) {
    // callback('Password must be atleast 8 characters');
  // }
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
const req = require('./request.js');
const message = require('./message.js');

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

function signedInView() {
  var bookingForm = document.getElementById('booking-form');
  var signInForm = document.getElementById('signin-form');
  var logOut = document.getElementById('log-out');

  if(signInForm) {
    signInForm.style.display  = 'none';
    bookingForm.style.display = 'grid';
  }
  logOut.style.display = 'grid';
}

function signedOutView() {
  var bookingForm = document.getElementById('booking-form');
  var signInForm = document.getElementById('signin-form');
  var logOut = document.getElementById('log-out');

  if(signInForm) {
    signInForm.style.display  = 'grid';
    bookingForm.style.display = 'none';
  }
  logOut.style.display = 'none';
}

function populateBookings() {
  var bookingsElement = document.getElementById('bookings');
  var request = req.get('/bookings');
  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      var bookings = JSON.parse(request.response);
      if(bookings.length == 0) {
        message.show('You have no bookings');
      } else {
        for(var i = 0; i < bookings.length; i++) {
          var parsedBooking = JSON.parse(bookings[i]);
          var bookingNumber = parsedBooking.bookingId;
          if(parsedBooking.boatId == 1) {
            var boat = 'Islander'
          } else if (parsedBooking.boatId == 2) {
            var boat = 'Viking'
          }
          var time = parsedBooking.time;
          var date = parsedBooking.date;
          var passengers = parsedBooking.seats;
          var template = `
          <section class="booking">
            <div class="booking-number"> Booking Number: ${bookingNumber} </div>
            <div class="content boat">${boat}</div>
            <div class="content time">Time: ${time}</div>
            <div class="content date">Date: ${date}</div>
            <div class="content seats">Seats: ${passengers}</div>
            <div class="content info wide">All tickets are available for refund or cancellation up to 24 hours prior to departure, please contact us via phone or email</div>
          </section>
          `
          bookingsElement.innerHTML += template;
        }
      }
    }
  }
}

function readMore(e) {
  var target = e.target;
  var span = target.previousElementSibling.firstElementChild;
  var mainBox = target.parentElement;
  var img = target.parentElement.firstElementChild;
  var cs = window.getComputedStyle(mainBox,null);
  var mainBoxGridColumn = cs.getPropertyValue('grid-column');

  if(!(span.style.display) || span.style.display == 'none') {
      span.style.display = 'inline';
      target.innerHTML = 'Read Less';
      console.log(mainBoxGridColumn);
      if(mainBoxGridColumn == 'span 1 / auto') {
        mainBox.style.gridColumn = 'span 2 / auto';
      }
      var src = img.src;
      var splitted = src.split('.');
      splitted = splitted[0] + '_orig.jpg';
      img.src = splitted;
  } else {
    span.style.display = 'none';
    target.innerHTML = 'Read More';
    if(mainBoxGridColumn == 'span 2 / auto') {
      mainBox.style.gridColumn = 'span 1 / auto';
    }
    var src = img.src;
    var splitted = src.split('_');
    splitted = splitted[0] + '.png';
    img.src = splitted;
  }
}

module.exports = {
  lost : lostView,
  booking : bookingView,
  signin : signInView,
  register : registerView,
  signedIn : signedInView,
  populateBookings : populateBookings,
  readMore : readMore,
  signOut : signedOutView
}

},{"./message.js":2,"./request.js":3}]},{},[1]);
