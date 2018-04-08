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
