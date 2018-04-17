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
