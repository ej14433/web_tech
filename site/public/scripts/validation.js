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
