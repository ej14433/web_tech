function initMap() {
  var uluru = {lat: 52.215293, lng: -4.358254};

  var mapProp = {
    center: uluru,
    zoom : 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
  var map = new google.maps.Map(document.getElementById("map"), mapProp);
  }
