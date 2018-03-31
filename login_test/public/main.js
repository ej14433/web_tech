"use strict"
var latestSeats = 0;

window.addEventListener('load', function (e) {

  var register = document.getElementById('register');
  var search = document.getElementById('search');
  var signin = document.getElementById('signin');
  var registerButton = document.getElementById('register-button');
  var loginButton    = document.getElementById('login-button');
  var lost   = document.getElementById('lost');
  var lostSignIn = document.getElementById('lost-signin');

  if (signin) {
    register.addEventListener('click', registerView);
    loginButton.addEventListener('click', loginUser);
    signin.addEventListener('click', signinView);
    registerButton.addEventListener('click', registerNewUser);
    lost.addEventListener('click', lostView);
    lostSignIn.addEventListener('click', signinView);
  }
  if (search) {
    search.addEventListener('click', searchAvail);
  }

});

function signinView() {
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

function searchAvail() {
  var tripList  = document.getElementById('tripList');
  var date  = document.getElementById('date-input').value;
  var seats = document.getElementById('seats-input').value;
  var url   = '/search/?date=' + date + '&seats=' +  seats;
  var request = prepGet(url);
  var trips = [];

  var regexDate = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  var regexSeat = /[0-9]{1,2}/;

  if(seats.match(regexSeat) && date.match(regexDate) && seats > 0) {
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
  if(seats == 0) {
    alert("Must search for atleast 1 person");
  }
}

function loginUser() {
  var username  = document.getElementById('username').value;
  var password  = document.getElementById('password').value;

  validLogin(username, password, function(err) {
    if(err) showErr(err);
    if(!err) {
      var params    = "username="+username+"&password="+password;
      var url       = "/login";
      var request   = prepPost(url);
      request.send(params);

      request.onreadystatechange = function () {
        if(request.readyState == XMLHttpRequest.DONE) {
          if(request.response == 'success') {
            bookingView();
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

  validRegister(username, password, password2, email, function(err) {
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
            signinView();
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
  setTimeout(function(){ error.style.opacity = 0;}, 500);
  setTimeout(function(){ error.style.display = 'none'; }, 1000);
}

function validLogin(username, password, callback) {
  if(!password || !username) {
    callback('All field must be filled');
  }
  // if(password.length<8) {
  //   callback('All passwords are atleast 8 characters')
  // }
  else {
    callback();
  }
}

function validRegister(username, password, password2, email, callback) {
  if(!password || !username || !password2 || !email) {
    callback('All fields must be filled');
  }
  // else if (password.length < 8) {
    // callback('Password must be atleast 8 characters');
  // }
  else if(!(password === password2)) {
    callback('Passwords do not match');
  } else {
    callback();
  }
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
