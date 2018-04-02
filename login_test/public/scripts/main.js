"use strict"
const validate = require('./validation.js');
const views      = require('./views.js');

var latestSeats = 0;

window.addEventListener('load', function (e) {

  var register = document.getElementById('register');
  var search = document.getElementById('search');
  var signin = document.getElementById('signin');
  var registerButton = document.getElementById('register-button');
  var loginButton    = document.getElementById('login-button');
  var lost   = document.getElementById('lost');
  var lostSignIn = document.getElementById('lost-signin');
  var reset  = document.getElementById('reset-password');

  register.addEventListener('click', views.register);
  loginButton.addEventListener('click', loginUser);
  signin.addEventListener('click', views.signin);
  registerButton.addEventListener('click', registerNewUser);
  lost.addEventListener('click', views.lost);
  lostSignIn.addEventListener('click', views.signin);
  search.addEventListener('click', searchAvail);
  reset.addEventListener('click', resetPassword);

});

function resetPassword() {
  var email = document.getElementById('reset-email').value;
  var params = 'email='+email;
  var url   = '/reset';
  var request = prepPost(url);
  request.send(params);

  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      if(request.response == 'Email sent') {
        views.signin();
      }
      showMessage(request.response);
    }
  }
}

function searchAvail() {
  var tripList  = document.getElementById('tripList');
  var date  = document.getElementById('date-input').value;
  var seats = document.getElementById('seats-input').value;
  var url   = '/search/?date=' + date + '&seats=' +  seats;
  var request = prepGet(url);
  var trips = [];

  var regexDate = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  var regexSeat = /[0-9]{1,2}/;
  validate.search(date, seats, function(err) {
    if (err) showMessage(err);
    if(!err) {
      request.onreadystatechange = function () {
        if(request.readyState == XMLHttpRequest.DONE) {
          trips = JSON.parse(request.response);
          tripList.innerHTML = '<option value="empty"></option>';
          if(trips.length == 0) {
            alert("There are no trips available within these values");
          } else {
            for(var i = 0; i < trips.length; i++) {
              tripList.innerHTML += "<option value='"+ trips[i].tripId+"'>" + trips[i].time +"</option>";
            }
            tripList.value = trips[0].tripId;
          }
        }
      }
      latestSeats = seats;
    }
  });
  //
  // if(seats.match(regexSeat) && date.match(regexDate) && seats > 0) {
  //
  //     }
  //
  //
  // }
  // if(seats == 0) {
  //   alert("Must search for atleast 1 person");
  // }
}

function loginUser() {
  var username  = document.getElementById('username').value;
  var password  = document.getElementById('password').value;

  validate.login(username, password, function(err) {
    if(err) showMessage(err);
    if(!err) {
      var params    = "username="+username+"&password="+password;
      var url       = "/login";
      var request   = prepPost(url);
      request.send(params);
      request.onreadystatechange = function () {
        if(request.readyState == XMLHttpRequest.DONE) {
          showMessage(request.response);
          if(request.response == 'Success') {
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
    if(err) showMessage(err);
    if(!err) {
      var params    = "username="+username+"&password="+password+"&email="+email;
      var url       = "/register";
      var request   = prepPost(url);
      request.send(params);
      request.onreadystatechange = function () {
        if(request.readyState == XMLHttpRequest.DONE) {
          if(request.response == 'success') {
            showMessage('Registered');
            views.signin();
          } else {
            showMessage(request.response);
          }
        }
      }
    }
  });
}

function showMessage(message){
  document.getElementById('error-message').innerHTML = message;
  var error = document.getElementById('error');
  error.style.display = 'grid';
  error.style.opacity = 1;
  setTimeout(function(){ error.style.opacity = 0;}, 700);
  setTimeout(function(){ error.style.display = 'none'; }, 1200);
}

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
