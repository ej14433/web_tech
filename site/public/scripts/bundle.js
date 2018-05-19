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
            <img src="./img/default-user.png" alt="">
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYWluLmpzIiwibWVzc2FnZS5qcyIsInJlcXVlc3QuanMiLCJyZXZpZXcuanMiLCJzZWFyY2guanMiLCJ1c2VyLmpzIiwidmFsaWRhdGlvbi5qcyIsInZpZXdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHZhbGlkYXRlID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uLmpzJyk7XG5jb25zdCB2aWV3cyAgICA9IHJlcXVpcmUoJy4vdmlld3MuanMnICAgICApO1xuY29uc3QgcmVxICAgICAgPSByZXF1aXJlKCcuL3JlcXVlc3QuanMnICAgKTtcbmNvbnN0IHVzZXIgICAgID0gcmVxdWlyZSgnLi91c2VyLmpzJyAgICAgICk7XG5jb25zdCBtZXNzYWdlICA9IHJlcXVpcmUoJy4vbWVzc2FnZS5qcycgICApO1xuY29uc3Qgc2VhcmNoanMgPSByZXF1aXJlKCcuL3NlYXJjaC5qcycgICAgKTtcbmNvbnN0IHJldmlldyAgID0gcmVxdWlyZSgnLi9yZXZpZXcuanMnICAgICk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKGUpIHtcblxuICB2YXIgcmVxdWVzdCA9IHJlcS5nZXQoJy9pc3NpZ25lZGluJyk7XG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ3llcycpIHtcbiAgICAgICAgdmlld3Muc2lnbmVkSW4oKTtcbiAgICAgIH1cbiAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ25vJykge1xuICAgICAgICB2aWV3cy5zaWduT3V0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGJvb2tpbmdzICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib29raW5ncycgICAgICAgICAgICAgICk7XG4gIHZhciByZWdpc3RlciAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXInICAgICAgICAgICAgICApO1xuICB2YXIgc2VhcmNoICAgICAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaCcgICAgICAgICAgICAgICAgKTtcbiAgdmFyIHNpZ25pbiAgICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4nICAgICAgICAgICAgICAgICk7XG4gIHZhciByZWdpc3RlckJ1dHRvbiAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItYnV0dG9uJyAgICAgICApO1xuICB2YXIgbG9naW5CdXR0b24gICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLWJ1dHRvbicgICAgICAgICAgKTtcbiAgdmFyIGxvc3QgICAgICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb3N0JyAgICAgICAgICAgICAgICAgICk7XG4gIHZhciBsb3N0U2lnbkluICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9zdC1zaWduaW4nICAgICAgICAgICApO1xuICB2YXIgcmVzZXQgICAgICAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0LXBhc3N3b3JkJyAgICAgICAgKTtcbiAgdmFyIGZpbmlzaFJlc2V0ICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldC1hY2NvdW50LXBhc3N3b3JkJyk7XG4gIHZhciBib29rQnV0dG9uICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9vay10cmlwJyAgICAgICAgICAgICApO1xuICB2YXIgbXlCb29raW5ncyAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215LWJvb2tpbmdzJyAgICAgICAgICAgKTtcbiAgdmFyIHJlYWRNb3JlcyAgICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5yZWFkLW1vcmUtYnV0dG9uJyAgICk7XG4gIHZhciBsb2dPdXQgICAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9nLW91dCcgICAgICAgICAgICAgICApO1xuICB2YXIgZm9ybXMgICAgICAgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnZm9ybScgICAgICAgICAgICAgICAgKTtcbiAgdmFyIHJldmlld0J1dHRvbiAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXZpZXctc3VibWl0JyAgICAgICAgICk7XG4gIHZhciByZXZpZXdzQ29udGFpbnRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZXZpZXdzLWNvbnRhaW5lcicgICApO1xuXG4gIGlmKGJvb2tpbmdzKSB7XG4gICAgdmlld3MucG9wdWxhdGVCb29raW5ncygpO1xuICB9XG5cbiAgaWYocmV2aWV3QnV0dG9uKSB7XG4gICAgcmV2aWV3QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICAnY2xpY2snLCByZXZpZXcuc3VibWl0ICAgICAgICk7XG4gIH1cblxuICBsb2dPdXQuYWRkRXZlbnRMaXN0ZW5lciggICAgICAgICAgJ2NsaWNrJywgdXNlci5sb2dPdXQgICAgICAgICApO1xuXG4gIGlmKHNlYXJjaCkge1xuICAgIHJlZ2lzdGVyLmFkZEV2ZW50TGlzdGVuZXIoICAgICAgJ2NsaWNrJywgdmlld3MucmVnaXN0ZXIgICAgICApO1xuICAgIGxvZ2luQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICAgJ2NsaWNrJywgdXNlci5sb2dpblVzZXIgICAgICApO1xuICAgIHNpZ25pbi5hZGRFdmVudExpc3RlbmVyKCAgICAgICAgJ2NsaWNrJywgdmlld3Muc2lnbmluICAgICAgICApO1xuICAgIHJlZ2lzdGVyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdXNlci5yZWdpc3Rlck5ld1VzZXIpO1xuICAgIGxvc3QuYWRkRXZlbnRMaXN0ZW5lciggICAgICAgICAgJ2NsaWNrJywgdmlld3MubG9zdCAgICAgICAgICApO1xuICAgIGxvc3RTaWduSW4uYWRkRXZlbnRMaXN0ZW5lciggICAgJ2NsaWNrJywgdmlld3Muc2lnbmluICAgICAgICApO1xuICAgIHNlYXJjaC5hZGRFdmVudExpc3RlbmVyKCAgICAgICAgJ2NsaWNrJywgc2VhcmNoanMuYXZhaWxhYmxlICApO1xuICAgIHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoICAgICAgICAgJ2NsaWNrJywgdXNlci5yZXNldFBhc3N3b3JkICApO1xuICAgIGJvb2tCdXR0b24uYWRkRXZlbnRMaXN0ZW5lciggICAgJ2NsaWNrJywgc2VhcmNoanMuY3JlYXRlICAgICApO1xuICAgIHJlYWRNb3Jlcy5mb3JFYWNoKHJlYWRNb3JlID0+IHJlYWRNb3JlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdmlld3MucmVhZE1vcmUpKTtcbiAgICBmb3Jtcy5mb3JFYWNoKCAgICAgICAgZm9ybSA9PiBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoICAgICdrZXl1cCcsIGtleVByZXNzICAgICAgKSk7XG4gICAgcmV2aWV3LnBvcHVsYXRlKCk7XG5cbiAgfVxuXG4gIGlmKGZpbmlzaFJlc2V0KSB7XG4gICAgZmluaXNoUmVzZXQuYWRkRXZlbnRMaXN0ZW5lciggICAnY2xpY2snLCB1c2VyLm5ld1Bhc3N3b3JkKTtcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIGtleVByZXNzKGUpe1xuICBzd2l0Y2goZS5rZXlDb2RlKSB7XG4gICAgY2FzZSAxMzpcbiAgICAgIHBhcmVudCA9IGUudGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgICBpZihwYXJlbnQuaWQgPT0gJ3NpZ25pbi1mb3JtJykge1xuICAgICAgICB1c2VyLmxvZ2luVXNlcigpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIHNob3dNZXNzYWdlKG1lc3NhZ2Upe1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXJyb3ItbWVzc2FnZScpLmlubmVySFRNTCA9IG1lc3NhZ2U7XG4gIHZhciBlcnJvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlcnJvcicpO1xuICBlcnJvci5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xuICBlcnJvci5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpeyBlcnJvci5zdHlsZS5vcGFjaXR5ID0gMDt9LCA3MDApO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IGVycm9yLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IH0sIDEyMDApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2hvdyA6IHNob3dNZXNzYWdlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBwcmVwR2V0KHVybCkge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCk7XG4gIHJlcXVlc3Quc2VuZCgpO1xuICByZXR1cm4gcmVxdWVzdDtcbn1cblxuZnVuY3Rpb24gcHJlcFBvc3QodXJsKSB7XG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG4gIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKTtcbiAgcmV0dXJuIHJlcXVlc3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQgIDogcHJlcEdldCxcbiAgcG9zdCA6IHByZXBQb3N0XG59XG4iLCIndXNlIHN0cmljdCdcbmNvbnN0IHJlcSAgICAgID0gcmVxdWlyZSgnLi9yZXF1ZXN0LmpzJyk7XG5jb25zdCBtZXNzYWdlICA9IHJlcXVpcmUoJy4vbWVzc2FnZS5qcycpO1xuXG5mdW5jdGlvbiBzdWJtaXQoKSB7XG4gIHZhciBlbWFpbCAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmV2aWV3LWVtYWlsJyAgICApLnZhbHVlO1xuICB2YXIgZmlyc3RuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jldmlldy1maXJzdG5hbWUnKS52YWx1ZTtcbiAgdmFyIGxhc3RuYW1lICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXZpZXctbGFzdG5hbWUnICkudmFsdWU7XG4gIHZhciByZXZpZXcgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmV2aWV3LWVudHJ5JyAgICApLnZhbHVlO1xuXG4gIHZhciBwYXJhbXMgPSBgZW1haWw9JHtlbWFpbH0mZmlyc3RuYW1lPSR7Zmlyc3RuYW1lfSZsYXN0bmFtZT0ke2xhc3RuYW1lfSZyZXZpZXc9JHtyZXZpZXd9YFxuICB2YXIgdXJsID0gJy9yZXZpZXcnO1xuICB2YXIgcmVxdWVzdCA9IHJlcS5wb3N0KHVybCk7XG4gIHJlcXVlc3Quc2VuZChwYXJhbXMpXG5cbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgIH1cbiAgfVxuXG59XG5cbmZ1bmN0aW9uIHBvcHVsYXRlKCkge1xuICB2YXIgcmV2aWV3c0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmV2aWV3cy1jb250YWluZXInKTtcbiAgdmFyIHJlcXVlc3QgPSByZXEuZ2V0KCcvbGF0ZXN0cmV2aWV3cycpO1xuICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgdmFyIHJldmlld3MgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHJldmlld3MubGVuZ3RoOyBpICsrKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicmV2aWV3c1wiPlxuICAgICAgICAgICAgPGltZyBzcmM9XCIuL2ltZy9kZWZhdWx0LXVzZXIucG5nXCIgYWx0PVwiXCI+XG4gICAgICAgICAgICA8aDI+JHtyZXZpZXdzW2ldLm5hbWV9PC9oMj5cbiAgICAgICAgICAgIDxwPiR7cmV2aWV3c1tpXS5yZXZpZXd9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgO1xuICAgICAgICByZXZpZXdzRWxlbWVudC5pbm5lckhUTUwgKz0gdGVtcGxhdGU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzdWJtaXQgOiBzdWJtaXQsXG4gIHBvcHVsYXRlIDogcG9wdWxhdGVcbn1cbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHZhbGlkYXRlID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uLmpzJyk7XG5jb25zdCByZXEgICAgICA9IHJlcXVpcmUoJy4vcmVxdWVzdC5qcycpO1xuY29uc3QgbWVzc2FnZSAgPSByZXF1aXJlKCcuL21lc3NhZ2UuanMnKTtcblxuZnVuY3Rpb24gc2VhcmNoQXZhaWwoKSB7XG4gIHZhciB0cmlwTGlzdCAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHJpcExpc3QnKTtcbiAgdmFyIGRhdGUgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RhdGUtaW5wdXQnKS52YWx1ZTtcbiAgdmFyIHNlYXRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXRzLWlucHV0JykudmFsdWU7XG4gIHZhciB1cmwgICA9ICcvc2VhcmNoLz9kYXRlPScgKyBkYXRlICsgJyZzZWF0cz0nICsgIHNlYXRzO1xuICB2YXIgcmVxdWVzdCA9IHJlcS5nZXQodXJsKTtcbiAgdmFyIHRyaXBzID0gW107XG5cbiAgdmFyIHJlZ2V4RGF0ZSA9IC9bMC05XXs0fS1bMC05XXsyfS1bMC05XXsyfS87XG4gIHZhciByZWdleFNlYXQgPSAvWzAtOV17MSwyfS87XG4gIHZhbGlkYXRlLnNlYXJjaChkYXRlLCBzZWF0cywgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKGVycikgbWVzc2FnZS5zaG93KGVycik7XG4gICAgaWYoIWVycikge1xuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICAgICAgdHJpcHMgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gXCJub3RyaXBcIikge1xuICAgICAgICAgICAgbWVzc2FnZS5zaG93KFwiWW91IG11c3QgY2hvb3NlIGEgdHJpcCBmaXJzdFwiKVxuICAgICAgICAgIH1cbiAgICAgICAgICB0cmlwTGlzdC5pbm5lckhUTUwgPSAnPG9wdGlvbiB2YWx1ZT1cImVtcHR5XCI+PC9vcHRpb24+JztcbiAgICAgICAgICBpZih0cmlwcy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgbWVzc2FnZS5zaG93KFwiVGhlcmUgYXJlIG5vIHRyaXBzIGF2YWlsYWJsZSB3aXRoaW4gdGhlc2UgdmFsdWVzXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdHJpcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdHJpcExpc3QuaW5uZXJIVE1MICs9IFwiPG9wdGlvbiB2YWx1ZT0nXCIrIHRyaXBzW2ldLnRyaXBJZCsgXCIgXCIgKyBzZWF0cyArXCInPlwiICsgdHJpcHNbaV0udGltZSArXCI8L29wdGlvbj5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRyaXBMaXN0LnZhbHVlID0gdHJpcHNbMF0udHJpcElkICsgXCIgXCIgKyBzZWF0cztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBtYWtlQm9va2luZygpIHtcbiAgdmFyIHRyaXAgPSB0cmlwTGlzdC52YWx1ZS5zcGxpdCgnICcpO1xuICB2YXIgdHJpcElkID0gdHJpcFswXTtcbiAgdmFyIHNlYXRzICA9IHRyaXBbMV07XG4gIHZhciByZXF1ZXN0ID0gcmVxLmdldChcIi9ib29rP3RyaXBpZD1cIit0cmlwSWQrXCImc2VhdHM9XCIrc2VhdHMpO1xuICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgbWVzc2FnZS5zaG93KHJlcXVlc3QucmVzcG9uc2UpO1xuICAgIH1cbiAgfVxufVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGF2YWlsYWJsZSA6IHNlYXJjaEF2YWlsLFxuICBjcmVhdGUgICAgOiBtYWtlQm9va2luZ1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgbWVzc2FnZSAgPSByZXF1aXJlKCcuL21lc3NhZ2UuanMnKTtcbmNvbnN0IHJlcSAgICAgID0gcmVxdWlyZSgnLi9yZXF1ZXN0LmpzJyk7XG5jb25zdCB2YWxpZGF0ZSA9IHJlcXVpcmUoJy4vdmFsaWRhdGlvbi5qcycpO1xuY29uc3Qgdmlld3MgICAgPSByZXF1aXJlKCcuL3ZpZXdzLmpzJyk7XG5cbmZ1bmN0aW9uIHJlc2V0UGFzc3dvcmQoKSB7XG4gIHZhciBlbWFpbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldC1lbWFpbCcpLnZhbHVlO1xuICB2YXIgcGFyYW1zID0gJ2VtYWlsPScrZW1haWw7XG4gIHZhciB1cmwgICA9ICcvcmVzZXQnO1xuICB2YXIgcmVxdWVzdCA9IHJlcS5wb3N0KHVybCk7XG4gIHJlcXVlc3Quc2VuZChwYXJhbXMpO1xuXG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09ICdFbWFpbCBzZW50Jykge1xuICAgICAgICB2aWV3cy5zaWduaW4oKTtcbiAgICAgIH1cbiAgICAgIG1lc3NhZ2Uuc2hvdyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbmV3UGFzc3dvcmQoKSB7XG4gIHZhciBwYXNzd29yZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXctcGFzc3dvcmQnKS52YWx1ZTtcbiAgdmFyIGVtYWlsICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hpZGRlbi1lbWFpbCcpLnZhbHVlO1xuICB2YXIgdG9rZW4gICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGlkZGVuLXRva2VuJykudmFsdWU7XG4gIHZhciBwYXJhbXMgICA9IFwicGFzc3dvcmQ9XCIrcGFzc3dvcmQrXCImZW1haWw9XCIrZW1haWwrXCImdG9rZW49XCIrdG9rZW47XG4gIHZhciB1cmwgICAgICA9IFwiL25ld3Bhc3N3b3JkXCI7XG4gIHZhciByZXF1ZXN0ICA9IHJlcS5wb3N0KHVybCk7XG4gIHJlcXVlc3Quc2VuZChwYXJhbXMpO1xuXG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICBtZXNzYWdlLnNob3cocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ2luVXNlcigpIHtcbiAgdmFyIHVzZXJuYW1lICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VybmFtZScpLnZhbHVlO1xuICB2YXIgcGFzc3dvcmQgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Bhc3N3b3JkJykudmFsdWU7XG5cbiAgdmFsaWRhdGUubG9naW4odXNlcm5hbWUsIHBhc3N3b3JkLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZihlcnIpIG1lc3NhZ2Uuc2hvdyhlcnIpO1xuICAgIGlmKCFlcnIpIHtcbiAgICAgIHZhciBwYXJhbXMgICAgPSBcInVzZXJuYW1lPVwiK3VzZXJuYW1lK1wiJnBhc3N3b3JkPVwiK3Bhc3N3b3JkO1xuICAgICAgdmFyIHVybCAgICAgICA9IFwiL2xvZ2luXCI7XG4gICAgICB2YXIgcmVxdWVzdCAgID0gcmVxLnBvc3QodXJsKTtcbiAgICAgIHJlcXVlc3Quc2VuZChwYXJhbXMpO1xuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICAgICAgbWVzc2FnZS5zaG93KHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ1N1Y2Nlc3MnKSB7XG4gICAgICAgICAgICB2aWV3cy5zaWduZWRJbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyTmV3VXNlcigpIHtcbiAgdmFyIHVzZXJuYW1lICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci11c2VybmFtZScpLnZhbHVlO1xuICB2YXIgcGFzc3dvcmQgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXBhc3N3b3JkJykudmFsdWU7XG4gIHZhciBwYXNzd29yZDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItcGFzc3dvcmQyJykudmFsdWU7XG4gIHZhciBlbWFpbCAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKS52YWx1ZTtcblxuICB2YWxpZGF0ZS5yZWdpc3Rlcih1c2VybmFtZSwgcGFzc3dvcmQsIHBhc3N3b3JkMiwgZW1haWwsIGZ1bmN0aW9uKGVycikge1xuICAgIGlmKGVycikgbWVzc2FnZS5zaG93KGVycik7XG4gICAgaWYoIWVycikge1xuICAgICAgdmFyIHBhcmFtcyAgICA9IFwidXNlcm5hbWU9XCIrdXNlcm5hbWUrXCImcGFzc3dvcmQ9XCIrcGFzc3dvcmQrXCImZW1haWw9XCIrZW1haWw7XG4gICAgICB2YXIgdXJsICAgICAgID0gXCIvcmVnaXN0ZXJcIjtcbiAgICAgIHZhciByZXF1ZXN0ICAgPSByZXEucG9zdCh1cmwpO1xuICAgICAgcmVxdWVzdC5zZW5kKHBhcmFtcyk7XG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09ICdzdWNjZXNzJykge1xuICAgICAgICAgICAgbWVzc2FnZS5zaG93KCdSZWdpc3RlcmVkJyk7XG4gICAgICAgICAgICBzZW5kVmVyaWZpY2F0aW9uKGVtYWlsKTtcbiAgICAgICAgICAgIHZpZXdzLnNpZ25pbigpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlLnNob3cocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2VuZFZlcmlmaWNhdGlvbihlbWFpbCkge1xuICBjb25zb2xlLmxvZygnVmVyaWZ5aW5nJyk7XG4gIHZhciBwYXJhbXMgICAgPSBcImVtYWlsPVwiK2VtYWlsO1xuICB2YXIgdXJsICAgICAgID0gXCIvdmVyaWZ5XCI7XG4gIHZhciByZXF1ZXN0ICAgPSByZXEucG9zdCh1cmwpO1xuICByZXF1ZXN0LnNlbmQocGFyYW1zKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ1N1Y2Nlc3MnKSB7XG4gICAgICAgIG1lc3NhZ2Uuc2hvdygnVmVyaWZpY2F0aW9uIGVtYWlsIHNlbnQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lc3NhZ2Uuc2hvdyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9nT3V0KCkge1xuICB2YXIgdXJsID0gXCIvbG9nb3V0XCI7XG4gIHZhciByZXF1ZXN0ID0gcmVxLmdldCh1cmwpO1xuICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2VuZFZlcmlmaWNhdGlvbiA6IHNlbmRWZXJpZmljYXRpb24sXG4gIHJlZ2lzdGVyTmV3VXNlciAgOiByZWdpc3Rlck5ld1VzZXIsXG4gIGxvZ2luVXNlciAgICAgICAgOiBsb2dpblVzZXIsXG4gIG5ld1Bhc3N3b3JkICAgICAgOiBuZXdQYXNzd29yZCxcbiAgcmVzZXRQYXNzd29yZCAgICA6IHJlc2V0UGFzc3dvcmQsXG4gIGxvZ091dCAgICAgICAgICAgOiBsb2dPdXRcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gdmFsaWRMb2dpbih1c2VybmFtZSwgcGFzc3dvcmQsIGNhbGxiYWNrKSB7XG4gIGlmKCFwYXNzd29yZCB8fCAhdXNlcm5hbWUpIHtcbiAgICBjYWxsYmFjaygnQWxsIGZpZWxkIG11c3QgYmUgZmlsbGVkJyk7XG4gIH1cbiAgLy8gaWYocGFzc3dvcmQubGVuZ3RoPDgpIHtcbiAgICAvLyBjYWxsYmFjaygnQWxsIHBhc3N3b3JkcyBhcmUgYXRsZWFzdCA4IGNoYXJhY3RlcnMnKVxuICAvLyB9XG4gIGVsc2Uge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRSZWdpc3Rlcih1c2VybmFtZSwgcGFzc3dvcmQsIHBhc3N3b3JkMiwgZW1haWwsIGNhbGxiYWNrKSB7XG4gIHZhciByZWdleCA9IC9eW1xcd10qJC87XG4gIGlmKCFwYXNzd29yZCB8fCAhdXNlcm5hbWUgfHwgIXBhc3N3b3JkMiB8fCAhZW1haWwpIHtcbiAgICBjYWxsYmFjaygnQWxsIGZpZWxkcyBtdXN0IGJlIGZpbGxlZCcpO1xuICB9XG4gIC8vIGVsc2UgaWYgKHBhc3N3b3JkLmxlbmd0aCA8IDgpIHtcbiAgICAvLyBjYWxsYmFjaygnUGFzc3dvcmQgbXVzdCBiZSBhdGxlYXN0IDggY2hhcmFjdGVycycpO1xuICAvLyB9XG4gIGVsc2UgaWYoIShwYXNzd29yZCA9PT0gcGFzc3dvcmQyKSkge1xuICAgIGNhbGxiYWNrKCdQYXNzd29yZHMgZG8gbm90IG1hdGNoJyk7XG4gIH1cbiAgZWxzZSBpZighKHVzZXJuYW1lLm1hdGNoKHJlZ2V4KSkgfHwgIShwYXNzd29yZC5tYXRjaChyZWdleCkpKSB7XG4gICAgY2FsbGJhY2soJ1VzZXJuYW1lIGFuZCBwYXNzd29yZCBtdXN0IGJlIGNvbnNpc3Qgb2Ygb25seSBsZXR0ZXJzIGFuZCBudW1iZXJzJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZFNlYXJjaChkYXRlLCBzZWF0cywgY2FsbGJhY2spIHtcbiAgaWYoIWRhdGUgfHwgISBzZWF0cykge1xuICAgIGNhbGxiYWNrKCdBbGwgZmllbGQgbXVzdCBiZSBmaWxsZWQnKTtcbiAgfVxuICBjYWxsYmFjaygpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9naW4gOiB2YWxpZExvZ2luLFxuICByZWdpc3RlciA6IHZhbGlkUmVnaXN0ZXIsXG4gIHNlYXJjaCA6IHZhbGlkU2VhcmNoXG59XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCByZXEgPSByZXF1aXJlKCcuL3JlcXVlc3QuanMnKTtcbmNvbnN0IG1lc3NhZ2UgPSByZXF1aXJlKCcuL21lc3NhZ2UuanMnKTtcblxuZnVuY3Rpb24gc2lnbkluVmlldygpIHtcbiAgdmFyIGZvcm1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbG9naW4tZm9ybScpO1xuICB2YXIgc2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4tZm9ybScpO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgZm9ybXMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3Jtc1tpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB9XG4gIHNpZ25JbkZvcm0uc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJWaWV3KCkge1xuICB2YXIgc2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4tZm9ybScpO1xuICB2YXIgcmVnaXN0ZXJGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWZvcm0nKTtcbiAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICByZWdpc3RlckZvcm0uc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbn1cblxuZnVuY3Rpb24gYm9va2luZ1ZpZXcoKSB7XG4gIHZhciBib29raW5nRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib29raW5nLWZvcm0nKTtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBib29raW5nRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xufVxuXG5mdW5jdGlvbiBsb3N0VmlldygpIHtcbiAgdmFyIGxvc3RGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvc3QtZm9ybScpO1xuICB2YXIgc2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4tZm9ybScpO1xuICBzaWduSW5Gb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGxvc3RGb3JtLnN0eWxlLmRpc3BsYXkgPSAnZ3JpZCc7XG59XG5cbmZ1bmN0aW9uIHNpZ25lZEluVmlldygpIHtcbiAgdmFyIGJvb2tpbmdGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jvb2tpbmctZm9ybScpO1xuICB2YXIgc2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4tZm9ybScpO1xuICB2YXIgbG9nT3V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZy1vdXQnKTtcblxuICBpZihzaWduSW5Gb3JtKSB7XG4gICAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ICA9ICdub25lJztcbiAgICBib29raW5nRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xuICB9XG4gIGxvZ091dC5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xufVxuXG5mdW5jdGlvbiBzaWduZWRPdXRWaWV3KCkge1xuICB2YXIgYm9va2luZ0Zvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9va2luZy1mb3JtJyk7XG4gIHZhciBzaWduSW5Gb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ25pbi1mb3JtJyk7XG4gIHZhciBsb2dPdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9nLW91dCcpO1xuXG4gIGlmKHNpZ25JbkZvcm0pIHtcbiAgICBzaWduSW5Gb3JtLnN0eWxlLmRpc3BsYXkgID0gJ2dyaWQnO1xuICAgIGJvb2tpbmdGb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIH1cbiAgbG9nT3V0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG59XG5cbmZ1bmN0aW9uIHBvcHVsYXRlQm9va2luZ3MoKSB7XG4gIHZhciBib29raW5nc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9va2luZ3MnKTtcbiAgdmFyIHJlcXVlc3QgPSByZXEuZ2V0KCcvYm9va2luZ3MnKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIHZhciBib29raW5ncyA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICBpZihib29raW5ncy5sZW5ndGggPT0gMCkge1xuICAgICAgICBtZXNzYWdlLnNob3coJ1lvdSBoYXZlIG5vIGJvb2tpbmdzJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgYm9va2luZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcGFyc2VkQm9va2luZyA9IEpTT04ucGFyc2UoYm9va2luZ3NbaV0pO1xuICAgICAgICAgIHZhciBib29raW5nTnVtYmVyID0gcGFyc2VkQm9va2luZy5ib29raW5nSWQ7XG4gICAgICAgICAgaWYocGFyc2VkQm9va2luZy5ib2F0SWQgPT0gMSkge1xuICAgICAgICAgICAgdmFyIGJvYXQgPSAnSXNsYW5kZXInXG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJzZWRCb29raW5nLmJvYXRJZCA9PSAyKSB7XG4gICAgICAgICAgICB2YXIgYm9hdCA9ICdWaWtpbmcnXG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciB0aW1lID0gcGFyc2VkQm9va2luZy50aW1lO1xuICAgICAgICAgIHZhciBkYXRlID0gcGFyc2VkQm9va2luZy5kYXRlO1xuICAgICAgICAgIHZhciBwYXNzZW5nZXJzID0gcGFyc2VkQm9va2luZy5zZWF0cztcbiAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBgXG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJib29raW5nXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYm9va2luZy1udW1iZXJcIj4gQm9va2luZyBOdW1iZXI6ICR7Ym9va2luZ051bWJlcn0gPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBib2F0XCI+JHtib2F0fTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQgdGltZVwiPlRpbWU6ICR7dGltZX08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50IGRhdGVcIj5EYXRlOiAke2RhdGV9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBzZWF0c1wiPlNlYXRzOiAke3Bhc3NlbmdlcnN9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBpbmZvIHdpZGVcIj5BbGwgdGlja2V0cyBhcmUgYXZhaWxhYmxlIGZvciByZWZ1bmQgb3IgY2FuY2VsbGF0aW9uIHVwIHRvIDI0IGhvdXJzIHByaW9yIHRvIGRlcGFydHVyZSwgcGxlYXNlIGNvbnRhY3QgdXMgdmlhIHBob25lIG9yIGVtYWlsPC9kaXY+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgIGBcbiAgICAgICAgICBib29raW5nc0VsZW1lbnQuaW5uZXJIVE1MICs9IHRlbXBsYXRlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRNb3JlKGUpIHtcbiAgdmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuICB2YXIgc3BhbiA9IHRhcmdldC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nLmZpcnN0RWxlbWVudENoaWxkO1xuICB2YXIgbWFpbkJveCA9IHRhcmdldC5wYXJlbnRFbGVtZW50O1xuICB2YXIgaW1nID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gIHZhciBjcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG1haW5Cb3gsbnVsbCk7XG4gIHZhciBtYWluQm94R3JpZENvbHVtbiA9IGNzLmdldFByb3BlcnR5VmFsdWUoJ2dyaWQtY29sdW1uJyk7XG5cbiAgaWYoIShzcGFuLnN0eWxlLmRpc3BsYXkpIHx8IHNwYW4uc3R5bGUuZGlzcGxheSA9PSAnbm9uZScpIHtcbiAgICAgIHNwYW4uc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICAgICAgdGFyZ2V0LmlubmVySFRNTCA9ICdSZWFkIExlc3MnO1xuICAgICAgY29uc29sZS5sb2cobWFpbkJveEdyaWRDb2x1bW4pO1xuICAgICAgaWYobWFpbkJveEdyaWRDb2x1bW4gPT0gJ3NwYW4gMSAvIGF1dG8nKSB7XG4gICAgICAgIG1haW5Cb3guc3R5bGUuZ3JpZENvbHVtbiA9ICdzcGFuIDIgLyBhdXRvJztcbiAgICAgIH1cbiAgICAgIHZhciBzcmMgPSBpbWcuc3JjO1xuICAgICAgdmFyIHNwbGl0dGVkID0gc3JjLnNwbGl0KCcuJyk7XG4gICAgICBzcGxpdHRlZCA9IHNwbGl0dGVkWzBdICsgJ19vcmlnLmpwZyc7XG4gICAgICBpbWcuc3JjID0gc3BsaXR0ZWQ7XG4gIH0gZWxzZSB7XG4gICAgc3Bhbi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRhcmdldC5pbm5lckhUTUwgPSAnUmVhZCBNb3JlJztcbiAgICBpZihtYWluQm94R3JpZENvbHVtbiA9PSAnc3BhbiAyIC8gYXV0bycpIHtcbiAgICAgIG1haW5Cb3guc3R5bGUuZ3JpZENvbHVtbiA9ICdzcGFuIDEgLyBhdXRvJztcbiAgICB9XG4gICAgdmFyIHNyYyA9IGltZy5zcmM7XG4gICAgdmFyIHNwbGl0dGVkID0gc3JjLnNwbGl0KCdfJyk7XG4gICAgc3BsaXR0ZWQgPSBzcGxpdHRlZFswXSArICcucG5nJztcbiAgICBpbWcuc3JjID0gc3BsaXR0ZWQ7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvc3QgOiBsb3N0VmlldyxcbiAgYm9va2luZyA6IGJvb2tpbmdWaWV3LFxuICBzaWduaW4gOiBzaWduSW5WaWV3LFxuICByZWdpc3RlciA6IHJlZ2lzdGVyVmlldyxcbiAgc2lnbmVkSW4gOiBzaWduZWRJblZpZXcsXG4gIHBvcHVsYXRlQm9va2luZ3MgOiBwb3B1bGF0ZUJvb2tpbmdzLFxuICByZWFkTW9yZSA6IHJlYWRNb3JlLFxuICBzaWduT3V0IDogc2lnbmVkT3V0Vmlld1xufVxuIl19
