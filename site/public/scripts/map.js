function initMap() {
  var uluru = {lat:52.215293, lng:-4.358254};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom : 16,
    center: uluru
  });

  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
}
