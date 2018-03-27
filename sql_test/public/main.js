'use strict'
var latestSeats = 0;

window.addEventListener('load', function (e) {
  var search = document.getElementById('search');
  var book   = document.getElementById('book');
  var login  = document.getElementById('login');

  if(search) {
    search.addEventListener('click', searchAvail);
    book.addEventListener('click', bookTrip);
  }
  if(login) {
    login.addEventListener('click', loginAcc);
  }
});

function searchAvail() {
  var tripList  = document.getElementById('tripList');
  var date  = document.getElementById('date').value;
  var seats = document.getElementById('seats').value;
  var url   = 'trips?date=' + date + '&seats=' +  seats;
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

function bookTrip() {
  var tripId  = document.getElementById('tripList').value;
  var seats   = latestSeats;
  var url     = 'book?tripId=' + tripId + '&seats=' + seats;
  var request = prepGet(url);

  request.onreadystatechange = function () {
    if (request.readyState == XMLHttpRequest.DONE) {
      alert('Booked');
    }
  }

}

function prepGet(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();
  return request;
}

function prepPost(url, content) {
  var request = new XMLHttpRequest();
  request.open('POST', url);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.send(content);
  return request;
}

function loginAcc() {
  var attempt = document.getElementById('password').value;
  var user    = document.getElementById('user').value;
  var url     = '/login/attempt';
  var content = '?user=' + user + '&pass=' + attempt;
  var request = prepPost(url, content);

  request.onreadystatechange = function () {
    if (request.readyState == XMLHttpRequest.DONE) {
      alert(request.response);
    }
  }
}
