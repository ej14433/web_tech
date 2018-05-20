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
    views.populateAccount();
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
            var err = JSON.parse(request.response);
            switch(err.errno) {
              case 19 :
                message.show('An account with these details already exists');
                break;
              case 5 :
                message.show(`Error code:  ${err.errno}`);
                break;
            }
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

function populateAccount() {
  var accountElement = document.querySelector('.account-info');
  var request = req.get('/accountdetails');
  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      var details = JSON.parse(request.response);
      accountElement.innerHTML =
      `
        <p>Name:</p>
        <input type="text" name="name" value="${details.username}">
        <p>Email:</p>
        <input type="text" name="email" value="${details.email}">
        <input class="login-button" id="login-button" type="button" value="Update Details" />
      `;
      console.log(request.response);
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
  populateAccount  : populateAccount,
  readMore : readMore,
  signOut : signedOutView
}

},{"./message.js":2,"./request.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYWluLmpzIiwibWVzc2FnZS5qcyIsInJlcXVlc3QuanMiLCJyZXZpZXcuanMiLCJzZWFyY2guanMiLCJ1c2VyLmpzIiwidmFsaWRhdGlvbi5qcyIsInZpZXdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5jb25zdCB2YWxpZGF0ZSA9IHJlcXVpcmUoJy4vdmFsaWRhdGlvbi5qcycpO1xuY29uc3Qgdmlld3MgICAgPSByZXF1aXJlKCcuL3ZpZXdzLmpzJyAgICAgKTtcbmNvbnN0IHJlcSAgICAgID0gcmVxdWlyZSgnLi9yZXF1ZXN0LmpzJyAgICk7XG5jb25zdCB1c2VyICAgICA9IHJlcXVpcmUoJy4vdXNlci5qcycgICAgICApO1xuY29uc3QgbWVzc2FnZSAgPSByZXF1aXJlKCcuL21lc3NhZ2UuanMnICAgKTtcbmNvbnN0IHNlYXJjaGpzID0gcmVxdWlyZSgnLi9zZWFyY2guanMnICAgICk7XG5jb25zdCByZXZpZXcgICA9IHJlcXVpcmUoJy4vcmV2aWV3LmpzJyAgICApO1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIChlKSB7XG5cbiAgdmFyIHJlcXVlc3QgPSByZXEuZ2V0KCcvaXNzaWduZWRpbicpO1xuICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09ICd5ZXMnKSB7XG4gICAgICAgIHZpZXdzLnNpZ25lZEluKCk7XG4gICAgICB9XG4gICAgICBpZihyZXF1ZXN0LnJlc3BvbnNlID09ICdubycpIHtcbiAgICAgICAgdmlld3Muc2lnbk91dCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBib29raW5ncyAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9va2luZ3MnICAgICAgICAgICAgICApO1xuICB2YXIgcmVnaXN0ZXIgICAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyJyAgICAgICAgICAgICAgKTtcbiAgdmFyIHNlYXJjaCAgICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gnICAgICAgICAgICAgICAgICk7XG4gIHZhciBzaWduaW4gICAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluJyAgICAgICAgICAgICAgICApO1xuICB2YXIgcmVnaXN0ZXJCdXR0b24gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWJ1dHRvbicgICAgICAgKTtcbiAgdmFyIGxvZ2luQnV0dG9uICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi1idXR0b24nICAgICAgICAgICk7XG4gIHZhciBsb3N0ICAgICAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9zdCcgICAgICAgICAgICAgICAgICApO1xuICB2YXIgbG9zdFNpZ25JbiAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvc3Qtc2lnbmluJyAgICAgICAgICAgKTtcbiAgdmFyIHJlc2V0ICAgICAgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldC1wYXNzd29yZCcgICAgICAgICk7XG4gIHZhciBmaW5pc2hSZXNldCAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQtYWNjb3VudC1wYXNzd29yZCcpO1xuICB2YXIgYm9va0J1dHRvbiAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jvb2stdHJpcCcgICAgICAgICAgICAgKTtcbiAgdmFyIG15Qm9va2luZ3MgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdteS1ib29raW5ncycgICAgICAgICAgICk7XG4gIHZhciByZWFkTW9yZXMgICAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucmVhZC1tb3JlLWJ1dHRvbicgICApO1xuICB2YXIgbG9nT3V0ICAgICAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZy1vdXQnICAgICAgICAgICAgICAgKTtcbiAgdmFyIGZvcm1zICAgICAgICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2Zvcm0nICAgICAgICAgICAgICAgICk7XG4gIHZhciByZXZpZXdCdXR0b24gICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmV2aWV3LXN1Ym1pdCcgICAgICAgICApO1xuICB2YXIgcmV2aWV3c0NvbnRhaW50ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmV2aWV3cy1jb250YWluZXInICAgKTtcblxuICBpZihib29raW5ncykge1xuICAgIHZpZXdzLnBvcHVsYXRlQm9va2luZ3MoKTtcbiAgICB2aWV3cy5wb3B1bGF0ZUFjY291bnQoKTtcbiAgfVxuXG4gIGlmKHJldmlld0J1dHRvbikge1xuICAgIHJldmlld0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCAgJ2NsaWNrJywgcmV2aWV3LnN1Ym1pdCAgICAgICApO1xuICB9XG5cbiAgbG9nT3V0LmFkZEV2ZW50TGlzdGVuZXIoICAgICAgICAgICdjbGljaycsIHVzZXIubG9nT3V0ICAgICAgICAgKTtcblxuICBpZihzZWFyY2gpIHtcbiAgICByZWdpc3Rlci5hZGRFdmVudExpc3RlbmVyKCAgICAgICdjbGljaycsIHZpZXdzLnJlZ2lzdGVyICAgICAgKTtcbiAgICBsb2dpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCAgICdjbGljaycsIHVzZXIubG9naW5Vc2VyICAgICAgKTtcbiAgICBzaWduaW4uYWRkRXZlbnRMaXN0ZW5lciggICAgICAgICdjbGljaycsIHZpZXdzLnNpZ25pbiAgICAgICAgKTtcbiAgICByZWdpc3RlckJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHVzZXIucmVnaXN0ZXJOZXdVc2VyKTtcbiAgICBsb3N0LmFkZEV2ZW50TGlzdGVuZXIoICAgICAgICAgICdjbGljaycsIHZpZXdzLmxvc3QgICAgICAgICAgKTtcbiAgICBsb3N0U2lnbkluLmFkZEV2ZW50TGlzdGVuZXIoICAgICdjbGljaycsIHZpZXdzLnNpZ25pbiAgICAgICAgKTtcbiAgICBzZWFyY2guYWRkRXZlbnRMaXN0ZW5lciggICAgICAgICdjbGljaycsIHNlYXJjaGpzLmF2YWlsYWJsZSAgKTtcbiAgICByZXNldC5hZGRFdmVudExpc3RlbmVyKCAgICAgICAgICdjbGljaycsIHVzZXIucmVzZXRQYXNzd29yZCAgKTtcbiAgICBib29rQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICAgICdjbGljaycsIHNlYXJjaGpzLmNyZWF0ZSAgICAgKTtcbiAgICByZWFkTW9yZXMuZm9yRWFjaChyZWFkTW9yZSA9PiByZWFkTW9yZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHZpZXdzLnJlYWRNb3JlKSk7XG4gICAgZm9ybXMuZm9yRWFjaCggICAgICAgIGZvcm0gPT4gZm9ybS5hZGRFdmVudExpc3RlbmVyKCAgICAna2V5dXAnLCBrZXlQcmVzcyAgICAgICkpO1xuICAgIHJldmlldy5wb3B1bGF0ZSgpO1xuXG4gIH1cblxuICBpZihmaW5pc2hSZXNldCkge1xuICAgIGZpbmlzaFJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoICAgJ2NsaWNrJywgdXNlci5uZXdQYXNzd29yZCk7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBrZXlQcmVzcyhlKXtcbiAgc3dpdGNoKGUua2V5Q29kZSkge1xuICAgIGNhc2UgMTM6XG4gICAgICBwYXJlbnQgPSBlLnRhcmdldC5wYXJlbnRFbGVtZW50O1xuICAgICAgaWYocGFyZW50LmlkID09ICdzaWduaW4tZm9ybScpIHtcbiAgICAgICAgdXNlci5sb2dpblVzZXIoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5mdW5jdGlvbiBzaG93TWVzc2FnZShtZXNzYWdlKXtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Vycm9yLW1lc3NhZ2UnKS5pbm5lckhUTUwgPSBtZXNzYWdlO1xuICB2YXIgZXJyb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXJyb3InKTtcbiAgZXJyb3Iuc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbiAgZXJyb3Iuc3R5bGUub3BhY2l0eSA9IDE7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgZXJyb3Iuc3R5bGUub3BhY2l0eSA9IDA7fSwgNzAwKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpeyBlcnJvci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyB9LCAxMjAwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNob3cgOiBzaG93TWVzc2FnZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcHJlcEdldCh1cmwpIHtcbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwpO1xuICByZXF1ZXN0LnNlbmQoKTtcbiAgcmV0dXJuIHJlcXVlc3Q7XG59XG5cbmZ1bmN0aW9uIHByZXBQb3N0KHVybCkge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xuICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIik7XG4gIHJldHVybiByZXF1ZXN0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0ICA6IHByZXBHZXQsXG4gIHBvc3QgOiBwcmVwUG9zdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5jb25zdCByZXEgICAgICA9IHJlcXVpcmUoJy4vcmVxdWVzdC5qcycpO1xuY29uc3QgbWVzc2FnZSAgPSByZXF1aXJlKCcuL21lc3NhZ2UuanMnKTtcblxuZnVuY3Rpb24gc3VibWl0KCkge1xuICB2YXIgZW1haWwgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jldmlldy1lbWFpbCcgICAgKS52YWx1ZTtcbiAgdmFyIGZpcnN0bmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXZpZXctZmlyc3RuYW1lJykudmFsdWU7XG4gIHZhciBsYXN0bmFtZSAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmV2aWV3LWxhc3RuYW1lJyApLnZhbHVlO1xuICB2YXIgcmV2aWV3ICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3Jldmlldy1lbnRyeScgICAgKS52YWx1ZTtcblxuICB2YXIgcGFyYW1zID0gYGVtYWlsPSR7ZW1haWx9JmZpcnN0bmFtZT0ke2ZpcnN0bmFtZX0mbGFzdG5hbWU9JHtsYXN0bmFtZX0mcmV2aWV3PSR7cmV2aWV3fWBcbiAgdmFyIHVybCA9ICcvcmV2aWV3JztcbiAgdmFyIHJlcXVlc3QgPSByZXEucG9zdCh1cmwpO1xuICByZXF1ZXN0LnNlbmQocGFyYW1zKVxuXG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICBjb25zb2xlLmxvZyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxufVxuXG5mdW5jdGlvbiBwb3B1bGF0ZSgpIHtcbiAgdmFyIHJldmlld3NFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJldmlld3MtY29udGFpbmVyJyk7XG4gIHZhciByZXF1ZXN0ID0gcmVxLmdldCgnL2xhdGVzdHJldmlld3MnKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIHZhciByZXZpZXdzID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCByZXZpZXdzLmxlbmd0aDsgaSArKykge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJldmlld3NcIj5cbiAgICAgICAgICAgIDxpbWcgc3JjPVwiLi9pbWcvZGVmYXVsdC5zdmdcIiBhbHQ9XCJcIj5cbiAgICAgICAgICAgIDxoMj4ke3Jldmlld3NbaV0ubmFtZX08L2gyPlxuICAgICAgICAgICAgPHA+JHtyZXZpZXdzW2ldLnJldmlld308L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIGA7XG4gICAgICAgIHJldmlld3NFbGVtZW50LmlubmVySFRNTCArPSB0ZW1wbGF0ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHN1Ym1pdCA6IHN1Ym1pdCxcbiAgcG9wdWxhdGUgOiBwb3B1bGF0ZVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgdmFsaWRhdGUgPSByZXF1aXJlKCcuL3ZhbGlkYXRpb24uanMnKTtcbmNvbnN0IHJlcSAgICAgID0gcmVxdWlyZSgnLi9yZXF1ZXN0LmpzJyk7XG5jb25zdCBtZXNzYWdlICA9IHJlcXVpcmUoJy4vbWVzc2FnZS5qcycpO1xuXG5mdW5jdGlvbiBzZWFyY2hBdmFpbCgpIHtcbiAgdmFyIHRyaXBMaXN0ICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0cmlwTGlzdCcpO1xuICB2YXIgZGF0ZSAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGF0ZS1pbnB1dCcpLnZhbHVlO1xuICB2YXIgc2VhdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhdHMtaW5wdXQnKS52YWx1ZTtcbiAgdmFyIHVybCAgID0gJy9zZWFyY2gvP2RhdGU9JyArIGRhdGUgKyAnJnNlYXRzPScgKyAgc2VhdHM7XG4gIHZhciByZXF1ZXN0ID0gcmVxLmdldCh1cmwpO1xuICB2YXIgdHJpcHMgPSBbXTtcblxuICB2YXIgcmVnZXhEYXRlID0gL1swLTldezR9LVswLTldezJ9LVswLTldezJ9LztcbiAgdmFyIHJlZ2V4U2VhdCA9IC9bMC05XXsxLDJ9LztcbiAgdmFsaWRhdGUuc2VhcmNoKGRhdGUsIHNlYXRzLCBmdW5jdGlvbihlcnIpIHtcbiAgICBpZiAoZXJyKSBtZXNzYWdlLnNob3coZXJyKTtcbiAgICBpZighZXJyKSB7XG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgICAgICB0cmlwcyA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgICAgaWYocmVxdWVzdC5yZXNwb25zZSA9PSBcIm5vdHJpcFwiKSB7XG4gICAgICAgICAgICBtZXNzYWdlLnNob3coXCJZb3UgbXVzdCBjaG9vc2UgYSB0cmlwIGZpcnN0XCIpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRyaXBMaXN0LmlubmVySFRNTCA9ICc8b3B0aW9uIHZhbHVlPVwiZW1wdHlcIj48L29wdGlvbj4nO1xuICAgICAgICAgIGlmKHRyaXBzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBtZXNzYWdlLnNob3coXCJUaGVyZSBhcmUgbm8gdHJpcHMgYXZhaWxhYmxlIHdpdGhpbiB0aGVzZSB2YWx1ZXNcIik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0cmlwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICB0cmlwTGlzdC5pbm5lckhUTUwgKz0gXCI8b3B0aW9uIHZhbHVlPSdcIisgdHJpcHNbaV0udHJpcElkKyBcIiBcIiArIHNlYXRzICtcIic+XCIgKyB0cmlwc1tpXS50aW1lICtcIjwvb3B0aW9uPlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJpcExpc3QudmFsdWUgPSB0cmlwc1swXS50cmlwSWQgKyBcIiBcIiArIHNlYXRzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG1ha2VCb29raW5nKCkge1xuICB2YXIgdHJpcCA9IHRyaXBMaXN0LnZhbHVlLnNwbGl0KCcgJyk7XG4gIHZhciB0cmlwSWQgPSB0cmlwWzBdO1xuICB2YXIgc2VhdHMgID0gdHJpcFsxXTtcbiAgdmFyIHJlcXVlc3QgPSByZXEuZ2V0KFwiL2Jvb2s/dHJpcGlkPVwiK3RyaXBJZCtcIiZzZWF0cz1cIitzZWF0cyk7XG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmKHJlcXVlc3QucmVhZHlTdGF0ZSA9PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG4gICAgICBtZXNzYWdlLnNob3cocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgfVxuICB9XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXZhaWxhYmxlIDogc2VhcmNoQXZhaWwsXG4gIGNyZWF0ZSAgICA6IG1ha2VCb29raW5nXG59XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBtZXNzYWdlICA9IHJlcXVpcmUoJy4vbWVzc2FnZS5qcycpO1xuY29uc3QgcmVxICAgICAgPSByZXF1aXJlKCcuL3JlcXVlc3QuanMnKTtcbmNvbnN0IHZhbGlkYXRlID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uLmpzJyk7XG5jb25zdCB2aWV3cyAgICA9IHJlcXVpcmUoJy4vdmlld3MuanMnKTtcblxuZnVuY3Rpb24gcmVzZXRQYXNzd29yZCgpIHtcbiAgdmFyIGVtYWlsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0LWVtYWlsJykudmFsdWU7XG4gIHZhciBwYXJhbXMgPSAnZW1haWw9JytlbWFpbDtcbiAgdmFyIHVybCAgID0gJy9yZXNldCc7XG4gIHZhciByZXF1ZXN0ID0gcmVxLnBvc3QodXJsKTtcbiAgcmVxdWVzdC5zZW5kKHBhcmFtcyk7XG5cbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ0VtYWlsIHNlbnQnKSB7XG4gICAgICAgIHZpZXdzLnNpZ25pbigpO1xuICAgICAgfVxuICAgICAgbWVzc2FnZS5zaG93KHJlcXVlc3QucmVzcG9uc2UpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBuZXdQYXNzd29yZCgpIHtcbiAgdmFyIHBhc3N3b3JkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ldy1wYXNzd29yZCcpLnZhbHVlO1xuICB2YXIgZW1haWwgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaGlkZGVuLWVtYWlsJykudmFsdWU7XG4gIHZhciB0b2tlbiAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoaWRkZW4tdG9rZW4nKS52YWx1ZTtcbiAgdmFyIHBhcmFtcyAgID0gXCJwYXNzd29yZD1cIitwYXNzd29yZCtcIiZlbWFpbD1cIitlbWFpbCtcIiZ0b2tlbj1cIit0b2tlbjtcbiAgdmFyIHVybCAgICAgID0gXCIvbmV3cGFzc3dvcmRcIjtcbiAgdmFyIHJlcXVlc3QgID0gcmVxLnBvc3QodXJsKTtcbiAgcmVxdWVzdC5zZW5kKHBhcmFtcyk7XG5cbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIG1lc3NhZ2Uuc2hvdyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9naW5Vc2VyKCkge1xuICB2YXIgdXNlcm5hbWUgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykudmFsdWU7XG4gIHZhciBwYXNzd29yZCAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFzc3dvcmQnKS52YWx1ZTtcblxuICB2YWxpZGF0ZS5sb2dpbih1c2VybmFtZSwgcGFzc3dvcmQsIGZ1bmN0aW9uKGVycikge1xuICAgIGlmKGVycikgbWVzc2FnZS5zaG93KGVycik7XG4gICAgaWYoIWVycikge1xuICAgICAgdmFyIHBhcmFtcyAgICA9IFwidXNlcm5hbWU9XCIrdXNlcm5hbWUrXCImcGFzc3dvcmQ9XCIrcGFzc3dvcmQ7XG4gICAgICB2YXIgdXJsICAgICAgID0gXCIvbG9naW5cIjtcbiAgICAgIHZhciByZXF1ZXN0ICAgPSByZXEucG9zdCh1cmwpO1xuICAgICAgcmVxdWVzdC5zZW5kKHBhcmFtcyk7XG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgICAgICBtZXNzYWdlLnNob3cocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgICAgaWYocmVxdWVzdC5yZXNwb25zZSA9PSAnU3VjY2VzcycpIHtcbiAgICAgICAgICAgIHZpZXdzLnNpZ25lZEluKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJOZXdVc2VyKCkge1xuICB2YXIgdXNlcm5hbWUgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXVzZXJuYW1lJykudmFsdWU7XG4gIHZhciBwYXNzd29yZCAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItcGFzc3dvcmQnKS52YWx1ZTtcbiAgdmFyIHBhc3N3b3JkMiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1wYXNzd29yZDInKS52YWx1ZTtcbiAgdmFyIGVtYWlsICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1lbWFpbCcpLnZhbHVlO1xuXG4gIHZhbGlkYXRlLnJlZ2lzdGVyKHVzZXJuYW1lLCBwYXNzd29yZCwgcGFzc3dvcmQyLCBlbWFpbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYoZXJyKSBtZXNzYWdlLnNob3coZXJyKTtcbiAgICBpZighZXJyKSB7XG4gICAgICB2YXIgcGFyYW1zICAgID0gXCJ1c2VybmFtZT1cIit1c2VybmFtZStcIiZwYXNzd29yZD1cIitwYXNzd29yZCtcIiZlbWFpbD1cIitlbWFpbDtcbiAgICAgIHZhciB1cmwgICAgICAgPSBcIi9yZWdpc3RlclwiO1xuICAgICAgdmFyIHJlcXVlc3QgICA9IHJlcS5wb3N0KHVybCk7XG4gICAgICByZXF1ZXN0LnNlbmQocGFyYW1zKTtcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgICAgICBtZXNzYWdlLnNob3coJ1JlZ2lzdGVyZWQnKTtcbiAgICAgICAgICAgIHNlbmRWZXJpZmljYXRpb24oZW1haWwpO1xuICAgICAgICAgICAgdmlld3Muc2lnbmluKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgICAgICAgc3dpdGNoKGVyci5lcnJubykge1xuICAgICAgICAgICAgICBjYXNlIDE5IDpcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNob3coJ0FuIGFjY291bnQgd2l0aCB0aGVzZSBkZXRhaWxzIGFscmVhZHkgZXhpc3RzJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgNSA6XG4gICAgICAgICAgICAgICAgbWVzc2FnZS5zaG93KGBFcnJvciBjb2RlOiAgJHtlcnIuZXJybm99YCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2VuZFZlcmlmaWNhdGlvbihlbWFpbCkge1xuICBjb25zb2xlLmxvZygnVmVyaWZ5aW5nJyk7XG4gIHZhciBwYXJhbXMgICAgPSBcImVtYWlsPVwiK2VtYWlsO1xuICB2YXIgdXJsICAgICAgID0gXCIvdmVyaWZ5XCI7XG4gIHZhciByZXF1ZXN0ICAgPSByZXEucG9zdCh1cmwpO1xuICByZXF1ZXN0LnNlbmQocGFyYW1zKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIGlmKHJlcXVlc3QucmVzcG9uc2UgPT0gJ1N1Y2Nlc3MnKSB7XG4gICAgICAgIG1lc3NhZ2Uuc2hvdygnVmVyaWZpY2F0aW9uIGVtYWlsIHNlbnQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lc3NhZ2Uuc2hvdyhyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9nT3V0KCkge1xuICB2YXIgdXJsID0gXCIvbG9nb3V0XCI7XG4gIHZhciByZXF1ZXN0ID0gcmVxLmdldCh1cmwpO1xuICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2VuZFZlcmlmaWNhdGlvbiA6IHNlbmRWZXJpZmljYXRpb24sXG4gIHJlZ2lzdGVyTmV3VXNlciAgOiByZWdpc3Rlck5ld1VzZXIsXG4gIGxvZ2luVXNlciAgICAgICAgOiBsb2dpblVzZXIsXG4gIG5ld1Bhc3N3b3JkICAgICAgOiBuZXdQYXNzd29yZCxcbiAgcmVzZXRQYXNzd29yZCAgICA6IHJlc2V0UGFzc3dvcmQsXG4gIGxvZ091dCAgICAgICAgICAgOiBsb2dPdXRcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gdmFsaWRMb2dpbih1c2VybmFtZSwgcGFzc3dvcmQsIGNhbGxiYWNrKSB7XG4gIGlmKCFwYXNzd29yZCB8fCAhdXNlcm5hbWUpIHtcbiAgICBjYWxsYmFjaygnQWxsIGZpZWxkIG11c3QgYmUgZmlsbGVkJyk7XG4gIH1cbiAgLy8gaWYocGFzc3dvcmQubGVuZ3RoPDgpIHtcbiAgICAvLyBjYWxsYmFjaygnQWxsIHBhc3N3b3JkcyBhcmUgYXRsZWFzdCA4IGNoYXJhY3RlcnMnKVxuICAvLyB9XG4gIGVsc2Uge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRSZWdpc3Rlcih1c2VybmFtZSwgcGFzc3dvcmQsIHBhc3N3b3JkMiwgZW1haWwsIGNhbGxiYWNrKSB7XG4gIHZhciByZWdleCA9IC9eW1xcd10qJC87XG4gIGlmKCFwYXNzd29yZCB8fCAhdXNlcm5hbWUgfHwgIXBhc3N3b3JkMiB8fCAhZW1haWwpIHtcbiAgICBjYWxsYmFjaygnQWxsIGZpZWxkcyBtdXN0IGJlIGZpbGxlZCcpO1xuICB9XG4gIC8vIGVsc2UgaWYgKHBhc3N3b3JkLmxlbmd0aCA8IDgpIHtcbiAgICAvLyBjYWxsYmFjaygnUGFzc3dvcmQgbXVzdCBiZSBhdGxlYXN0IDggY2hhcmFjdGVycycpO1xuICAvLyB9XG4gIGVsc2UgaWYoIShwYXNzd29yZCA9PT0gcGFzc3dvcmQyKSkge1xuICAgIGNhbGxiYWNrKCdQYXNzd29yZHMgZG8gbm90IG1hdGNoJyk7XG4gIH1cbiAgZWxzZSBpZighKHVzZXJuYW1lLm1hdGNoKHJlZ2V4KSkgfHwgIShwYXNzd29yZC5tYXRjaChyZWdleCkpKSB7XG4gICAgY2FsbGJhY2soJ1VzZXJuYW1lIGFuZCBwYXNzd29yZCBtdXN0IGJlIGNvbnNpc3Qgb2Ygb25seSBsZXR0ZXJzIGFuZCBudW1iZXJzJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZFNlYXJjaChkYXRlLCBzZWF0cywgY2FsbGJhY2spIHtcbiAgaWYoIWRhdGUgfHwgISBzZWF0cykge1xuICAgIGNhbGxiYWNrKCdBbGwgZmllbGQgbXVzdCBiZSBmaWxsZWQnKTtcbiAgfVxuICBjYWxsYmFjaygpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9naW4gOiB2YWxpZExvZ2luLFxuICByZWdpc3RlciA6IHZhbGlkUmVnaXN0ZXIsXG4gIHNlYXJjaCA6IHZhbGlkU2VhcmNoXG59XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCByZXEgPSByZXF1aXJlKCcuL3JlcXVlc3QuanMnKTtcbmNvbnN0IG1lc3NhZ2UgPSByZXF1aXJlKCcuL21lc3NhZ2UuanMnKTtcblxuZnVuY3Rpb24gc2lnbkluVmlldygpIHtcbiAgdmFyIGZvcm1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbG9naW4tZm9ybScpO1xuICB2YXIgc2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4tZm9ybScpO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgZm9ybXMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3Jtc1tpXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICB9XG4gIHNpZ25JbkZvcm0uc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJWaWV3KCkge1xuICB2YXIgc2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4tZm9ybScpO1xuICB2YXIgcmVnaXN0ZXJGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWZvcm0nKTtcbiAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICByZWdpc3RlckZvcm0uc3R5bGUuZGlzcGxheSA9ICdncmlkJztcbn1cblxuZnVuY3Rpb24gYm9va2luZ1ZpZXcoKSB7XG4gIHZhciBib29raW5nRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib29raW5nLWZvcm0nKTtcbiAgdmFyIHNpZ25JbkZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2lnbmluLWZvcm0nKTtcbiAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBib29raW5nRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xufVxuXG5mdW5jdGlvbiBsb3N0VmlldygpIHtcbiAgdmFyIGxvc3RGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvc3QtZm9ybScpO1xuICB2YXIgc2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4tZm9ybScpO1xuICBzaWduSW5Gb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGxvc3RGb3JtLnN0eWxlLmRpc3BsYXkgPSAnZ3JpZCc7XG59XG5cbmZ1bmN0aW9uIHNpZ25lZEluVmlldygpIHtcbiAgdmFyIGJvb2tpbmdGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jvb2tpbmctZm9ybScpO1xuICB2YXIgc2lnbkluRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWduaW4tZm9ybScpO1xuICB2YXIgbG9nT3V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZy1vdXQnKTtcblxuICBpZihzaWduSW5Gb3JtKSB7XG4gICAgc2lnbkluRm9ybS5zdHlsZS5kaXNwbGF5ICA9ICdub25lJztcbiAgICBib29raW5nRm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xuICB9XG4gIGxvZ091dC5zdHlsZS5kaXNwbGF5ID0gJ2dyaWQnO1xufVxuXG5mdW5jdGlvbiBzaWduZWRPdXRWaWV3KCkge1xuICB2YXIgYm9va2luZ0Zvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9va2luZy1mb3JtJyk7XG4gIHZhciBzaWduSW5Gb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpZ25pbi1mb3JtJyk7XG4gIHZhciBsb2dPdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9nLW91dCcpO1xuXG4gIGlmKHNpZ25JbkZvcm0pIHtcbiAgICBzaWduSW5Gb3JtLnN0eWxlLmRpc3BsYXkgID0gJ2dyaWQnO1xuICAgIGJvb2tpbmdGb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIH1cbiAgbG9nT3V0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG59XG5cbmZ1bmN0aW9uIHBvcHVsYXRlQm9va2luZ3MoKSB7XG4gIHZhciBib29raW5nc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm9va2luZ3MnKTtcbiAgdmFyIHJlcXVlc3QgPSByZXEuZ2V0KCcvYm9va2luZ3MnKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYocmVxdWVzdC5yZWFkeVN0YXRlID09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcbiAgICAgIHZhciBib29raW5ncyA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICBpZihib29raW5ncy5sZW5ndGggPT0gMCkge1xuICAgICAgICBtZXNzYWdlLnNob3coJ1lvdSBoYXZlIG5vIGJvb2tpbmdzJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgYm9va2luZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcGFyc2VkQm9va2luZyA9IEpTT04ucGFyc2UoYm9va2luZ3NbaV0pO1xuICAgICAgICAgIHZhciBib29raW5nTnVtYmVyID0gcGFyc2VkQm9va2luZy5ib29raW5nSWQ7XG4gICAgICAgICAgaWYocGFyc2VkQm9va2luZy5ib2F0SWQgPT0gMSkge1xuICAgICAgICAgICAgdmFyIGJvYXQgPSAnSXNsYW5kZXInXG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJzZWRCb29raW5nLmJvYXRJZCA9PSAyKSB7XG4gICAgICAgICAgICB2YXIgYm9hdCA9ICdWaWtpbmcnXG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciB0aW1lID0gcGFyc2VkQm9va2luZy50aW1lO1xuICAgICAgICAgIHZhciBkYXRlID0gcGFyc2VkQm9va2luZy5kYXRlO1xuICAgICAgICAgIHZhciBwYXNzZW5nZXJzID0gcGFyc2VkQm9va2luZy5zZWF0cztcbiAgICAgICAgICB2YXIgdGVtcGxhdGUgPSBgXG4gICAgICAgICAgPHNlY3Rpb24gY2xhc3M9XCJib29raW5nXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYm9va2luZy1udW1iZXJcIj4gQm9va2luZyBOdW1iZXI6ICR7Ym9va2luZ051bWJlcn0gPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBib2F0XCI+JHtib2F0fTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnQgdGltZVwiPlRpbWU6ICR7dGltZX08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50IGRhdGVcIj5EYXRlOiAke2RhdGV9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBzZWF0c1wiPlNlYXRzOiAke3Bhc3NlbmdlcnN9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGVudCBpbmZvIHdpZGVcIj5BbGwgdGlja2V0cyBhcmUgYXZhaWxhYmxlIGZvciByZWZ1bmQgb3IgY2FuY2VsbGF0aW9uIHVwIHRvIDI0IGhvdXJzIHByaW9yIHRvIGRlcGFydHVyZSwgcGxlYXNlIGNvbnRhY3QgdXMgdmlhIHBob25lIG9yIGVtYWlsPC9kaXY+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgIGBcbiAgICAgICAgICBib29raW5nc0VsZW1lbnQuaW5uZXJIVE1MICs9IHRlbXBsYXRlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBvcHVsYXRlQWNjb3VudCgpIHtcbiAgdmFyIGFjY291bnRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFjY291bnQtaW5mbycpO1xuICB2YXIgcmVxdWVzdCA9IHJlcS5nZXQoJy9hY2NvdW50ZGV0YWlscycpO1xuICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZihyZXF1ZXN0LnJlYWR5U3RhdGUgPT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgdmFyIGRldGFpbHMgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgICAgYWNjb3VudEVsZW1lbnQuaW5uZXJIVE1MID1cbiAgICAgIGBcbiAgICAgICAgPHA+TmFtZTo8L3A+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJuYW1lXCIgdmFsdWU9XCIke2RldGFpbHMudXNlcm5hbWV9XCI+XG4gICAgICAgIDxwPkVtYWlsOjwvcD5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImVtYWlsXCIgdmFsdWU9XCIke2RldGFpbHMuZW1haWx9XCI+XG4gICAgICAgIDxpbnB1dCBjbGFzcz1cImxvZ2luLWJ1dHRvblwiIGlkPVwibG9naW4tYnV0dG9uXCIgdHlwZT1cImJ1dHRvblwiIHZhbHVlPVwiVXBkYXRlIERldGFpbHNcIiAvPlxuICAgICAgYDtcbiAgICAgIGNvbnNvbGUubG9nKHJlcXVlc3QucmVzcG9uc2UpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkTW9yZShlKSB7XG4gIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcbiAgdmFyIHNwYW4gPSB0YXJnZXQucHJldmlvdXNFbGVtZW50U2libGluZy5maXJzdEVsZW1lbnRDaGlsZDtcbiAgdmFyIG1haW5Cb3ggPSB0YXJnZXQucGFyZW50RWxlbWVudDtcbiAgdmFyIGltZyA9IHRhcmdldC5wYXJlbnRFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICB2YXIgY3MgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShtYWluQm94LG51bGwpO1xuICB2YXIgbWFpbkJveEdyaWRDb2x1bW4gPSBjcy5nZXRQcm9wZXJ0eVZhbHVlKCdncmlkLWNvbHVtbicpO1xuXG4gIGlmKCEoc3Bhbi5zdHlsZS5kaXNwbGF5KSB8fCBzcGFuLnN0eWxlLmRpc3BsYXkgPT0gJ25vbmUnKSB7XG4gICAgICBzcGFuLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lJztcbiAgICAgIHRhcmdldC5pbm5lckhUTUwgPSAnUmVhZCBMZXNzJztcbiAgICAgIGNvbnNvbGUubG9nKG1haW5Cb3hHcmlkQ29sdW1uKTtcbiAgICAgIGlmKG1haW5Cb3hHcmlkQ29sdW1uID09ICdzcGFuIDEgLyBhdXRvJykge1xuICAgICAgICBtYWluQm94LnN0eWxlLmdyaWRDb2x1bW4gPSAnc3BhbiAyIC8gYXV0byc7XG4gICAgICB9XG4gICAgICB2YXIgc3JjID0gaW1nLnNyYztcbiAgICAgIHZhciBzcGxpdHRlZCA9IHNyYy5zcGxpdCgnLicpO1xuICAgICAgc3BsaXR0ZWQgPSBzcGxpdHRlZFswXSArICdfb3JpZy5qcGcnO1xuICAgICAgaW1nLnNyYyA9IHNwbGl0dGVkO1xuICB9IGVsc2Uge1xuICAgIHNwYW4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0YXJnZXQuaW5uZXJIVE1MID0gJ1JlYWQgTW9yZSc7XG4gICAgaWYobWFpbkJveEdyaWRDb2x1bW4gPT0gJ3NwYW4gMiAvIGF1dG8nKSB7XG4gICAgICBtYWluQm94LnN0eWxlLmdyaWRDb2x1bW4gPSAnc3BhbiAxIC8gYXV0byc7XG4gICAgfVxuICAgIHZhciBzcmMgPSBpbWcuc3JjO1xuICAgIHZhciBzcGxpdHRlZCA9IHNyYy5zcGxpdCgnXycpO1xuICAgIHNwbGl0dGVkID0gc3BsaXR0ZWRbMF0gKyAnLnBuZyc7XG4gICAgaW1nLnNyYyA9IHNwbGl0dGVkO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb3N0IDogbG9zdFZpZXcsXG4gIGJvb2tpbmcgOiBib29raW5nVmlldyxcbiAgc2lnbmluIDogc2lnbkluVmlldyxcbiAgcmVnaXN0ZXIgOiByZWdpc3RlclZpZXcsXG4gIHNpZ25lZEluIDogc2lnbmVkSW5WaWV3LFxuICBwb3B1bGF0ZUJvb2tpbmdzIDogcG9wdWxhdGVCb29raW5ncyxcbiAgcG9wdWxhdGVBY2NvdW50ICA6IHBvcHVsYXRlQWNjb3VudCxcbiAgcmVhZE1vcmUgOiByZWFkTW9yZSxcbiAgc2lnbk91dCA6IHNpZ25lZE91dFZpZXdcbn1cbiJdfQ==
