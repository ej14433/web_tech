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
