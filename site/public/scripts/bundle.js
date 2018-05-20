(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
const validate = require('./validation.js');
const views    = require('./views.js'     );
const req      = require('./request.js'   );
const user     = require('./user.js'      );
const message  = require('./message.js'   );
const searchjs = require('./search.js'    );
const review   = require('./review.js'    );

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
  var forms           = document.querySelectorAll('form'                );
  var reviewButton    = document.querySelector('#review-submit'         );
  var reviewsContainter = document.querySelector('.reviews-container'   );

  if(bookings) {
    views.populateBookings();
  }

  if(reviewButton) {
    reviewButton.addEventListener(  'click', review.submit       );
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
    forms.forEach(        form => form.addEventListener(    'keyup', keyPress      ));
    review.populate();

  }

  if(finishReset) {
    finishReset.addEventListener(   'click', user.newPassword);
  }
});

function keyPress(e){
  switch(e.keyCode) {
    case 13:
      parent = e.target.parentElement;
      if(parent.id == 'signin-form') {
        user.loginUser();
      }
      break;
  }
}

},{"./message.js":2,"./request.js":3,"./review.js":4,"./search.js":5,"./user.js":6,"./validation.js":7,"./views.js":8}],2:[function(require,module,exports){
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
'use strict'
const req      = require('./request.js');
const message  = require('./message.js');

function submit() {
  var email     = document.querySelector('#review-email'    ).value;
  var firstname = document.querySelector('#review-firstname').value;
  var lastname  = document.querySelector('#review-lastname' ).value;
  var review    = document.querySelector('#review-entry'    ).value;

  var params = `email=${email}&firstname=${firstname}&lastname=${lastname}&review=${review}`
  var url = '/review';
  var request = req.post(url);
  request.send(params)

  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      console.log(request.response);
    }
  }

}

function populate() {
  var reviewsElement = document.querySelector('.reviews-container');
  var request = req.get('/latestreviews');
  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      var reviews = JSON.parse(request.response);
      for(var i = 0; i < reviews.length; i ++) {
        var template = `
          <div class="reviews">
            <img src="./img/default.svg" alt="">
            <h2>${reviews[i].name}</h2>
            <p>${reviews[i].review}</p>
          </div>
        `;
        reviewsElement.innerHTML += template;
      }
    }
  }
}

