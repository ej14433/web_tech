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
