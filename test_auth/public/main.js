'use strict'

window.addEventListener('load', function (e) {
  var book   = document.getElementById('book');

  if(book) {
    book.addEventListener('click', bookTrip)
  }
});

function bookTrip() {
  var url     = "/book"
  var request = prepGet(url);

  request.onreadystatechange = function() {
    if(request.readyState == XMLHttpRequest.DONE) {
      alert(request.response);
    }
  }
}

function prepGet(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();
  return request;
}