module.exports = {
  submit : submit,
  populate : populate
}

},{"./message.js":2,"./request.js":3}],5:[function(require,module,exports){
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
          if(request.response == "notrip") {
            message.show("You must choose a trip first")
          }
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

},{"./message.js":2,"./request.js":3,"./validation.js":7}],6:[function(require,module,exports){
'use strict';
const message  = require('./message.js');
const req      = require('./request.js');
const validate = require('./validation.js');
const views    = require('./views.js');

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

},{"./message.js":2,"./request.js":3,"./validation.js":7,"./views.js":8}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./message.js":2,"./request.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYWluLmpzIiwibWVzc2FnZS5qcyIsInJlcXVlc3QuanMiLCJyZXZpZXcuanMiLCJzZWFyY2guanMiLCJ1c2VyLmpzIiwidmFsaWRhdGlvbi5qcyIsInZpZXdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHZhbGlkYXRlID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uLmpzJyk7XG5jb25zdCB2aWV3cyAgICA9IHJlcXVpcmUoJy4vdmlld3MuanMnICAgICApO1xuY29uc3QgcmVxICAgICAgPSByZXF1aXJlKCcuL3JlcXVlc3QuanMnICAgKTtcbmNvbnN0IHVzZXIgICAgID0gcmVxdWlyZSgnLi91c2VyLmpzJyAgICAgICk7XG5jb25zdCBtZXNzYWdlICA9IHJlcXVpcmUoJy4vbWVzc2FnZS5qcycgICApO1xuY29uc3Qgc2VhcmNoanMgPSByZXF1aXJlKCcuL3NlYXJjaC5qcycgICAgKTtcbmNvbnN0IHJldmlldyAgID0gcmVxdWlyZSgnLi9yZXZpZXcuanMnICAgICk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKGUpIHtcblxuICB2YXIgcmVxdWVzdCA9IHJlcS5nZXQoJy9pc3NpZ25lZGluJyk7XG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ3llcycpIHtcbiAgICAgICAgdmlld3Muc2lnbmVkSW4oKTtcbiAgICAgIH1cbiAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ25vJykge1xuICAgICAgICB2aWV3cy5zaWduT3V0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGJvb2tpbmdzICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib29raW5ncycgICAgICAgICAgICAgICk7XG4gIHZhciByZWdpc3RlciAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXInICAgICAgICAgICAgICApO1xuICB2YXIgc2VhcmNoICAgICAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcgICAgICAgICAgICAgICAgKTtcbiAgdmFyIHNpZ25pbiAgICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4nICAgICAgICAgICAgICAgICk7XG4gIHZhciByZWdpc3RlckJ1dHRvbiAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItYnV0dG9uJyAgICAgICApO1xuICB2YXIgbG9naW5CdXR0b24gICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLWJ1dHRvbicgICAgICAgICAgKTtcbiAgdmFyIGxvc3QgICAgICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb3N0JyAgICAgICAgICAgICAgICAgICk7XG4gIHZhciBsb3N0U2lnbkluICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9zdC1zaWduaW4nICAgICAgICAgICApO1xuICB2YXIgcmVzZXQgICAgICAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0LXBhc3N3b3JkJyAgICAgICAgKTtcbiAgdmFyIGZpbmlzaFJlc2V0ICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldC1hY2NvdW50LXBhc3N3b3JkJyk7XG4gIHZhciBib29rQnV0dG9uICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9vay10cmlwJyAgICAgICAgICAgICApO1xuICB2YXIgbXlCb29raW5ncyAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215LWJvb2tpbmdzJyAgICAgICAgICAgKTtcbiAgdmFyIHJlYWRNb3JlcyAgICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yZWFkLW1vcmUtYnV0dG9uJyAgICk7XG4gIHZhciBsb2dPdXQgICAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9nLW91dCcgICAgICAgICAgICAgICApO1xuICB2YXIgZm9ybXMgICAgICAgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZm9ybScgICAgICAgICAgICAgICAgKTtcbiAgdmFyIHJldmlld0J1dHRvbiAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXZpZXctc3VibWl0JyAgICAgICAgICk7XG4gIHZhciByZXZpZXdzQ29udGFpbnRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZXZpZXdzLWNvbnRhaW5lcicgICApO1xuXG4gIGlmKGJvb2tpbmdzKSB7XG4gICAgdmlld3MucG9wdWxhdGVCb29raW5ncygpO1xuICB9XG5cbiAgaWYocmV2aWV3QnV0dG9uKSB7XG4gICAgcmV2aWV3QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICAnY2xpY2snLCByZXZpZXcuc3VibWl0ICAgICAgICk7XG4gIH1cblxuICBsb2dPdXQuYWRkRXZlbnRMaXN0ZW5lciggICAgICAgICAgJ2NsaWNrJywgdXNlci5sb2dPdXQgICAgICAgICApO1xuXG4gIGlmKHNlYXJjaCkge1xuICAgIHJlZ2lzdGVyLmFkZEV2ZW50TGlzdGVuZXIoICAgICAgJ2NsaWNrJywgdmlld3MucmVnaXN0ZXIgICAgICApO1xuICAgIGxvZ2luQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICAgJ2NsaWNrJywgdXNlci5sb2dpblVzZXIgICAgICApO1xuICAgIHNpZ25pbi5hZGRFdmVudExpc3RlbmVyKCAgICAgICAgJ2NsaWNrJywgdmlld3Muc2lnbmluICAgICAgICApO1xuICAgIHJlZ2lzdGVyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdXNlci5yZWdpc3Rlck5ld1VzZXIpO1xuICAgIGxvc3QuYWRkRXZlbnRMaXN0ZW5lciggICAgICAgICAgJ2NsaWNrJywgdmlld3MubG9zdCAgICAgICAgICApO1xuICAgIGxvc3RTaWduSW4uYWRkRXZlbnRMaXN0ZW5lciggICAgJ2NsaWNrJywgdmlld3Muc2lnbmluICAgICAgICApO1xuICAgIHNlYXJjaC5hZGRFdmVudExpc3RlbmVyKCAgICAgICAgJ2NsaWNrJywgc2VhcmNoanMuYXZhaWxhYmxlICApO1xuICAgIHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoICAgICAgICAgJ2NsaWNrJywgdXNlci5yZXNldFBhc3N3b3JkICApO1xuICAgIGJvb2tCdXR0b24uYWRkRXZlbnRMaXN0ZW5lciggICAgJ2NsaWNrJywgc2VhcmNoanMuY3JlYXRlICAgICApO1xuICAgIHJlYWRNb3Jlcy5mb3JFYWNoKHJlYWRNb3JlID0+IHJlYWRNb3JlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdmlld3MucmVhZE1vcmUpKTtcbiAgICBmb3Jtcy5mb3JFYWNoKCAgICAgICAgZm9ybSA9PiBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoICAgICdrZXl1cCcsIGtleVByZXNzICAgICAgKSk7XG4gICAgcmV2aWV3LnBvcHVsYXRlKCk7XG5cbiAgfVxuXG4gIGlmKGZpbmlzaFJlc2V0KSB7XG4gICAgZmluaXNoUmVzZXQuYWRkRXZlbnRMaXN0ZW5lciggICAnY2xpY2snLCB1c2VyLm5ld1Bhc3N3b3JkKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGtleVByZXNzKGUpe1xuICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgY2FzZSAxMzpcbiAgICAgIHBhcmVudCA9IGUudGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICBpZihwYXJlbnQuaWQgPT0gJ3NpZ25pbi1mb3JtJykge1xuICAgICAgICB1c2VyLmxvZ2luVXNlcigpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIHNob3dNZXNzYWdlKG1lc3NhZ2Upe1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXJyb3ItbWVzc2FnZScpLmlubmVySFRNTCA9IG1lc3NhZ2U7XG4gIHZhciBlcnJvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlcnJvcicpO1xuICBlcnJvci5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xuICBlcnJvci5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpeyBlcnJvci5zdHlsZS5vcGFjaXR5ID0gMDt9LCA3MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGVycm9yLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IH0sIDEyMDApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hvdyA6IHNob3dNZXNzYWdlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBwcmVwR2V0KHVybCkge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCk7XG4gIHJlcXVlc3Quc2VuZCgpO1xuICByZXR1cm4gcmVxdWVzdDtcbn1cblxuZnVuY3Rpb24gcHJlcFBvc3QodXJsKSB7XG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG4gIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKTtcbiAgcmV0dXJuIHJlcXVlc3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgIDogcHJlcEdldCxcbiAgcG9zdCA6IHByZXBQb3N0XG59XG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IHJlcSAgICAgID0gcmVxdWlyZSgnLi9yZXF1ZXN0LmpzJyk7XG5jb25zdCBtZXNzYWdlICA9IHJlcXVpcmUoJy4vbWVzc2FnZS5qcycpO1xuXG5mdW5jdGlvbiBzdWJtaXQoKSB7XG4gIHZhciBlbWFpbCAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmV2aWV3LWVtYWlsJyAgICApLnZhbHVlO1xuICB2YXIgZmlyc3RuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jldmlldy1maXJzdG5hbWUnKS52YWx1ZTtcbiAgdmFyIGxhc3RuYW1lICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXZpZXctbGFzdG5hbWUnICkudmFsdWU7XG4gIHZhciByZXZpZXcgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmV2aWV3LWVudHJ5JyAgICApLnZhbHVlO1xuXG4gIHZhciBwYXJhbXMgPSBgZW1haWw9JHtlbWFpbH0mZmlyc3RuYW1lPSR7Zmlyc3RuYW1lfSZsYXN0bmFtZT0ke2xhc3RuYW1lfSZyZXZpZXc9JHtyZXZpZXd9YFxuICB2YXIgdXJsID0gJy9yZXZpZXcnO1xuICB2YXIgcmVxdWVzdCA9IHJlcS5wb3N0KHVybCk7XG4gIHJlcXVlc3Quc2VuZChwYXJhbXMpXG5cbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgIH1cbiAgfVxuXG59XG5cbmZ1bmN0aW9uIHBvcHVsYXRlKCkge1xuICB2YXIgcmV2aWV3c0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmV2aWV3cy1jb250YWluZXInKTtcbiAgdmFyIHJlcXVlc3QgPSByZXEuZ2V0KCcvbGF0ZXN0cmV2aWV3cycpO1xuICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgdmFyIHJldmlld3MgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHJldmlld3MubGVuZ3RoOyBpICsrKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmV2aWV3c1wiPlxuICAgICAgICAgICAgPGltZyBzcmM9XCIuL2ltZy9kZWZhdWx0LnN2Z1wiIGFsdD1cIlwiPlxuICAgICAgICAgICAgPGgyPiR7cmV2aWV3c1tpXS5uYW1lfTwvaDI+XG4gICAgICAgICAgICA8cD4ke3Jldmlld3NbaV0ucmV2aWV3fTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYDtcbiAgICAgICAgcmV2aWV3c0VsZW1lbnQuaW5uZXJIVE1MICs9IHRlbXBsYXRlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3VibWl0IDogc3VibWl0LFxuICBwb3B1bGF0ZSA6IHBvcHVsYXRlXG59XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCB2YWxpZGF0ZSA9IHJlcXVpcmUoJy4vdmFsaWRhdGlvbi5qcycpO1xuY29uc3QgcmVxICAgICAgPSByZXF1aXJlKCcuL3JlcXVlc3QuanMnKTtcbmNvbnN0IG1lc3NhZ2UgID0gcmVxdWlyZSgnLi9tZXNzYWdlLmpzJyk7XG5cbmZ1bmN0aW9uIHNlYXJjaEF2YWlsKCkge1xuICB2YXIgdHJpcExpc3QgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RyaXBMaXN0Jyk7XG4gIHZhciBkYXRlICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYXRlLWlucHV0JykudmFsdWU7XG4gIHZhciBzZWF0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWF0cy1pbnB1dCcpLnZhbHVlO1xuICB2YXIgdXJsICAgPSAnL3NlYXJjaC8/ZGF0ZT0nICsgZGF0ZSArICcmc2VhdHM9JyArICBzZWF0cztcbiAgdmFyIHJlcXVlc3QgPSByZXEuZ2V0KHVybCk7XG4gIHZhciB0cmlwcyA9IFtdO1xuXG4gIHZhciByZWdleERhdGUgPSAvWzAtOV17NH0tWzAtOV17Mn0tWzAtOV17Mn0vO1xuICB2YXIgcmVnZXhTZWF0ID0gL1swLTldezEsMn0vO1xuICB2YWxpZGF0ZS5zZWFyY2goZGF0ZSwgc2VhdHMsIGZ1bmN0aW9uKGVycikge1xuICAgIGlmIChlcnIpIG1lc3NhZ2Uuc2hvdyhlcnIpO1xuICAgIGlmKCFlcnIpIHtcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgICAgIHRyaXBzID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09IFwibm90cmlwXCIpIHtcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2hvdyhcIllvdSBtdXN0IGNob29zZSBhIHRyaXAgZmlyc3RcIilcbiAgICAgICAgICB9XG4gICAgICAgICAgdHJpcExpc3QuaW5uZXJIVE1MID0gJzxvcHRpb24gdmFsdWU9XCJlbXB0eVwiPjwvb3B0aW9uPic7XG4gICAgICAgICAgaWYodHJpcHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2hvdyhcIlRoZXJlIGFyZSBubyB0cmlwcyBhdmFpbGFibGUgd2l0aGluIHRoZXNlIHZhbHVlc1wiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRyaXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHRyaXBMaXN0LmlubmVySFRNTCArPSBcIjxvcHRpb24gdmFsdWU9J1wiKyB0cmlwc1tpXS50cmlwSWQrIFwiIFwiICsgc2VhdHMgK1wiJz5cIiArIHRyaXBzW2ldLnRpbWUgK1wiPC9vcHRpb24+XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmlwTGlzdC52YWx1ZSA9IHRyaXBzWzBdLnRyaXBJZCArIFwiIFwiICsgc2VhdHM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gbWFrZUJvb2tpbmcoKSB7XG4gIHZhciB0cmlwID0gdHJpcExpc3QudmFsdWUuc3BsaXQoJyAnKTtcbiAgdmFyIHRyaXBJZCA9IHRyaXBbMF07XG4gIHZhciBzZWF0cyAgPSB0cmlwWzFdO1xuICB2YXIgcmVxdWVzdCA9IHJlcS5nZXQoXCIvYm9vaz90cmlwaWQ9XCIrdHJpcElkK1wiJnNlYXRzPVwiK3NlYXRzKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIG1lc3NhZ2Uuc2hvdyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICB9XG4gIH1cbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhdmFpbGFibGUgOiBzZWFyY2hBdmFpbCxcbiAgY3JlYXRlICAgIDogbWFrZUJvb2tpbmdcbn1cbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IG1lc3NhZ2UgID0gcmVxdWlyZSgnLi9tZXNzYWdlLmpzJyk7XG5jb25zdCByZXEgICAgICA9IHJlcXVpcmUoJy4vcmVxdWVzdC5qcycpO1xuY29uc3QgdmFsaWRhdGUgPSByZXF1aXJlKCcuL3ZhbGlkYXRpb24uanMnKTtcbmNvbnN0IHZpZXdzICAgID0gcmVxdWlyZSgnLi92aWV3cy5qcycpO1xuXG5mdW5jdGlvbiByZXNldFBhc3N3b3JkKCkge1xuICB2YXIgZW1haWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQtZW1haWwnKS52YWx1ZTtcbiAgdmFyIHBhcmFtcyA9ICdlbWFpbD0nK2VtYWlsO1xuICB2YXIgdXJsICAgPSAnL3Jlc2V0JztcbiAgdmFyIHJlcXVlc3QgPSByZXEucG9zdCh1cmwpO1xuICByZXF1ZXN0LnNlbmQocGFyYW1zKTtcblxuICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgaWYocmVxdWVzdC5yZXNwb25zZSA9PSAnRW1haWwgc2VudCcpIHtcbiAgICAgICAgdmlld3Muc2lnbmluKCk7XG4gICAgICB9XG4gICAgICBtZXNzYWdlLnNob3cocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG5ld1Bhc3N3b3JkKCkge1xuICB2YXIgcGFzc3dvcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3LXBhc3N3b3JkJykudmFsdWU7XG4gIHZhciBlbWFpbCAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoaWRkZW4tZW1haWwnKS52YWx1ZTtcbiAgdmFyIHRva2VuICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGRlbi10b2tlbicpLnZhbHVlO1xuICB2YXIgcGFyYW1zICAgPSBcInBhc3N3b3JkPVwiK3Bhc3N3b3JkK1wiJmVtYWlsPVwiK2VtYWlsK1wiJnRva2VuPVwiK3Rva2VuO1xuICB2YXIgdXJsICAgICAgPSBcIi9uZXdwYXNzd29yZFwiO1xuICB2YXIgcmVxdWVzdCAgPSByZXEucG9zdCh1cmwpO1xuICByZXF1ZXN0LnNlbmQocGFyYW1zKTtcblxuICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgbWVzc2FnZS5zaG93KHJlcXVlc3QucmVzcG9uc2UpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBsb2dpblVzZXIoKSB7XG4gIHZhciB1c2VybmFtZSAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlcm5hbWUnKS52YWx1ZTtcbiAgdmFyIHBhc3N3b3JkICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXNzd29yZCcpLnZhbHVlO1xuXG4gIHZhbGlkYXRlLmxvZ2luKHVzZXJuYW1lLCBwYXNzd29yZCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYoZXJyKSBtZXNzYWdlLnNob3coZXJyKTtcbiAgICBpZighZXJyKSB7XG4gICAgICB2YXIgcGFyYW1zICAgID0gXCJ1c2VybmFtZT1cIit1c2VybmFtZStcIiZwYXNzd29yZD1cIitwYXNzd29yZDtcbiAgICAgIHZhciB1cmwgICAgICAgPSBcIi9sb2dpblwiO1xuICAgICAgdmFyIHJlcXVlc3QgICA9IHJlcS5wb3N0KHVybCk7XG4gICAgICByZXF1ZXN0LnNlbmQocGFyYW1zKTtcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgICAgIG1lc3NhZ2Uuc2hvdyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09ICdTdWNjZXNzJykge1xuICAgICAgICAgICAgdmlld3Muc2lnbmVkSW4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZWdpc3Rlck5ld1VzZXIoKSB7XG4gIHZhciB1c2VybmFtZSAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItdXNlcm5hbWUnKS52YWx1ZTtcbiAgdmFyIHBhc3N3b3JkICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1wYXNzd29yZCcpLnZhbHVlO1xuICB2YXIgcGFzc3dvcmQyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXBhc3N3b3JkMicpLnZhbHVlO1xuICB2YXIgZW1haWwgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWVtYWlsJykudmFsdWU7XG5cbiAgdmFsaWRhdGUucmVnaXN0ZXIodXNlcm5hbWUsIHBhc3N3b3JkLCBwYXNzd29yZDIsIGVtYWlsLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZihlcnIpIG1lc3NhZ2Uuc2hvdyhlcnIpO1xuICAgIGlmKCFlcnIpIHtcbiAgICAgIHZhciBwYXJhbXMgICAgPSBcInVzZXJuYW1lPVwiK3VzZXJuYW1lK1wiJnBhc3N3b3JkPVwiK3Bhc3N3b3JkK1wiJmVtYWlsPVwiK2VtYWlsO1xuICAgICAgdmFyIHVybCAgICAgICA9IFwiL3JlZ2lzdGVyXCI7XG4gICAgICB2YXIgcmVxdWVzdCAgID0gcmVxLnBvc3QodXJsKTtcbiAgICAgIHJlcXVlc3Quc2VuZChwYXJhbXMpO1xuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICAgICAgaWYocmVxdWVzdC5yZXNwb25zZSA9PSAnc3VjY2VzcycpIHtcbiAgICAgICAgICAgIG1lc3NhZ2Uuc2hvdygnUmVnaXN0ZXJlZCcpO1xuICAgICAgICAgICAgc2VuZFZlcmlmaWNhdGlvbihlbWFpbCk7XG4gICAgICAgICAgICB2aWV3cy5zaWduaW4oKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZS5zaG93KHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNlbmRWZXJpZmljYXRpb24oZW1haWwpIHtcbiAgY29uc29sZS5sb2coJ1ZlcmlmeWluZycpO1xuICB2YXIgcGFyYW1zICAgID0gXCJlbWFpbD1cIitlbWFpbDtcbiAgdmFyIHVybCAgICAgICA9IFwiL3ZlcmlmeVwiO1xuICB2YXIgcmVxdWVzdCAgID0gcmVxLnBvc3QodXJsKTtcbiAgcmVxdWVzdC5zZW5kKHBhcmFtcyk7XG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09ICdTdWNjZXNzJykge1xuICAgICAgICBtZXNzYWdlLnNob3coJ1ZlcmlmaWNhdGlvbiBlbWFpbCBzZW50Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZXNzYWdlLnNob3cocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ091dCgpIHtcbiAgdmFyIHVybCA9IFwiL2xvZ291dFwiO1xuICB2YXIgcmVxdWVzdCA9IHJlcS5nZXQodXJsKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNlbmRWZXJpZmljYXRpb24gOiBzZW5kVmVyaWZpY2F0aW9uLFxuICByZWdpc3Rlck5ld1VzZXIgIDogcmVnaXN0ZXJOZXdVc2VyLFxuICBsb2dpblVzZXIgICAgICAgIDogbG9naW5Vc2VyLFxuICBuZXdQYXNzd29yZCAgICAgIDogbmV3UGFzc3dvcmQsXG4gIHJlc2V0UGFzc3dvcmQgICAgOiByZXNldFBhc3N3b3JkLFxuICBsb2dPdXQgICAgICAgICAgIDogbG9nT3V0XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHZhbGlkTG9naW4odXNlcm5hbWUsIHBhc3N3b3JkLCBjYWxsYmFjaykge1xuICBpZighcGFzc3dvcmQgfHwgIXVzZXJuYW1lKSB7XG4gICAgY2FsbGJhY2soJ0FsbCBmaWVsZCBtdXN0IGJlIGZpbGxlZCcpO1xuICB9XG4gIC8vIGlmKHBhc3N3b3JkLmxlbmd0aDw4KSB7XG4gICAgLy8gY2FsbGJhY2soJ0FsbCBwYXNzd29yZHMgYXJlIGF0bGVhc3QgOCBjaGFyYWN0ZXJzJylcbiAgLy8gfVxuICBlbHNlIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkUmVnaXN0ZXIodXNlcm5hbWUsIHBhc3N3b3JkLCBwYXNzd29yZDIsIGVtYWlsLCBjYWxsYmFjaykge1xuICB2YXIgcmVnZXggPSAvXltcXHddKiQvO1xuICBpZighcGFzc3dvcmQgfHwgIXVzZXJuYW1lIHx8ICFwYXNzd29yZDIgfHwgIWVtYWlsKSB7XG4gICAgY2FsbGJhY2soJ0FsbCBmaWVsZHMgbXVzdCBiZSBmaWxsZWQnKTtcbiAgfVxuICAvLyBlbHNlIGlmIChwYXNzd29yZC5sZW5ndGggPCA4KSB7XG4gICAgLy8gY2FsbGJhY2soJ1Bhc3N3b3JkIG11c3QgYmUgYXRsZWFzdCA4IGNoYXJhY3RlcnMnKTtcbiAgLy8gfVxuICBlbHNlIGlmKCEocGFzc3dvcmQgPT09IHBhc3N3b3JkMikpIHtcbiAgICBjYWxsYmFjaygnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCcpO1xuICB9XG4gIGVsc2UgaWYoISh1c2VybmFtZS5tYXRjaChyZWdleCkpIHx8ICEocGFzc3dvcmQubWF0Y2gocmVnZXgpKSkge1xuICAgIGNhbGxiYWNrKCdVc2VybmFtZSBhbmQgcGFzc3dvcmQgbXVzdCBiZSBjb25zaXN0IG9mIG9ubHkgbGV0dGVycyBhbmQgbnVtYmVycycpO1xuICB9XG4gIGVsc2Uge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRTZWFyY2goZGF0ZSwgc2VhdHMsIGNhbGxiYWNrKSB7XG4gIGlmKCFkYXRlIHx8ICEgc2VhdHMpIHtcbiAgICBjYWxsYmFjaygnQWxsIGZpZWxkIG11c3QgYmUgZmlsbGVkJyk7XG4gIH1cbiAgY2FsbGJhY2soKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvZ2luIDogdmFsaWRMb2dpbixcbiAgcmVnaXN0ZXIgOiB2YWxpZFJlZ2lzdGVyLFxuICBzZWFyY2ggOiB2YWxpZFNlYXJjaFxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgcmVxID0gcmVxdWlyZSgnLi9yZXF1ZXN0LmpzJyk7XG5jb25zdCBtZXNzYWdlID0gcmVxdWlyZSgnLi9tZXNzYWdlLmpzJyk7XG5cbmZ1bmN0aW9uIHNpZ25JblZpZXcoKSB7XG4gIHZhciBmb3JtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xvZ2luLWZvcm0nKTtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgZm9yKHZhciBpID0gMDsgaSA8IGZvcm1zLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9ybXNbaV0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgfVxuICBzaWduSW5Gb3JtLnN0eWxlLmRpc3BsYXkgPSAnZ3JpZCc7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyVmlldygpIHtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgdmFyIHJlZ2lzdGVyRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1mb3JtJyk7XG4gIHNpZ25JbkZvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcmVnaXN0ZXJGb3JtLnN0eWxlLmRpc3BsYXkgPSAnZ3JpZCc7XG59XG5cbmZ1bmN0aW9uIGJvb2tpbmdWaWV3KCkge1xuICB2YXIgYm9va2luZ0Zvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9va2luZy1mb3JtJyk7XG4gIHZhciBzaWduSW5Gb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ25pbi1mb3JtJyk7XG4gIHNpZ25JbkZvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgYm9va2luZ0Zvcm0uc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbn1cblxuZnVuY3Rpb24gbG9zdFZpZXcoKSB7XG4gIHZhciBsb3N0Rm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb3N0LWZvcm0nKTtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBsb3N0Rm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xufVxuXG5mdW5jdGlvbiBzaWduZWRJblZpZXcoKSB7XG4gIHZhciBib29raW5nRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib29raW5nLWZvcm0nKTtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgdmFyIGxvZ091dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2ctb3V0Jyk7XG5cbiAgaWYoc2lnbkluRm9ybSkge1xuICAgIHNpZ25JbkZvcm0uc3R5bGUuZGlzcGxheSAgPSAnbm9uZSc7XG4gICAgYm9va2luZ0Zvcm0uc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbiAgfVxuICBsb2dPdXQuc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbn1cblxuZnVuY3Rpb24gc2lnbmVkT3V0VmlldygpIHtcbiAgdmFyIGJvb2tpbmdGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jvb2tpbmctZm9ybScpO1xuICB2YXIgc2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4tZm9ybScpO1xuICB2YXIgbG9nT3V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZy1vdXQnKTtcblxuICBpZihzaWduSW5Gb3JtKSB7XG4gICAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ICA9ICdncmlkJztcbiAgICBib29raW5nRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB9XG4gIGxvZ091dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xufVxuXG5mdW5jdGlvbiBwb3B1bGF0ZUJvb2tpbmdzKCkge1xuICB2YXIgYm9va2luZ3NFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jvb2tpbmdzJyk7XG4gIHZhciByZXF1ZXN0ID0gcmVxLmdldCgnL2Jvb2tpbmdzJyk7XG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICB2YXIgYm9va2luZ3MgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgaWYoYm9va2luZ3MubGVuZ3RoID09IDApIHtcbiAgICAgICAgbWVzc2FnZS5zaG93KCdZb3UgaGF2ZSBubyBib29raW5ncycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGJvb2tpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHBhcnNlZEJvb2tpbmcgPSBKU09OLnBhcnNlKGJvb2tpbmdzW2ldKTtcbiAgICAgICAgICB2YXIgYm9va2luZ051bWJlciA9IHBhcnNlZEJvb2tpbmcuYm9va2luZ0lkO1xuICAgICAgICAgIGlmKHBhcnNlZEJvb2tpbmcuYm9hdElkID09IDEpIHtcbiAgICAgICAgICAgIHZhciBib2F0ID0gJ0lzbGFuZGVyJ1xuICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VkQm9va2luZy5ib2F0SWQgPT0gMikge1xuICAgICAgICAgICAgdmFyIGJvYXQgPSAnVmlraW5nJ1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgdGltZSA9IHBhcnNlZEJvb2tpbmcudGltZTtcbiAgICAgICAgICB2YXIgZGF0ZSA9IHBhcnNlZEJvb2tpbmcuZGF0ZTtcbiAgICAgICAgICB2YXIgcGFzc2VuZ2VycyA9IHBhcnNlZEJvb2tpbmcuc2VhdHM7XG4gICAgICAgICAgdmFyIHRlbXBsYXRlID0gYFxuICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPVwiYm9va2luZ1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJvb2tpbmctbnVtYmVyXCI+IEJvb2tpbmcgTnVtYmVyOiAke2Jvb2tpbmdOdW1iZXJ9IDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQgYm9hdFwiPiR7Ym9hdH08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50IHRpbWVcIj5UaW1lOiAke3RpbWV9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBkYXRlXCI+RGF0ZTogJHtkYXRlfTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQgc2VhdHNcIj5TZWF0czogJHtwYXNzZW5nZXJzfTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQgaW5mbyB3aWRlXCI+QWxsIHRpY2tldHMgYXJlIGF2YWlsYWJsZSBmb3IgcmVmdW5kIG9yIGNhbmNlbGxhdGlvbiB1cCB0byAyNCBob3VycyBwcmlvciB0byBkZXBhcnR1cmUsIHBsZWFzZSBjb250YWN0IHVzIHZpYSBwaG9uZSBvciBlbWFpbDwvZGl2PlxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICBgXG4gICAgICAgICAgYm9va2luZ3NFbGVtZW50LmlubmVySFRNTCArPSB0ZW1wbGF0ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkTW9yZShlKSB7XG4gIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcbiAgdmFyIHNwYW4gPSB0YXJnZXQucHJldmlvdXNFbGVtZW50U2libGluZy5maXJzdEVsZW1lbnRDaGlsZDtcbiAgdmFyIG1haW5Cb3ggPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgdmFyIGltZyA9IHRhcmdldC5wYXJlbnRFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICB2YXIgY3MgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShtYWluQm94LG51bGwpO1xuICB2YXIgbWFpbkJveEdyaWRDb2x1bW4gPSBjcy5nZXRQcm9wZXJ0eVZhbHVlKCdncmlkLWNvbHVtbicpO1xuXG4gIGlmKCEoc3Bhbi5zdHlsZS5kaXNwbGF5KSB8fCBzcGFuLnN0eWxlLmRpc3BsYXkgPT0gJ25vbmUnKSB7XG4gICAgICBzcGFuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcbiAgICAgIHRhcmdldC5pbm5lckhUTUwgPSAnUmVhZCBMZXNzJztcbiAgICAgIGNvbnNvbGUubG9nKG1haW5Cb3hHcmlkQ29sdW1uKTtcbiAgICAgIGlmKG1haW5Cb3hHcmlkQ29sdW1uID09ICdzcGFuIDEgLyBhdXRvJykge1xuICAgICAgICBtYWluQm94LnN0eWxlLmdyaWRDb2x1bW4gPSAnc3BhbiAyIC8gYXV0byc7XG4gICAgICB9XG4gICAgICB2YXIgc3JjID0gaW1nLnNyYztcbiAgICAgIHZhciBzcGxpdHRlZCA9IHNyYy5zcGxpdCgnLicpO1xuICAgICAgc3BsaXR0ZWQgPSBzcGxpdHRlZFswXSArICdfb3JpZy5qcGcnO1xuICAgICAgaW1nLnNyYyA9IHNwbGl0dGVkO1xuICB9IGVsc2Uge1xuICAgIHNwYW4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0YXJnZXQuaW5uZXJIVE1MID0gJ1JlYWQgTW9yZSc7XG4gICAgaWYobWFpbkJveEdyaWRDb2x1bW4gPT0gJ3NwYW4gMiAvIGF1dG8nKSB7XG4gICAgICBtYWluQm94LnN0eWxlLmdyaWRDb2x1bW4gPSAnc3BhbiAxIC8gYXV0byc7XG4gICAgfVxuICAgIHZhciBzcmMgPSBpbWcuc3JjO1xuICAgIHZhciBzcGxpdHRlZCA9IHNyYy5zcGxpdCgnXycpO1xuICAgIHNwbGl0dGVkID0gc3BsaXR0ZWRbMF0gKyAnLnBuZyc7XG4gICAgaW1nLnNyYyA9IHNwbGl0dGVkO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb3N0IDogbG9zdFZpZXcsXG4gIGJvb2tpbmcgOiBib29raW5nVmlldyxcbiAgc2lnbmluIDogc2lnbkluVmlldyxcbiAgcmVnaXN0ZXIgOiByZWdpc3RlclZpZXcsXG4gIHNpZ25lZEluIDogc2lnbmVkSW5WaWV3LFxuICBwb3B1bGF0ZUJvb2tpbmdzIDogcG9wdWxhdGVCb29raW5ncyxcbiAgcmVhZE1vcmUgOiByZWFkTW9yZSxcbiAgc2lnbk91dCA6IHNpZ25lZE91dFZpZXdcbn1cbiJdfQ==
