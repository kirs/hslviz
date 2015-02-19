var markers = [];

var clearMarkers = function() {
  markers.forEach(function(marker, i) {
    markers[i].setMap(null);
  })

  markers = [];
}

var refreshMap = function(map) {
  console.log("refreshing...")
  $.get('/locations', function(locations) {
    clearMarkers()

    locations.forEach(function(current) {
      var position = new google.maps.LatLng(current.lat, current.lng);
      var marker = new google.maps.Marker({
          position: position,
          map: map,
          title: current.route,
          icon: "https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0"
      });

      markers.push(marker)
    })
  })
}

var initApp = function() {
  var center = new google.maps.LatLng(60.167212, 24.973745);
  var mapOptions = {
    zoom: 12,
    center: center
  }

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  setInterval(function() {
    refreshMap(map)
  }, 5000)
}
var initialize = function() {
  initApp()
}

google.maps.event.addDomListener(window, 'load', initialize);
