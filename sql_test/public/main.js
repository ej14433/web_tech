'use strict'


function search() {
  var tripList  = document.getElementById('tripList');
  var date  = document.getElementById('date').value;
  var seats = document.getElementById('seats').value;
  var url   = 'trips?date=' + date + '&seats=' +  seats;
  var request = prepReq(url);
  var trips = [];

  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      trips = JSON.parse(request.response);
      tripList.innerHTML = '<option value="empty"></option>';
      for(var i = 0; i < trips.length; i++) {
        tripList.innerHTML += "<option value='"+ trips[i].tripId+"'>" + trips[i].time +"</option>";
      }
      tripList.value = trips[0].tripId;
    }
  }
}

function book() {
  var tripId  = document.getElementById('tripList').value;
  var seats   = document.getElementById('seats').value;
  var url     = 'book?tripId= ' + tripId + '&seats=' + seats;
  var request = prepReq(url);

  request.onreadystatechange = function () {
    if (request.readyState == XMLHttpRequest.DONE) {
      console.log(request.response);
    }
  }

}

function prepReq(url) {
  var request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();
  return request;
}
