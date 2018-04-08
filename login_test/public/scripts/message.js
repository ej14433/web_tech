'use strict';
const validate = require('./validation.js');
const views    = require('./views.js');
const req      = require('./request.js');
const user = require('./user.js');

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
