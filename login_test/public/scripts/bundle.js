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

  if(bookings) {
    views.populateBookings();
  }

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
  var myBookings = document.getElementById('my-bookings');

  if(signInForm) {
    signInForm.style.display  = 'none';
    bookingForm.style.display = 'grid';
  }
  // myBookings.style.display  = 'grid';
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
  readMore : readMore
}

},{"./message.js":2,"./request.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYWluLmpzIiwibWVzc2FnZS5qcyIsInJlcXVlc3QuanMiLCJzZWFyY2guanMiLCJ1c2VyLmpzIiwidmFsaWRhdGlvbi5qcyIsInZpZXdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHZhbGlkYXRlID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uLmpzJyk7XG5jb25zdCB2aWV3cyAgICA9IHJlcXVpcmUoJy4vdmlld3MuanMnICAgICApO1xuY29uc3QgcmVxICAgICAgPSByZXF1aXJlKCcuL3JlcXVlc3QuanMnICAgKTtcbmNvbnN0IHVzZXIgICAgID0gcmVxdWlyZSgnLi91c2VyLmpzJyAgICAgICk7XG5jb25zdCBtZXNzYWdlICA9IHJlcXVpcmUoJy4vbWVzc2FnZS5qcycgICApO1xuY29uc3Qgc2VhcmNoanMgPSByZXF1aXJlKCcuL3NlYXJjaC5qcycgICAgKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoZSkge1xuXG4gIHZhciByZXF1ZXN0ID0gcmVxLmdldCgnL2lzc2lnbmVkaW4nKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgaWYocmVxdWVzdC5yZXNwb25zZSA9PSAneWVzJykge1xuICAgICAgICB2aWV3cy5zaWduZWRJbigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBib29raW5ncyAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9va2luZ3MnICAgICAgICAgICAgICApO1xuICB2YXIgcmVnaXN0ZXIgICAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyJyAgICAgICAgICAgICAgKTtcbiAgdmFyIHNlYXJjaCAgICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gnICAgICAgICAgICAgICAgICk7XG4gIHZhciBzaWduaW4gICAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluJyAgICAgICAgICAgICAgICApO1xuICB2YXIgcmVnaXN0ZXJCdXR0b24gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWJ1dHRvbicgICAgICAgKTtcbiAgdmFyIGxvZ2luQnV0dG9uICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi1idXR0b24nICAgICAgICAgICk7XG4gIHZhciBsb3N0ICAgICAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9zdCcgICAgICAgICAgICAgICAgICApO1xuICB2YXIgbG9zdFNpZ25JbiAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvc3Qtc2lnbmluJyAgICAgICAgICAgKTtcbiAgdmFyIHJlc2V0ICAgICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldC1wYXNzd29yZCcgICAgICAgICk7XG4gIHZhciBmaW5pc2hSZXNldCAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQtYWNjb3VudC1wYXNzd29yZCcpO1xuICB2YXIgYm9va0J1dHRvbiAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jvb2stdHJpcCcgICAgICAgICAgICAgKTtcbiAgdmFyIG15Qm9va2luZ3MgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdteS1ib29raW5ncycgICAgICAgICAgICk7XG4gIHZhciByZWFkTW9yZXMgICAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucmVhZC1tb3JlLWJ1dHRvbicgICApO1xuXG4gIGlmKGJvb2tpbmdzKSB7XG4gICAgdmlld3MucG9wdWxhdGVCb29raW5ncygpO1xuICB9XG5cbiAgaWYoc2VhcmNoKSB7XG4gICAgcmVnaXN0ZXIuYWRkRXZlbnRMaXN0ZW5lciggICAgICAnY2xpY2snLCB2aWV3cy5yZWdpc3RlciAgICAgICk7XG4gICAgbG9naW5CdXR0b24uYWRkRXZlbnRMaXN0ZW5lciggICAnY2xpY2snLCB1c2VyLmxvZ2luVXNlciAgICAgICk7XG4gICAgc2lnbmluLmFkZEV2ZW50TGlzdGVuZXIoICAgICAgICAnY2xpY2snLCB2aWV3cy5zaWduaW4gICAgICAgICk7XG4gICAgcmVnaXN0ZXJCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB1c2VyLnJlZ2lzdGVyTmV3VXNlcik7XG4gICAgbG9zdC5hZGRFdmVudExpc3RlbmVyKCAgICAgICAgICAnY2xpY2snLCB2aWV3cy5sb3N0ICAgICAgICAgICk7XG4gICAgbG9zdFNpZ25Jbi5hZGRFdmVudExpc3RlbmVyKCAgICAnY2xpY2snLCB2aWV3cy5zaWduaW4gICAgICAgICk7XG4gICAgc2VhcmNoLmFkZEV2ZW50TGlzdGVuZXIoICAgICAgICAnY2xpY2snLCBzZWFyY2hqcy5hdmFpbGFibGUgICk7XG4gICAgcmVzZXQuYWRkRXZlbnRMaXN0ZW5lciggICAgICAgICAnY2xpY2snLCB1c2VyLnJlc2V0UGFzc3dvcmQgICk7XG4gICAgYm9va0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCAgICAnY2xpY2snLCBzZWFyY2hqcy5jcmVhdGUgICAgICk7XG4gICAgcmVhZE1vcmVzLmZvckVhY2gocmVhZE1vcmUgPT4gcmVhZE1vcmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB2aWV3cy5yZWFkTW9yZSkpO1xuICB9XG4gIGlmKGZpbmlzaFJlc2V0KSB7XG4gICAgZmluaXNoUmVzZXQuYWRkRXZlbnRMaXN0ZW5lciggICAnY2xpY2snLCB1c2VyLm5ld1Bhc3N3b3JkKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5mdW5jdGlvbiBzaG93TWVzc2FnZShtZXNzYWdlKXtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Vycm9yLW1lc3NhZ2UnKS5pbm5lckhUTUwgPSBtZXNzYWdlO1xuICB2YXIgZXJyb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXJyb3InKTtcbiAgZXJyb3Iuc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbiAgZXJyb3Iuc3R5bGUub3BhY2l0eSA9IDE7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgZXJyb3Iuc3R5bGUub3BhY2l0eSA9IDA7fSwgNzAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpeyBlcnJvci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyB9LCAxMjAwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNob3cgOiBzaG93TWVzc2FnZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcHJlcEdldCh1cmwpIHtcbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwpO1xuICByZXF1ZXN0LnNlbmQoKTtcbiAgcmV0dXJuIHJlcXVlc3Q7XG59XG5cbmZ1bmN0aW9uIHByZXBQb3N0KHVybCkge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xuICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIik7XG4gIHJldHVybiByZXF1ZXN0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0ICA6IHByZXBHZXQsXG4gIHBvc3QgOiBwcmVwUG9zdFxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgdmFsaWRhdGUgPSByZXF1aXJlKCcuL3ZhbGlkYXRpb24uanMnKTtcbmNvbnN0IHJlcSAgICAgID0gcmVxdWlyZSgnLi9yZXF1ZXN0LmpzJyk7XG5jb25zdCBtZXNzYWdlICA9IHJlcXVpcmUoJy4vbWVzc2FnZS5qcycpO1xuXG5mdW5jdGlvbiBzZWFyY2hBdmFpbCgpIHtcbiAgdmFyIHRyaXBMaXN0ICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0cmlwTGlzdCcpO1xuICB2YXIgZGF0ZSAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGF0ZS1pbnB1dCcpLnZhbHVlO1xuICB2YXIgc2VhdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhdHMtaW5wdXQnKS52YWx1ZTtcbiAgdmFyIHVybCAgID0gJy9zZWFyY2gvP2RhdGU9JyArIGRhdGUgKyAnJnNlYXRzPScgKyAgc2VhdHM7XG4gIHZhciByZXF1ZXN0ID0gcmVxLmdldCh1cmwpO1xuICB2YXIgdHJpcHMgPSBbXTtcblxuICB2YXIgcmVnZXhEYXRlID0gL1swLTldezR9LVswLTldezJ9LVswLTldezJ9LztcbiAgdmFyIHJlZ2V4U2VhdCA9IC9bMC05XXsxLDJ9LztcbiAgdmFsaWRhdGUuc2VhcmNoKGRhdGUsIHNlYXRzLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSBtZXNzYWdlLnNob3coZXJyKTtcbiAgICBpZighZXJyKSB7XG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgICAgICB0cmlwcyA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgICAgdHJpcExpc3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJlbXB0eVwiPjwvb3B0aW9uPic7XG4gICAgICAgICAgaWYodHJpcHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2hvdyhcIlRoZXJlIGFyZSBubyB0cmlwcyBhdmFpbGFibGUgd2l0aGluIHRoZXNlIHZhbHVlc1wiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRyaXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHRyaXBMaXN0LmlubmVySFRNTCArPSBcIjxvcHRpb24gdmFsdWU9J1wiKyB0cmlwc1tpXS50cmlwSWQrIFwiIFwiICsgc2VhdHMgK1wiJz5cIiArIHRyaXBzW2ldLnRpbWUgK1wiPC9vcHRpb24+XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmlwTGlzdC52YWx1ZSA9IHRyaXBzWzBdLnRyaXBJZCArIFwiIFwiICsgc2VhdHM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gbWFrZUJvb2tpbmcoKSB7XG4gIHZhciB0cmlwID0gdHJpcExpc3QudmFsdWUuc3BsaXQoJyAnKTtcbiAgdmFyIHRyaXBJZCA9IHRyaXBbMF07XG4gIHZhciBzZWF0cyAgPSB0cmlwWzFdO1xuICB2YXIgcmVxdWVzdCA9IHJlcS5nZXQoXCIvYm9vaz90cmlwaWQ9XCIrdHJpcElkK1wiJnNlYXRzPVwiK3NlYXRzKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIG1lc3NhZ2Uuc2hvdyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICB9XG4gIH1cbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhdmFpbGFibGUgOiBzZWFyY2hBdmFpbCxcbiAgY3JlYXRlICAgIDogbWFrZUJvb2tpbmdcbn1cbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHZhbGlkYXRlID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uLmpzJyk7XG5jb25zdCB2aWV3cyAgICA9IHJlcXVpcmUoJy4vdmlld3MuanMnKTtcbmNvbnN0IHJlcSAgICAgID0gcmVxdWlyZSgnLi9yZXF1ZXN0LmpzJyk7XG5jb25zdCBtZXNzYWdlID0gcmVxdWlyZSgnLi9tZXNzYWdlLmpzJyk7XG5cbmZ1bmN0aW9uIHJlc2V0UGFzc3dvcmQoKSB7XG4gIHZhciBlbWFpbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldC1lbWFpbCcpLnZhbHVlO1xuICB2YXIgcGFyYW1zID0gJ2VtYWlsPScrZW1haWw7XG4gIHZhciB1cmwgICA9ICcvcmVzZXQnO1xuICB2YXIgcmVxdWVzdCA9IHJlcS5wb3N0KHVybCk7XG4gIHJlcXVlc3Quc2VuZChwYXJhbXMpO1xuXG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09ICdFbWFpbCBzZW50Jykge1xuICAgICAgICB2aWV3cy5zaWduaW4oKTtcbiAgICAgIH1cbiAgICAgIG1lc3NhZ2Uuc2hvdyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbmV3UGFzc3dvcmQoKSB7XG4gIHZhciBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXctcGFzc3dvcmQnKS52YWx1ZTtcbiAgdmFyIGVtYWlsICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGRlbi1lbWFpbCcpLnZhbHVlO1xuICB2YXIgdG9rZW4gICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGlkZGVuLXRva2VuJykudmFsdWU7XG4gIHZhciBwYXJhbXMgICA9IFwicGFzc3dvcmQ9XCIrcGFzc3dvcmQrXCImZW1haWw9XCIrZW1haWwrXCImdG9rZW49XCIrdG9rZW47XG4gIHZhciB1cmwgICAgICA9IFwiL25ld3Bhc3N3b3JkXCI7XG4gIHZhciByZXF1ZXN0ICA9IHJlcS5wb3N0KHVybCk7XG4gIHJlcXVlc3Quc2VuZChwYXJhbXMpO1xuXG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICBtZXNzYWdlLnNob3cocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ2luVXNlcigpIHtcbiAgdmFyIHVzZXJuYW1lICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VybmFtZScpLnZhbHVlO1xuICB2YXIgcGFzc3dvcmQgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkJykudmFsdWU7XG5cbiAgdmFsaWRhdGUubG9naW4odXNlcm5hbWUsIHBhc3N3b3JkLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZihlcnIpIG1lc3NhZ2Uuc2hvdyhlcnIpO1xuICAgIGlmKCFlcnIpIHtcbiAgICAgIHZhciBwYXJhbXMgICAgPSBcInVzZXJuYW1lPVwiK3VzZXJuYW1lK1wiJnBhc3N3b3JkPVwiK3Bhc3N3b3JkO1xuICAgICAgdmFyIHVybCAgICAgICA9IFwiL2xvZ2luXCI7XG4gICAgICB2YXIgcmVxdWVzdCAgID0gcmVxLnBvc3QodXJsKTtcbiAgICAgIHJlcXVlc3Quc2VuZChwYXJhbXMpO1xuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICAgICAgbWVzc2FnZS5zaG93KHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ1N1Y2Nlc3MnKSB7XG4gICAgICAgICAgICB2aWV3cy5zaWduZWRJbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyTmV3VXNlcigpIHtcbiAgdmFyIHVzZXJuYW1lICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci11c2VybmFtZScpLnZhbHVlO1xuICB2YXIgcGFzc3dvcmQgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXBhc3N3b3JkJykudmFsdWU7XG4gIHZhciBwYXNzd29yZDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItcGFzc3dvcmQyJykudmFsdWU7XG4gIHZhciBlbWFpbCAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKS52YWx1ZTtcblxuICB2YWxpZGF0ZS5yZWdpc3Rlcih1c2VybmFtZSwgcGFzc3dvcmQsIHBhc3N3b3JkMiwgZW1haWwsIGZ1bmN0aW9uKGVycikge1xuICAgIGlmKGVycikgbWVzc2FnZS5zaG93KGVycik7XG4gICAgaWYoIWVycikge1xuICAgICAgdmFyIHBhcmFtcyAgICA9IFwidXNlcm5hbWU9XCIrdXNlcm5hbWUrXCImcGFzc3dvcmQ9XCIrcGFzc3dvcmQrXCImZW1haWw9XCIrZW1haWw7XG4gICAgICB2YXIgdXJsICAgICAgID0gXCIvcmVnaXN0ZXJcIjtcbiAgICAgIHZhciByZXF1ZXN0ICAgPSByZXEucG9zdCh1cmwpO1xuICAgICAgcmVxdWVzdC5zZW5kKHBhcmFtcyk7XG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09ICdzdWNjZXNzJykge1xuICAgICAgICAgICAgbWVzc2FnZS5zaG93KCdSZWdpc3RlcmVkJyk7XG4gICAgICAgICAgICBzZW5kVmVyaWZpY2F0aW9uKGVtYWlsKTtcbiAgICAgICAgICAgIHZpZXdzLnNpZ25pbigpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlLnNob3cocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2VuZFZlcmlmaWNhdGlvbihlbWFpbCkge1xuICBjb25zb2xlLmxvZygnVmVyaWZ5aW5nJyk7XG4gIHZhciBwYXJhbXMgICAgPSBcImVtYWlsPVwiK2VtYWlsO1xuICB2YXIgdXJsICAgICAgID0gXCIvdmVyaWZ5XCI7XG4gIHZhciByZXF1ZXN0ICAgPSByZXEucG9zdCh1cmwpO1xuICByZXF1ZXN0LnNlbmQocGFyYW1zKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ1N1Y2Nlc3MnKSB7XG4gICAgICAgIG1lc3NhZ2Uuc2hvdygnVmVyaWZpY2F0aW9uIGVtYWlsIHNlbnQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lc3NhZ2Uuc2hvdyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNlbmRWZXJpZmljYXRpb24gOiBzZW5kVmVyaWZpY2F0aW9uLFxuICByZWdpc3Rlck5ld1VzZXIgIDogcmVnaXN0ZXJOZXdVc2VyLFxuICBsb2dpblVzZXIgICAgICAgIDogbG9naW5Vc2VyLFxuICBuZXdQYXNzd29yZCAgICAgIDogbmV3UGFzc3dvcmQsXG4gIHJlc2V0UGFzc3dvcmQgICAgOiByZXNldFBhc3N3b3JkXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHZhbGlkTG9naW4odXNlcm5hbWUsIHBhc3N3b3JkLCBjYWxsYmFjaykge1xuICBpZighcGFzc3dvcmQgfHwgIXVzZXJuYW1lKSB7XG4gICAgY2FsbGJhY2soJ0FsbCBmaWVsZCBtdXN0IGJlIGZpbGxlZCcpO1xuICB9XG4gIC8vIGlmKHBhc3N3b3JkLmxlbmd0aDw4KSB7XG4gICAgLy8gY2FsbGJhY2soJ0FsbCBwYXNzd29yZHMgYXJlIGF0bGVhc3QgOCBjaGFyYWN0ZXJzJylcbiAgLy8gfVxuICBlbHNlIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkUmVnaXN0ZXIodXNlcm5hbWUsIHBhc3N3b3JkLCBwYXNzd29yZDIsIGVtYWlsLCBjYWxsYmFjaykge1xuICB2YXIgcmVnZXggPSAvXltcXHddKiQvO1xuICBpZighcGFzc3dvcmQgfHwgIXVzZXJuYW1lIHx8ICFwYXNzd29yZDIgfHwgIWVtYWlsKSB7XG4gICAgY2FsbGJhY2soJ0FsbCBmaWVsZHMgbXVzdCBiZSBmaWxsZWQnKTtcbiAgfVxuICAvLyBlbHNlIGlmIChwYXNzd29yZC5sZW5ndGggPCA4KSB7XG4gICAgLy8gY2FsbGJhY2soJ1Bhc3N3b3JkIG11c3QgYmUgYXRsZWFzdCA4IGNoYXJhY3RlcnMnKTtcbiAgLy8gfVxuICBlbHNlIGlmKCEocGFzc3dvcmQgPT09IHBhc3N3b3JkMikpIHtcbiAgICBjYWxsYmFjaygnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCcpO1xuICB9XG4gIGVsc2UgaWYoISh1c2VybmFtZS5tYXRjaChyZWdleCkpIHx8ICEocGFzc3dvcmQubWF0Y2gocmVnZXgpKSkge1xuICAgIGNhbGxiYWNrKCdVc2VybmFtZSBhbmQgcGFzc3dvcmQgbXVzdCBiZSBjb25zaXN0IG9mIG9ubHkgbGV0dGVycyBhbmQgbnVtYmVycycpO1xuICB9XG4gIGVsc2Uge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRTZWFyY2goZGF0ZSwgc2VhdHMsIGNhbGxiYWNrKSB7XG4gIGlmKCFkYXRlIHx8ICEgc2VhdHMpIHtcbiAgICBjYWxsYmFjaygnQWxsIGZpZWxkIG11c3QgYmUgZmlsbGVkJyk7XG4gIH1cbiAgY2FsbGJhY2soKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvZ2luIDogdmFsaWRMb2dpbixcbiAgcmVnaXN0ZXIgOiB2YWxpZFJlZ2lzdGVyLFxuICBzZWFyY2ggOiB2YWxpZFNlYXJjaFxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgcmVxID0gcmVxdWlyZSgnLi9yZXF1ZXN0LmpzJyk7XG5jb25zdCBtZXNzYWdlID0gcmVxdWlyZSgnLi9tZXNzYWdlLmpzJyk7XG5cbmZ1bmN0aW9uIHNpZ25JblZpZXcoKSB7XG4gIHZhciBmb3JtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xvZ2luLWZvcm0nKTtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgZm9yKHZhciBpID0gMDsgaSA8IGZvcm1zLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9ybXNbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgfVxuICBzaWduSW5Gb3JtLnN0eWxlLmRpc3BsYXkgPSAnZ3JpZCc7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyVmlldygpIHtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgdmFyIHJlZ2lzdGVyRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1mb3JtJyk7XG4gIHNpZ25JbkZvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcmVnaXN0ZXJGb3JtLnN0eWxlLmRpc3BsYXkgPSAnZ3JpZCc7XG59XG5cbmZ1bmN0aW9uIGJvb2tpbmdWaWV3KCkge1xuICB2YXIgYm9va2luZ0Zvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9va2luZy1mb3JtJyk7XG4gIHZhciBzaWduSW5Gb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ25pbi1mb3JtJyk7XG4gIHNpZ25JbkZvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgYm9va2luZ0Zvcm0uc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbn1cblxuZnVuY3Rpb24gbG9zdFZpZXcoKSB7XG4gIHZhciBsb3N0Rm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb3N0LWZvcm0nKTtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBsb3N0Rm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xufVxuXG5mdW5jdGlvbiBzaWduZWRJblZpZXcoKSB7XG4gIHZhciBib29raW5nRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib29raW5nLWZvcm0nKTtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgdmFyIG15Qm9va2luZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbXktYm9va2luZ3MnKTtcblxuICBpZihzaWduSW5Gb3JtKSB7XG4gICAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ICA9ICdub25lJztcbiAgICBib29raW5nRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xuICB9XG4gIC8vIG15Qm9va2luZ3Muc3R5bGUuZGlzcGxheSAgPSAnZ3JpZCc7XG59XG5cbmZ1bmN0aW9uIHBvcHVsYXRlQm9va2luZ3MoKSB7XG4gIHZhciBib29raW5nc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9va2luZ3MnKTtcbiAgdmFyIHJlcXVlc3QgPSByZXEuZ2V0KCcvYm9va2luZ3MnKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIHZhciBib29raW5ncyA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICBpZihib29raW5ncy5sZW5ndGggPT0gMCkge1xuICAgICAgICBtZXNzYWdlLnNob3coJ1lvdSBoYXZlIG5vIGJvb2tpbmdzJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgYm9va2luZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcGFyc2VkQm9va2luZyA9IEpTT04ucGFyc2UoYm9va2luZ3NbaV0pO1xuICAgICAgICAgIHZhciBib29raW5nTnVtYmVyID0gcGFyc2VkQm9va2luZy5ib29raW5nSWQ7XG4gICAgICAgICAgaWYocGFyc2VkQm9va2luZy5ib2F0SWQgPT0gMSkge1xuICAgICAgICAgICAgdmFyIGJvYXQgPSAnSXNsYW5kZXInXG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJzZWRCb29raW5nLmJvYXRJZCA9PSAyKSB7XG4gICAgICAgICAgICB2YXIgYm9hdCA9ICdWaWtpbmcnXG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciB0aW1lID0gcGFyc2VkQm9va2luZy50aW1lO1xuICAgICAgICAgIHZhciBkYXRlID0gcGFyc2VkQm9va2luZy5kYXRlO1xuICAgICAgICAgIHZhciBwYXNzZW5nZXJzID0gcGFyc2VkQm9va2luZy5zZWF0cztcbiAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBgXG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJib29raW5nXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYm9va2luZy1udW1iZXJcIj4gQm9va2luZyBOdW1iZXI6ICR7Ym9va2luZ051bWJlcn0gPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBib2F0XCI+JHtib2F0fTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQgdGltZVwiPlRpbWU6ICR7dGltZX08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50IGRhdGVcIj5EYXRlOiAke2RhdGV9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBzZWF0c1wiPlNlYXRzOiAke3Bhc3NlbmdlcnN9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBpbmZvIHdpZGVcIj5BbGwgdGlja2V0cyBhcmUgYXZhaWxhYmxlIGZvciByZWZ1bmQgb3IgY2FuY2VsbGF0aW9uIHVwIHRvIDI0IGhvdXJzIHByaW9yIHRvIGRlcGFydHVyZSwgcGxlYXNlIGNvbnRhY3QgdXMgdmlhIHBob25lIG9yIGVtYWlsPC9kaXY+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgIGBcbiAgICAgICAgICBib29raW5nc0VsZW1lbnQuaW5uZXJIVE1MICs9IHRlbXBsYXRlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRNb3JlKGUpIHtcbiAgdmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuICB2YXIgc3BhbiA9IHRhcmdldC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLmZpcnN0RWxlbWVudENoaWxkO1xuICB2YXIgbWFpbkJveCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICB2YXIgaW1nID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gIHZhciBjcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG1haW5Cb3gsbnVsbCk7XG4gIHZhciBtYWluQm94R3JpZENvbHVtbiA9IGNzLmdldFByb3BlcnR5VmFsdWUoJ2dyaWQtY29sdW1uJyk7XG5cbiAgaWYoIShzcGFuLnN0eWxlLmRpc3BsYXkpIHx8IHNwYW4uc3R5bGUuZGlzcGxheSA9PSAnbm9uZScpIHtcbiAgICAgIHNwYW4uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICAgICAgdGFyZ2V0LmlubmVySFRNTCA9ICdSZWFkIExlc3MnO1xuICAgICAgY29uc29sZS5sb2cobWFpbkJveEdyaWRDb2x1bW4pO1xuICAgICAgaWYobWFpbkJveEdyaWRDb2x1bW4gPT0gJ3NwYW4gMSAvIGF1dG8nKSB7XG4gICAgICAgIG1haW5Cb3guc3R5bGUuZ3JpZENvbHVtbiA9ICdzcGFuIDIgLyBhdXRvJztcbiAgICAgIH1cbiAgICAgIHZhciBzcmMgPSBpbWcuc3JjO1xuICAgICAgdmFyIHNwbGl0dGVkID0gc3JjLnNwbGl0KCcuJyk7XG4gICAgICBzcGxpdHRlZCA9IHNwbGl0dGVkWzBdICsgJ19vcmlnLmpwZyc7XG4gICAgICBpbWcuc3JjID0gc3BsaXR0ZWQ7XG4gIH0gZWxzZSB7XG4gICAgc3Bhbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRhcmdldC5pbm5lckhUTUwgPSAnUmVhZCBNb3JlJztcbiAgICBpZihtYWluQm94R3JpZENvbHVtbiA9PSAnc3BhbiAyIC8gYXV0bycpIHtcbiAgICAgIG1haW5Cb3guc3R5bGUuZ3JpZENvbHVtbiA9ICdzcGFuIDEgLyBhdXRvJztcbiAgICB9XG4gICAgdmFyIHNyYyA9IGltZy5zcmM7XG4gICAgdmFyIHNwbGl0dGVkID0gc3JjLnNwbGl0KCdfJyk7XG4gICAgc3BsaXR0ZWQgPSBzcGxpdHRlZFswXSArICcucG5nJztcbiAgICBpbWcuc3JjID0gc3BsaXR0ZWQ7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvc3QgOiBsb3N0VmlldyxcbiAgYm9va2luZyA6IGJvb2tpbmdWaWV3LFxuICBzaWduaW4gOiBzaWduSW5WaWV3LFxuICByZWdpc3RlciA6IHJlZ2lzdGVyVmlldyxcbiAgc2lnbmVkSW4gOiBzaWduZWRJblZpZXcsXG4gIHBvcHVsYXRlQm9va2luZ3MgOiBwb3B1bGF0ZUJvb2tpbmdzLFxuICByZWFkTW9yZSA6IHJlYWRNb3JlXG59XG4iXX0=
