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